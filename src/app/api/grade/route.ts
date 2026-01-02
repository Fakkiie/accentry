
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { FREE_DAILY_ATTEMPTS, isPro } from '@/lib/limits';
import { gradeWithAzure } from '@/lib/azure';
import { LANGS } from '@/lib/types';

function todayISO() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;
  const body = await req.json();

  const phraseId = String(body.phraseId || '');
  const referenceText = String(body.referenceText || '').trim();
  const language = body.language;
  const audioBase64 = String(body.audioBase64 || '');
  const mime = String(body.mime || 'audio/webm');

  if (!phraseId || referenceText.length < 1 || !audioBase64) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (!LANGS.some((l) => l.code === language)) {
    return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
  }

  // verify phrase belongs to user
  const { data: phrase } = await supabase
    .from('phrases')
    .select('id')
    .eq('id', phraseId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!phrase) return NextResponse.json({ error: 'Phrase not found' }, { status: 404 });

  // subscription check
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan,status')
    .eq('user_id', user.id)
    .maybeSingle();

  const pro = isPro(sub as any);

  // free usage limit
  if (!pro) {
    const day = todayISO();
    const { data: row } = await supabase
      .from('usage_limits')
      .select('attempts_used')
      .eq('user_id', user.id)
      .eq('day', day)
      .maybeSingle();

    const used = row?.attempts_used ?? 0;
    if (used >= FREE_DAILY_ATTEMPTS) {
      return NextResponse.json(
        { error: `Daily free limit reached (${FREE_DAILY_ATTEMPTS}). Upgrade for unlimited.` },
        { status: 402 }
      );
    }

    // increment
    if (row) {
      await supabase
        .from('usage_limits')
        .update({ attempts_used: used + 1 })
        .eq('user_id', user.id)
        .eq('day', day);
    } else {
      await supabase.from('usage_limits').insert({ user_id: user.id, day, attempts_used: 1 });
    }
  }

  // decode audio
  const audioBuffer = Buffer.from(audioBase64, 'base64');

  // call azure
  let scores;
  try {
    scores = await gradeWithAzure({
      audioBuffer: audioBuffer.buffer.slice(audioBuffer.byteOffset, audioBuffer.byteOffset + audioBuffer.byteLength),
      referenceText,
      language
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Azure failed' }, { status: 500 });
  }

  // store attempt
  await supabase.from('attempts').insert({
    user_id: user.id,
    phrase_id: phraseId,
    accuracy: scores.accuracy,
    fluency: scores.fluency,
    pronunciation: scores.pronunciation,
    prosody: scores.prosody,
    overall_score: scores.overall_score,
    weak_phonemes: [],
    raw: { mime, ...scores.raw }
  });

  return NextResponse.json({ scores });
}
