"use client";

import { useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

// Minimal shape of the Web Speech API — not in lib.dom.d.ts by default, and
// only Chrome/Edge/Safari (webkit-prefixed) implement it; browsers without
// support (Firefox, older Safari) just don't get the mic button rendered.
type SpeechRecognitionResultLike = { transcript: string };
type SpeechRecognitionEventLike = {
  results: { [i: number]: { [j: number]: SpeechRecognitionResultLike } & { length: number } } & {
    length: number;
  };
};
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export default function VoiceInputButton({
  onTranscript,
  accent = "#C2542D",
}: {
  onTranscript: (text: string) => void;
  accent?: string;
}) {
  const [supported] = useState(
    () =>
      typeof window !== "undefined" &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const toggle = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-NG";

    recognition.onresult = (e) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      onTranscript(transcript.trim());
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={recording ? "Stop recording" : "Speak instead of typing"}
      title={recording ? "Stop recording" : "Speak instead of typing"}
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
      style={
        recording
          ? { background: "#DC2626", color: "#fff", cursor: "pointer" }
          : { background: "var(--bg)", border: "1px solid var(--border)", color: accent, cursor: "pointer" }
      }
    >
      {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}
