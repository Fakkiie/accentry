import NeonCard from '@/components/NeonCard';

export default function Pricing() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <a href="/" className="text-sm text-white/70 hover:text-white">← Back</a>

      <h1 className="mt-6 text-4xl font-extrabold">Pricing</h1>
      <p className="mt-2 text-white/70">
        Start free. Upgrade when you want unlimited speaking.
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <NeonCard>
          <div className="text-sm text-white/60">Free</div>
          <div className="text-4xl font-extrabold mt-1">$0</div>
          <ul className="mt-4 text-sm text-white/70 list-disc pl-5 space-y-1">
            <li>10 attempts/day</li>
            <li>10 phrases max</li>
            <li>Basic score</li>
          </ul>
          <a href="/dashboard" className="mt-5 inline-flex px-4 py-3 rounded-2xl bg-white text-black font-bold">
            Start
          </a>
        </NeonCard>

        <NeonCard>
          <div className="text-sm text-white/60">Pro</div>
          <div className="text-4xl font-extrabold mt-1">$7<span className="text-lg text-white/60">/mo</span></div>
          <ul className="mt-4 text-sm text-white/70 list-disc pl-5 space-y-1">
            <li>Unlimited attempts</li>
            <li>Unlimited phrases</li>
            <li>History + breakdown</li>
          </ul>
          <a href="/upgrade" className="mt-5 inline-flex px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-fuchsia-400 text-black font-bold">
            Upgrade
          </a>
        </NeonCard>
      </div>
    </main>
  );
}
