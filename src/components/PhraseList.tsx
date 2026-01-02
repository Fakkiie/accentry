'use client';

import { useEffect, useState } from 'react';
import NeonCard from './NeonCard';
import { LANGS, type Phrase } from '@/lib/types';
import { ArrowRight, Trash2 } from 'lucide-react';

export default function PhraseList({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/phrases');
    const j = await res.json();
    setItems(j.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  async function remove(id: string) {
    const ok = confirm('Delete this phrase?');
    if (!ok) return;
    const res = await fetch(`/api/phrases?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) return alert('Failed to delete');
    load();
  }

  return (
    <NeonCard>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-lg font-semibold">Your practice queue</div>
          <div className="text-sm text-white/60">
            Tap one and speak it. No gamification. Just reps.
          </div>
        </div>
        <div className="text-xs text-white/50">
          {items.length} phrase{items.length === 1 ? '' : 's'}
        </div>
      </div>

      {loading ? (
        <div className="text-white/60 text-sm">Loading…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          Add your first phrase above.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((p) => {
            const meta = LANGS.find((l) => l.code === p.language_code)!;
            return (
              <div
                key={p.id}
                className="group rounded-2xl border border-white/10 bg-black/20 hover:bg-black/30 transition p-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-lg">{meta.badge}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/70">{meta.label}</div>
                  <div className="font-medium truncate">{p.text}</div>
                </div>
                <a
                  href={`/practice/${p.id}`}
                  className="opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white text-black font-semibold"
                >
                  Practice <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={() => remove(p.id)}
                  className="ml-1 p-2 rounded-2xl border border-white/10 hover:bg-white/5"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4 text-white/70" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </NeonCard>
  );
}
