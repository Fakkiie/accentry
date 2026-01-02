'use client';

import { useState } from 'react';
import NeonCard from './NeonCard';
import LanguagePill from './LanguagePill';
import { type LanguageCode } from '@/lib/types';
import { Plus } from 'lucide-react';

export default function PhraseComposer({
  onCreated
}: {
  onCreated: () => void;
}) {
  const [lang, setLang] = useState<LanguageCode>('es');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    const res = await fetch('/api/phrases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language_code: lang, text })
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j?.error || 'Failed to create');
      return;
    }
    setText('');
    onCreated();
  }

  return (
    <NeonCard>
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <div className="text-lg font-semibold">Add a phrase</div>
          <div className="text-sm text-white/60">
            Paste a sentence you actually want to say in real life.
          </div>
        </div>
        <LanguagePill value={lang} onChange={setLang} />
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g., Quiero pedir un café con leche, por favor."
        className="w-full h-24 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-white/20 p-3 resize-none"
      />

      <div className="mt-3 flex justify-end">
        <button
          onClick={create}
          disabled={loading || text.trim().length < 2}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-400 to-fuchsia-400 text-black font-semibold disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {loading ? 'Adding…' : 'Add'}
        </button>
      </div>
    </NeonCard>
  );
}
