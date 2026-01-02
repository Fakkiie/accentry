import PhraseComposer from '@/components/PhraseComposer';
import PhraseList from '@/components/PhraseList';
import NeonCard from '@/components/NeonCard';
import { supabaseServer } from '@/lib/supabase/server';
import { isPro, FREE_DAILY_ATTEMPTS, FREE_PHRASE_LIMIT } from '@/lib/limits';

export default async function Dashboard() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan,status,current_period_end')
    .eq('user_id', user.id)
    .maybeSingle();

  const pro = isPro(sub as any);

  // Count phrases for free cap display
  const { count: phraseCount } = await supabase
    .from('phrases')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 pb-28">
      <header className="flex items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-extrabold">Dashboard</div>
          <div className="text-sm text-white/60">
            {pro ? 'Pro active' : `Free: ${FREE_DAILY_ATTEMPTS}/day, ${FREE_PHRASE_LIMIT} phrases cap`}
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href="/upgrade"
            className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
          >
            {pro ? 'Manage' : 'Upgrade'}
          </a>
          <form action="/api/auth/signout" method="post">
            <button className="px-4 py-2 rounded-2xl bg-white text-black font-semibold text-sm">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mt-6 grid gap-4">
        <NeonCard>
          <div className="text-sm text-white/70">
            Signed in as <span className="text-white font-semibold">{user.email}</span>
          </div>
          <div className="text-xs text-white/50 mt-1">
            Phrases: {phraseCount ?? 0} {pro ? '' : `(Free cap: ${FREE_PHRASE_LIMIT})`}
          </div>
        </NeonCard>

        {/* Client widgets */}
        <DashboardClient />
      </div>
    </main>
  );
}

// Client island
function DashboardClient() {
  // A small trick: render client components in a separate file? We'll inline via dynamic import.
  // Next will treat it as server by default, so we render client components in a wrapper.
  // eslint-disable-next-line @next/next/no-async-client-component
  return (
    <div>
      {/* @ts-expect-error Server component wrapping client children */}
      <DashboardClientInner />
    </div>
  );
}

// Put this in same file but mark use client via a nested component import pattern:
import DashboardClientInner from './dashboardClientInner';
