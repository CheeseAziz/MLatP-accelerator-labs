"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SAMPLE_DOCS } from "./knowledge";
import type { Conversation, Doc, EmailDraft, SentEmail, View } from "./types";

const KEY = "rivertree-assistant-v1";

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

type Persisted = { conversations: Conversation[]; docs: Doc[]; sent: SentEmail[] };

function seed(): Persisted {
  return {
    conversations: [],
    sent: [],
    docs: SAMPLE_DOCS.map((d) => ({
      id: uid(),
      name: d.name,
      type: d.type,
      text: d.text,
      size: new Blob([d.text]).size,
      addedAt: Date.now(),
    })),
  };
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Persisted;
  } catch {}
  return seed();
}

const emptyDraft = (): EmailDraft => ({ to: "", cc: "", subject: "", body: "", attachmentIds: [] });

function useAppState() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("chat");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [sent, setSent] = useState<SentEmail[]>([]);
  const [draft, setDraft] = useState<EmailDraft>(emptyDraft);
  const [pendingDocIds, setPendingDocIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const p = load();
    setConversations(p.conversations);
    setDocs(p.docs);
    setSent(p.sent);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ conversations, docs, sent }));
    } catch {}
  }, [ready, conversations, docs, sent]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const active = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [conversations, activeId]);

  const upsertConversation = useCallback((c: Conversation) => {
    setConversations((prev) => [c, ...prev.filter((x) => x.id !== c.id)]);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((cur) => (cur === id ? null : cur));
  }, []);

  const newChat = useCallback(() => {
    setActiveId(null);
    setPendingDocIds([]);
    setView("chat");
  }, []);

  const addDocs = useCallback((items: Doc[]) => setDocs((prev) => [...items, ...prev]), []);
  const removeDoc = useCallback((id: string) => setDocs((prev) => prev.filter((d) => d.id !== id)), []);

  const openComposer = useCallback((d: Partial<EmailDraft>) => {
    setDraft({ ...emptyDraft(), ...d });
    setView("email");
  }, []);

  const askAboutDoc = useCallback((docId: string) => {
    setActiveId(null);
    setPendingDocIds([docId]);
    setView("chat");
  }, []);

  return {
    ready, view, setView,
    conversations, active, activeId, setActiveId, upsertConversation, deleteConversation, newChat,
    docs, addDocs, removeDoc,
    sent, setSent,
    draft, setDraft, openComposer, resetDraft: () => setDraft(emptyDraft()),
    pendingDocIds, setPendingDocIds, askAboutDoc,
    toast, notify,
  };
}

type AppState = ReturnType<typeof useAppState>;
const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const state = useAppState();
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}

const TEXT_EXT = /\.(txt|md|csv|json|html?|xml|rtf|eml)$/i;

/** Turns browser File objects into Docs with extracted text. */
export async function filesToDocs(files: FileList | File[]): Promise<{ docs: Doc[]; failed: string[] }> {
  const docs: Doc[] = [];
  const failed: string[] = [];
  for (const f of Array.from(files)) {
    try {
      let text = "";
      if (TEXT_EXT.test(f.name) || f.type.startsWith("text/")) {
        text = await f.text();
      } else if (/\.(pdf|docx)$/i.test(f.name)) {
        const fd = new FormData();
        fd.append("file", f);
        const res = await fetch("/api/extract", { method: "POST", body: fd });
        if (!res.ok) throw new Error();
        text = (await res.json()).text ?? "";
      } else {
        text = "";
      }
      docs.push({ id: uid(), name: f.name, size: f.size, type: f.type, text, addedAt: Date.now() });
    } catch {
      failed.push(f.name);
    }
  }
  return { docs, failed };
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
