import NeonCard from '@/components/NeonCard';
import { supabaseServer } from '@/lib/supabase/server';
import { isPro } from '@/lib/limits';

export default async function UpgradePage() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan,status,current_period_end')
    .eq('user_id', user.id)
    .maybeSingle();

  const pro = isPro(sub as any);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <a href="/dashboard" className="text-sm text-white/70 hover:text-white">
        ← Back
      </a>

      <h1 className="mt-6 text-4xl font-extrabold">Upgrade</h1>
      <p className="mt-2 text-white/70">
        Pro removes limits and unlocks unlimited speaking reps.
      </p>

      <div className="mt-6 grid gap-4">
        <NeonCard>
          <div className="text-sm text-white/60">Current plan</div>
          <div className="text-2xl font-bold mt-1">{pro ? 'Pro' : 'Free'}</div>
          <div className="text-sm text-white/60 mt-2">
            Status: {sub?.status ?? 'free'}
          </div>
        </NeonCard>

        <NeonCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xl font-bold">Pro — $7/mo</div>
              <ul className="mt-2 text-sm text-white/70 list-disc pl-5 space-y-1">
                <li>Unlimited attempts</li>
                <li>Unlimited phrases</li>
                <li>Detailed grading + history</li>
              </ul>
            </div>

            <form action="/api/stripe/create-checkout" method="post">
              <button className="px-5 py-3 rounded-2xl bg-white text-black font-bold">
                {pro ? 'Manage billing (soon)' : 'Upgrade with Stripe'}
              </button>
            </form>
          </div>

          <div className="text-xs text-white/50 mt-3">
            MVP note: “Manage billing” can be a Stripe Customer Portal later. For now: upgrade + cancel in Stripe dashboard.
          </div>
        </NeonCard>
      </div>
    </main>
  );
}
