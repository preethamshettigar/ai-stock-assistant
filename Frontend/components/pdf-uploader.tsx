"use client";

import { useState } from "react";
import { uploadDocument } from "@/lib/api-client";

export function PdfUploader({ onUploaded, onError }: { onUploaded: (id: string, filename: string) => void; onError: (message: string) => void }) {
  const [loading, setLoading] = useState(false);
  async function select(file: File | undefined) { if (!file) return; setLoading(true); try { const result = await uploadDocument(file); onUploaded(result.document_id, result.filename); } catch (error) { onError(error instanceof Error ? error.message : "PDF processing failed"); } finally { setLoading(false); } }
  return <div className="upload-box"><label className="muted">Upload PDF for Document QA</label><input type="file" accept="application/pdf" disabled={loading} onChange={(event) => void select(event.target.files?.[0])} />{loading && <span className="muted">Indexing document...</span>}</div>;
}
