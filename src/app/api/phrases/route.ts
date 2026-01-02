import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { FREE_PHRASE_LIMIT, isPro } from '@/lib/limits';
import { LANGS } from '@/lib/types';

export async function GET() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const { data: items } = await supabase
    .from('phrases')
    .select('id,language_code,text,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ items: items || [] });
}

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const body = await req.json();
  const language_code = body.language_code;
  const text = String(body.text || '').trim();

  if (!LANGS.some((l) => l.code === language_code)) {
    return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
  }
  if (text.length < 2) {
    return NextResponse.json({ error: 'Text too short' }, { status: 400 });
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan,status')
    .eq('user_id', user.id)
    .maybeSingle();

  const pro = isPro(sub as any);
  if (!pro) {
    const { count } = await supabase
      .from('phrases')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((count ?? 0) >= FREE_PHRASE_LIMIT) {
      return NextResponse.json(
        { error: `Free limit reached (${FREE_PHRASE_LIMIT} phrases). Upgrade to add more.` },
        { status: 402 }
      );
    }
  }

  const { error } = await supabase.from('phrases').insert({
    user_id: user.id,
    language_code,
    text,
    source: 'manual'
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabase
    .from('phrases')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
