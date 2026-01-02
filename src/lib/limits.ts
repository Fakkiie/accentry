export const FREE_DAILY_ATTEMPTS = 10;
export const FREE_PHRASE_LIMIT = 10;

export function isPro(sub: { plan: string; status: string } | null) {
  if (!sub) return false;
  if (sub.plan !== 'pro') return false;
  return sub.status === 'active' || sub.status === 'past_due';
}
