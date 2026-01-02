import { LANGS, type LanguageCode } from './types';

function localeFor(lang: LanguageCode) {
  return LANGS.find((l) => l.code === lang)?.locale ?? 'es-ES';
}

/**
 * MVP-grade Azure Pronunciation Assessment call.
 * NOTE: We assume MediaRecorder produces webm/opus in most browsers.
 * If Azure rejects content-type for a browser/device, switch to audio/wav by
 * transcoding server-side later. For MVP, this works in modern Chrome-based browsers.
 */
export async function gradeWithAzure(opts: {
  audioBuffer: ArrayBuffer;
  referenceText: string;
  language: LanguageCode;
}) {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  // Cheap MVP fallback (lets you test UI + funnel even before Azure is wired)
  if (!key || !region) {
    const base = 60 + Math.random() * 30;
    return {
      overall_score: Math.round(base),
      accuracy: Math.round(base - 3),
      fluency: Math.round(base + 2),
      pronunciation: Math.round(base),
      prosody: Math.round(base - 6),
      raw: { mock: true }
    };
  }

  const locale = localeFor(opts.language);

  const paConfig = {
    ReferenceText: opts.referenceText,
    GradingSystem: 'HundredMark',
    Granularity: 'Phoneme',
    Dimension: 'Comprehensive',
    EnableMiscue: true,
    EnableProsodyAssessment: true
  };

  const pronAssessment = Buffer.from(JSON.stringify(paConfig)).toString('base64');

  const url =
    `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1` +
    `?language=${encodeURIComponent(locale)}&format=detailed&profanity=masked`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'audio/webm; codecs=opus',
      'Pronunciation-Assessment': pronAssessment,
      Accept: 'application/json'
    },
    body: Buffer.from(opts.audioBuffer)
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Azure error: ${res.status} ${JSON.stringify(json).slice(0, 600)}`);
  }

  const nbest = json?.NBest?.[0];
  const pa = nbest?.PronunciationAssessment;

  const overall = pa?.PronScore ?? pa?.PronunciationScore ?? null;

  return {
    overall_score: overall,
    accuracy: pa?.AccuracyScore ?? null,
    fluency: pa?.FluencyScore ?? null,
    pronunciation: pa?.PronunciationScore ?? overall,
    prosody: pa?.ProsodyScore ?? null,
    raw: json
  };
}
