import clsx from 'clsx';
import { LANGS, type LanguageCode } from '@/lib/types';

export default function LanguagePill({
  value,
  onChange
}: {
  value: LanguageCode;
  onChange: (v: LanguageCode) => void;
}) {
  return (
    <div className="inline-flex gap-2 rounded-2xl bg-white/5 border border-white/10 p-1">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={clsx(
            'px-3 py-2 rounded-xl text-sm transition select-none',
            value === l.code
              ? 'bg-white/12 border border-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]'
              : 'opacity-70 hover:opacity-100'
          )}
        >
          <span className="mr-2">{l.badge}</span>
          {l.label}
        </button>
      ))}
    </div>
  );
}
