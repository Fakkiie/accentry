import clsx from 'clsx';
import type { ReactNode } from 'react';

export default function NeonCard({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.35)]',
        'before:absolute before:inset-0 before:rounded-3xl before:pointer-events-none',
        'before:bg-gradient-to-br before:from-sky-500/20 before:via-fuchsia-500/10 before:to-emerald-500/10',
        'overflow-hidden',
        className
      )}
    >
      <div className="relative p-5">{children}</div>
    </div>
  );
}
