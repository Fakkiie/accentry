import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // We set metadata.supabase_user_id on checkout session; subscription updates might not have metadata,
  // so we derive user via customer email where possible. For MVP we handle main happy path:
  // checkout.session.completed and invoice.payment_succeeded / customer.subscription.updated.

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session?.metadata?.supabase_user_id as string | undefined;
    const customerId = session?.customer as string | undefined;
    const subscriptionId = session?.subscription as string | undefined;

    if (userId) {
      const sub = subscriptionId
        ? await stripe.subscriptions.retrieve(subscriptionId)
        : null;

      await admin.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: customerId ?? null,
        stripe_subscription_id: subscriptionId ?? null,
        plan: 'pro',
        status: sub?.status ? mapStripeStatus(sub.status) : 'active',
        current_period_end: sub?.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString()
      });
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any;
    const subscriptionId = subscription.id as string;
    const customerId = subscription.customer as string;

    // Find user row by subscription/customer
    const { data: rows } = await admin
      .from('subscriptions')
      .select('user_id')
      .or(`stripe_subscription_id.eq.${subscriptionId},stripe_customer_id.eq.${customerId}`)
      .limit(1);

    const userId = rows?.[0]?.user_id;
    if (userId) {
      const status = mapStripeStatus(subscription.status);
      const plan = status === 'active' || status === 'past_due' ? 'pro' : 'free';

      await admin.from('subscriptions').update({
        plan,
        status,
        current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString()
      }).eq('user_id', userId);
    }
  }

  return NextResponse.json({ received: true });
}

function mapStripeStatus(s: string): 'active' | 'past_due' | 'canceled' {
  if (s === 'active' || s === 'trialing') return 'active';
  if (s === 'past_due' || s === 'unpaid') return 'past_due';
  return 'canceled';
}
