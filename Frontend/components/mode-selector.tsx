"use client";

import type { Mode } from "@/lib/types";

const modes: Array<[Mode, string]> = [["general", "🧠 General QA"], ["research", "🔍 Research QA"], ["document", "🧾 Document QA"], ["portfolio", "💼 Portfolio"]];

export function ModeSelector({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return <div className="mode-list">{modes.map(([value, label]) => <button key={value} className={`mode ${mode === value ? "active" : ""}`} onClick={() => onChange(value)}>{label}{value === "portfolio" && <span className="muted"> (soon)</span>}</button>)}</div>;
}
