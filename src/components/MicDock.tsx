'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Square, Upload, Volume2 } from 'lucide-react';

type Props = {
  onRecorded: (blob: Blob, mime: string) => void;
  disabled?: boolean;
};

export default function MicDock({ onRecorded, disabled }: Props) {
  const [recording, setRecording] = useState(false);
  const [readyBlob, setReadyBlob] = useState<Blob | null>(null);
  const [mime, setMime] = useState<string>('audio/webm');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const supportedMime = useMemo(() => {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/mpeg'
    ];
    const found = candidates.find((c) => MediaRecorder.isTypeSupported?.(c));
    return found || '';
  }, []);

  useEffect(() => {
    if (supportedMime) setMime(supportedMime);
  }, [supportedMime]);

  async function start() {
    if (disabled) return;
    setReadyBlob(null);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const mr = new MediaRecorder(stream, supportedMime ? { mimeType: supportedMime } : undefined);
    mediaRecorderRef.current = mr;
    chunksRef.current = [];

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mr.mimeType || mime });
      setReadyBlob(blob);
      onRecorded(blob, mr.mimeType || mime);
      // stop tracks
      stream.getTracks().forEach((t) => t.stop());
    };

    mr.start();
    setRecording(true);
  }

  function stop() {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    mr.stop();
    setRecording(false);
  }

  function play() {
    if (!readyBlob) return;
    const url = URL.createObjectURL(readyBlob);
    const audio = new Audio(url);
    audio.play();
    audio.onended = () => URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 px-4 z-50">
      <div className="max-w-3xl mx-auto rounded-[28px] border border-white/10 bg-black/35 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="p-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="text-sm font-semibold">Accentry Mic Dock</div>
            <div className="text-xs text-white/60">
              Tap to record. Keep it under ~10 seconds for cheapest scoring.
            </div>
          </div>

          {readyBlob && (
            <button
              onClick={play}
              className="p-3 rounded-2xl border border-white/10 hover:bg-white/5"
              aria-label="Play"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          )}

          {recording ? (
            <button
              onClick={stop}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white text-black font-bold"
            >
              <Square className="w-5 h-5" />
              Stop
            </button>
          ) : (
            <button
              onClick={start}
              disabled={disabled}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-fuchsia-400 text-black font-bold disabled:opacity-50"
            >
              <Mic className="w-5 h-5" />
              Record
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-xs text-white/50">
            <Upload className="w-4 h-4" />
            auto-submit on stop
          </div>
        </div>
      </div>
    </div>
  );
}
