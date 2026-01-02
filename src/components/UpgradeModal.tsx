'use client';

import NeonCard from './NeonCard';
import { X, Zap } from 'lucide-react';

export default function UpgradeModal({
  open,
  message,
  onClose
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <NeonCard>
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-lg font-semibold">
                <Zap className="w-5 h-5" /> Upgrade to Pro
              </div>
              <div className="text-sm text-white/70 mt-1">{message}</div>
            </div>
            <button onClick={onClose} className="p-2 rounded-2xl border border-white/10 hover:bg-white/5">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="font-semibold">Pro ($7/mo)</div>
              <ul className="text-sm text-white/70 mt-1 list-disc pl-5 space-y-1">
                <li>Unlimited speaking attempts</li>
                <li>Unlimited phrases</li>
                <li>Detailed scoring + history</li>
              </ul>
            </div>

            <a
              href="/upgrade"
              className="mt-2 inline-flex justify-center items-center px-4 py-3 rounded-2xl bg-white text-black font-bold"
            >
              Go to Upgrade
            </a>
          </div>
        </NeonCard>
      </div>
    </div>
  );
}
