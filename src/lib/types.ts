export type LanguageCode = 'es' | 'fr' | 'it';

export const LANGS: { code: LanguageCode; label: string; badge: string; locale: string }[] = [
  { code: 'es', label: 'Spanish', badge: '🔥', locale: 'es-ES' },
  { code: 'fr', label: 'French', badge: '✨', locale: 'fr-FR' },
  { code: 'it', label: 'Italian', badge: '🍋', locale: 'it-IT' }
];

export type Phrase = {
  id: string;
  language_code: LanguageCode;
  text: string;
  created_at: string;
};

export type Subscription = {
  plan: 'free' | 'pro';
  status: 'active' | 'past_due' | 'canceled';
  current_period_end: string | null;
};
