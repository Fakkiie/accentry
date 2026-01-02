import AuthGate from '@/components/AuthGate';
import NeonCard from '@/components/NeonCard';
import { ArrowRight, AudioLines, Sparkles } from 'lucide-react';

export default function Home({ searchParams }: { searchParams: { signin?: string } }) {
  const showSignin = searchParams?.signin === '1';

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold">Accentry</div>
            <div className="text-xs text-white/60">Pronounce your own phrases.</div>
          </div>
        </div>
        <a
          href="/pricing"
          className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
        >
          Pricing
        </a>
      </header>

      <div className="mt-10 grid md:grid-cols-2 gap-6 items-start">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Speak like you mean it.
            <span className="block text-white/70 mt-2">
              Get pronunciation grading on <span className="text-white">your own</span> vocabulary.
            </span>
          </h1>

          <div className="mt-6 grid gap-3">
            {[
              ['Real grades', 'Accuracy, fluency, prosody — not “correct/incorrect”.'],
              ['Your content', 'Paste sentences you actually want to say.'],
              ['Fast reps', 'Record → grade → retry loops that compound.']
            ].map(([t, d]) => (
              <NeonCard key={t}>
                <div className="font-semibold">{t}</div>
                <div className="text-sm text-white/70 mt-1">{d}</div>
              </NeonCard>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-bold"
            >
              Launch Lab <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-semibold"
            >
              <AudioLines className="w-4 h-4" />
              See how it works
            </a>
          </div>
        </div>

        <div className="md:mt-6">
          {showSignin ? (
            <AuthGate />
          ) : (
            <NeonCard>
              <div className="text-lg font-semibold">Try it free</div>
              <div className="text-sm text-white/70 mt-1">
                Free includes 10 speaking attempts/day + 10 phrases. Upgrade when you hit the cap.
              </div>
              <div className="mt-4">
                <AuthGate compact />
              </div>
            </NeonCard>
          )}
        </div>
      </div>

      <footer className="mt-12 text-xs text-white/50">
        © {new Date().getFullYear()} Accentry
      </footer>
    </main>
  );
}
