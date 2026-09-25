"use client";

import { useState } from "react";
import { ModeSelector } from "@/components/mode-selector";
import { MessageList } from "@/components/message-list";
import { PdfUploader } from "@/components/pdf-uploader";
import { VoiceRecorder } from "@/components/voice-recorder";
import { askDocument, askGeneral, askResearch, generateSpeech } from "@/lib/api-client";
import type { ChatMessage, Mode } from "@/lib/types";

export default function Home() {
  const [mode, setMode] = useState<Mode>("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [lastCompany, setLastCompany] = useState<string | null>(null);
  const [lastIntent, setLastIntent] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");

  const voiceEnabled = mode === "general" || mode === "research";
  const textEnabled = mode === "general" || mode === "research" || mode === "document";

  async function submit(text = input) {
    const query = text.trim();
    if (!query || loading || !textEnabled) return;
    setInput(""); setError(""); setLoading(true);
    setMessages((old) => [...old, { id: crypto.randomUUID(), role: "user", content: query }]);
    try {
      let answer = "";
      if (mode === "general") answer = (await askGeneral(query)).answer;
      else if (mode === "research") { const data = await askResearch(query, lastCompany, lastIntent); answer = data.answer; setLastCompany(data.company); setLastIntent(data.intent); }
      else if (mode === "document") { if (!documentId) throw new Error("Upload and process a PDF first."); answer = (await askDocument(documentId, query)).answer; }
      setMessages((old) => [...old, { id: crypto.randomUUID(), role: "assistant", content: answer }]);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setLoading(false); }
  }

  async function speak(text: string) {
    if (speaking) return;
    setSpeaking(true); setError("");
    try { const audio = new Audio(URL.createObjectURL(await generateSpeech(text))); audio.onended = () => { URL.revokeObjectURL(audio.src); setSpeaking(false); }; await audio.play(); }
    catch (e) { setSpeaking(false); setError(e instanceof Error ? e.message : "Unable to play audio."); }
  }

  function changeMode(next: Mode) { setMode(next); setError(""); setInput(""); }
  function clearChat() { setMessages([]); setLastCompany(null); setLastIntent(null); setError(""); }

  const title = mode === "research" ? "Company Research" : mode === "general" ? "Finance Assistant" : mode === "document" ? "Document QA" : "Portfolio Management";
  return <div className="shell"><aside className="sidebar"><div className="brand">AI Stock Assistant</div><p className="muted">Research companies, ask finance questions, and use voice AI.</p><ModeSelector mode={mode} onChange={changeMode} />{mode === "document" && <PdfUploader onUploaded={(id, filename) => { setDocumentId(id); setDocumentName(filename); setError(""); }} onError={setError} />}{documentName && <p className="muted">Indexed: {documentName}</p>}<button className="secondary" onClick={clearChat}>Clear chat</button><p className="muted" style={{ marginTop: 30 }}>For informational purposes only. Not financial advice.</p></aside><main className="main"><header className="header"><div><h1>{title}</h1><p className="muted">{loading ? "Thinking..." : speaking ? "Playing ElevenLabs audio..." : "FastAPI backend on Render"}</p></div></header><MessageList messages={messages} onSpeak={(text) => void speak(text)} />{error && <p className="error">{error}</p>}{mode === "portfolio" ? <div className="empty-state"><h2>Portfolio Management is under development</h2><p className="muted">This mode is reserved for a future portfolio module. General QA, Research QA, and Document QA are available.</p></div> : <><p className="muted voice-help">{voiceEnabled ? "Voice input uses AssemblyAI speech-to-text. 🔊 Read aloud uses ElevenLabs text-to-speech." : "Document QA accepts text questions only. 🔊 Read aloud is available for generated answers."}</p><div className="composer">{voiceEnabled && <VoiceRecorder onTranscript={(transcript) => { setInput(transcript); void submit(transcript); }} onError={setError} />}<textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void submit(); } }} placeholder={mode === "research" ? "Ask about a company, price, financials, news..." : mode === "document" ? "Ask a text question about your PDF..." : "Ask anything about the stock market..."} /><button className="primary" onClick={() => void submit()} disabled={loading}>{loading ? "..." : "Send"}</button></div></>}</main></div>;
}
