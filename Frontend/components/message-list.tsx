import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { ChatMessage } from "@/lib/types";

export function MessageList({
  messages,
  onSpeak,
}: {
  messages: ChatMessage[];
  onSpeak: (text: string) => void;
}) {
  if (!messages.length) {
    return (
      <div className="messages">
        <p className="muted">
          Ask a general finance question or switch to Research QA.
        </p>
      </div>
    );
  }

  return (
    <div className="messages">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message ${message.role}`}
        >
          <div className="markdown-content">
            {message.role === "assistant" ? (
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              message.content
            )}
          </div>

          {message.role === "assistant" && (
            <button
              className="speak-button"
              onClick={() => onSpeak(message.content)}
            >
              Read aloud
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
