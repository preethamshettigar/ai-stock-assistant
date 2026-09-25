"use client";

import { useRef, useState } from "react";
import { transcribe } from "@/lib/api-client";

export function VoiceRecorder({ onTranscript, onError }: { onTranscript: (text: string) => void; onError: (message: string) => void }) {
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);

  async function toggle() {
    if (recording && recorder.current) { recorder.current.stop(); setRecording(false); return; }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media; chunks.current = [];
      const instance = new MediaRecorder(media);
      instance.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data); };
      instance.onstop = async () => { media.getTracks().forEach((track) => track.stop()); setProcessing(true); try { const result = await transcribe(new Blob(chunks.current, { type: instance.mimeType || "audio/webm" })); if (!result.transcript) throw new Error("No speech was detected"); onTranscript(result.transcript); } catch (error) { onError(error instanceof Error ? error.message : "Transcription failed"); } finally { setProcessing(false); } };
      recorder.current = instance; instance.start(); setRecording(true);
    } catch (error) { onError(error instanceof Error ? error.message : "Microphone permission was denied"); }
  }

  return <button className="secondary" onClick={() => void toggle()} disabled={processing}>{processing ? "Transcribing..." : recording ? "Stop" : "Voice"}</button>;
}
