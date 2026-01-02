import { NextResponse } from 'next/server';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { stripe, appUrl } from '@/lib/stripe';

export async function POST() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!;
  if (!priceId) return NextResponse.json({ error: 'Missing price id' }, { status: 500 });

  // Ensure a subscriptions row exists (so app can read plan)
  const admin = supabaseAdmin();
  await admin.from('subscriptions').upsert({
    user_id: user.id,
    plan: 'free',
    status: 'active',
    updated_at: new Date().toISOString()
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: appUrl('/dashboard?upgraded=1'),
    cancel_url: appUrl('/upgrade'),
    customer_email: user.email ?? undefined,
    metadata: { supabase_user_id: user.id }
  });

  return NextResponse.redirect(session.url!, 303);
}
