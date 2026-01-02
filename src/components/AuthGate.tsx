'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import NeonCard from './NeonCard';
import { Mail, Sparkles } from 'lucide-react';

export default function AuthGate({ compact = false }: { compact?: boolean }) {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, bounce to dashboard
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) window.location.href = '/dashboard';
    });
  }, [supabase]);

  async function sendMagicLink() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    });
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <NeonCard className={compact ? 'p-0' : ''}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 opacity-80" />
        <div className="text-lg font-semibold">Sign in</div>
      </div>
      <div className="text-white/70 text-sm mb-4">
        Magic link login. No password. Fast.
      </div>

      {sent ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
          Sent. Check your inbox for the magic link.
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-white/20"
            />
          </div>
          <button
            onClick={sendMagicLink}
            disabled={loading || !email.includes('@')}
            className="px-4 py-2 rounded-2xl bg-white text-black font-semibold disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send link'}
          </button>
        </div>
      )}
    </NeonCard>
  );
}
