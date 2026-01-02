import NeonCard from '@/components/NeonCard';
import MicDock from '@/components/MicDock';
import ScorePanel from '@/components/ScorePanel';
import UpgradeModal from '@/components/UpgradeModal';
import { supabaseServer } from '@/lib/supabase/server';

export default async function PracticePage({ params }: { params: { phraseId: string } }) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;
  const { data: phrase } = await supabase
    .from('phrases')
    .select('*')
    .eq('id', params.phraseId)
    .eq('user_id', user.id)
    .single();

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 pb-28">
      <header className="flex items-center justify-between gap-4">
        <a href="/dashboard" className="text-sm text-white/70 hover:text-white">
          ← Back
        </a>
        <a href="/upgrade" className="text-sm px-4 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
          Upgrade
        </a>
      </header>

      <div className="mt-6 grid gap-4">
        <NeonCard>
          <div className="text-sm text-white/60">Say this:</div>
          <div className="mt-2 text-2xl md:text-3xl font-extrabold leading-tight">
            {phrase.text}
          </div>
          <div className="mt-3 text-sm text-white/60">
            Tip: Speak naturally, not robot-slow. Keep it under ~10 seconds.
          </div>
        </NeonCard>

        {/* client practice UI */}
        {/* @ts-expect-error Server component embedding client */}
        <PracticeClient phraseId={phrase.id} phraseText={phrase.text} languageCode={phrase.language_code} />
      </div>
    </main>
  );
}

import PracticeClient from './practiceClient';
