'use client';

import { useState } from 'react';
import MicDock from '@/components/MicDock';
import ScorePanel from '@/components/ScorePanel';
import UpgradeModal from '@/components/UpgradeModal';
import { type LanguageCode } from '@/lib/types';

export default function PracticeClient({
  phraseId,
  phraseText,
  languageCode
}: {
  phraseId: string;
  phraseText: string;
  languageCode: LanguageCode;
}) {
  const [scores, setScores] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState('');

  async function onRecorded(blob: Blob, mime: string) {
    setBusy(true);
    setScores(null);

    try {
      const b64 = await blobToBase64(blob);

      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phraseId,
          referenceText: phraseText,
          language: languageCode,
          audioBase64: b64,
          mime
        })
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 402) {
          setUpgradeMsg(j?.error || 'Upgrade to continue.');
          setUpgradeOpen(true);
          return;
        }
        throw new Error(j?.error || 'Failed to grade');
      }

      setScores(j.scores);
    } catch (e: any) {
      alert(e.message || 'Error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <ScorePanel
        scores={scores}
        coaching={
          scores?.overall_score >= 85
            ? 'Clean. Now increase speed slightly and keep the same clarity.'
            : scores?.overall_score >= 70
            ? 'Good baseline. Focus on smoother rhythm + crisp endings.'
            : 'Slow it down 10%. Emphasize consonants and keep vowels open.'
        }
      />

      {busy && (
        <div className="text-sm text-white/60">
          Scoring… (this is where Azure runs)
        </div>
      )}

      <UpgradeModal open={upgradeOpen} message={upgradeMsg} onClose={() => setUpgradeOpen(false)} />

      <MicDock onRecorded={onRecorded} disabled={busy} />
    </div>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result || '');
      const comma = s.indexOf(',');
      resolve(comma >= 0 ? s.slice(comma + 1) : s);
    };
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
