'use client';

import NeonCard from './NeonCard';

function meter(v: number | null | undefined) {
  const n = typeof v === 'number' ? v : 0;
  const clamped = Math.max(0, Math.min(100, n));
  return `${clamped}%`;
}

export default function ScorePanel({
  scores,
  coaching
}: {
  scores: {
    overall_score: number | null;
    accuracy: number | null;
    fluency: number | null;
    pronunciation: number | null;
    prosody: number | null;
  } | null;
  coaching?: string;
}) {
  if (!scores) return null;

  return (
    <NeonCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white/60">Overall</div>
          <div className="text-4xl font-extrabold">
            {scores.overall_score ?? '—'}
            <span className="text-lg text-white/60">/100</span>
          </div>
          <div className="mt-2 text-sm text-white/70">
            {coaching || 'Try again and aim for smoother rhythm + cleaner consonants.'}
          </div>
        </div>

        <div className="w-44">
          <div className="text-xs text-white/50 mb-2">Breakdown</div>
          {[
            ['Accuracy', scores.accuracy],
            ['Fluency', scores.fluency],
            ['Pronunciation', scores.pronunciation],
            ['Prosody', scores.prosody]
          ].map(([label, v]) => (
            <div key={label} className="mb-2">
              <div className="flex justify-between text-xs text-white/60">
                <span>{label}</span>
                <span>{v ?? '—'}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-white/60" style={{ width: meter(v as any) }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </NeonCard>
  );
}
