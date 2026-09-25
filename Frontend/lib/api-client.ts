import type { ResearchResponse } from "./types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function json<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || data.error || "Backend request failed");
  return data as T;
}

export function askGeneral(query: string) {
  return json<{ answer: string }>("/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
}

export function askResearch(query: string, lastCompany: string | null, lastIntent: string | null) {
  return json<ResearchResponse>("/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, last_company: lastCompany, last_intent: lastIntent }) });
}

export async function transcribe(file: Blob) {
  const form = new FormData(); form.append("audio", file, "voice.webm");
  return json<{ transcript: string }>("/transcribe", { method: "POST", body: form });
}

export async function generateSpeech(text: string) {
  const response = await fetch(`${API_URL}/speak`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
  if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.detail || "Text-to-speech failed"); }
  return response.blob();
}

export async function uploadDocument(file: File) {
  const form = new FormData(); form.append("file", file);
  return json<{ document_id: string; filename: string; chunks: number }>("/documents", { method: "POST", body: form });
}

export function askDocument(documentId: string, query: string) {
  return json<{ answer: string }>(`/documents/${documentId}/ask`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
}
