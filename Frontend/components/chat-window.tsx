import type { ChatMessage } from "@/lib/types";
import { MessageList } from "./message-list";

export function ChatWindow({ messages, onSpeak }: { messages: ChatMessage[]; onSpeak: (text: string) => void }) {
  return <MessageList messages={messages} onSpeak={onSpeak} />;
}
