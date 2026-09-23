export type Doc = {
  id: string;
  name: string;
  size: number;
  type: string;
  text: string;
  addedAt: number;
};

export type EmailDraft = {
  to: string;
  cc?: string;
  subject: string;
  body: string;
  attachmentIds?: string[];
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  docIds?: string[];
  email?: EmailDraft;
  sources?: string[];
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

export type SentEmail = EmailDraft & {
  id: string;
  sentAt: number;
  demo: boolean;
};

export type View = "chat" | "documents" | "email";

/** Shape sent to /api/chat. */
export type ChatRequest = {
  messages: { role: "user" | "assistant"; content: string }[];
  docs: { name: string; text: string }[];
};

export type ChatResponse = {
  content: string;
  email?: EmailDraft;
  sources?: string[];
  engine: "claude" | "local";
};
