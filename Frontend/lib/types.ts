export type Mode = "general" | "research" | "document" | "portfolio";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type ResearchResponse = {
  answer: string;
  company: string | null;
  intent: string | null;
};
