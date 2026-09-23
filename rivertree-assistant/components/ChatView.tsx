"use client";

import { useEffect, useRef, useState } from "react";
import { filesToDocs, uid, useApp } from "@/lib/store";
import type { ChatResponse, Conversation, EmailDraft, Message } from "@/lib/types";
import { ArrowUpIcon, ClipIcon, CopyIcon, DocIcon, MailIcon, UploadIcon, XIcon } from "./Icons";
import Markdown from "./Markdown";

// Generic words that shouldn't auto-attach a document when mentioned.
const GENERIC = new Set(["commercial", "proposal", "homeowners", "declarations", "insurance", "policy", "summary", "quote"]);

const SUGGESTIONS = [
  "What does a homeowners policy cover?",
  "Summarize the Tennessee Valley Landscaping proposal",
  "Draft a renewal reminder email for the Carters",
  "When is workers' comp required in Alabama?",
];

export default function ChatView() {
  const app = useApp();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [picker, setPicker] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const convo = app.active;
  const messages = convo?.messages ?? [];

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, busy]);

  useEffect(() => {
    const t = textarea.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 200) + "px";
  }, [input]);

  const docName = (id: string) => app.docs.find((d) => d.id === id)?.name ?? "Removed document";

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;

    // Documents named in the prompt are attached automatically.
    const lower = content.toLowerCase();
    const mentioned = app.docs
      .filter((d) => {
        const words = d.name.replace(/\.[a-z]+$/i, "").toLowerCase().split(/[\s–-]+/).filter((w) => w.length > 4 && !GENERIC.has(w));
        return words.some((w) => lower.includes(w));
      })
      .map((d) => d.id);
    const docIds = [...new Set([...app.pendingDocIds, ...mentioned])];

    const userMsg: Message = { id: uid(), role: "user", content, docIds };
    const base: Conversation = convo ?? {
      id: uid(),
      title: content.length > 48 ? content.slice(0, 48) + "…" : content,
      messages: [],
      updatedAt: Date.now(),
    };
    const next: Conversation = { ...base, messages: [...base.messages, userMsg], updatedAt: Date.now() };
    app.upsertConversation(next);
    app.setActiveId(next.id);
    app.setPendingDocIds([]);
    setInput("");
    setBusy(true);

    const allDocIds = [...new Set(next.messages.flatMap((m) => m.docIds ?? []))];
    const docs = app.docs.filter((d) => allDocIds.includes(d.id)).map((d) => ({ name: d.name, text: d.text }));

    let reply: Message;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.messages.map((m) => ({ role: m.role, content: m.content })),
          docs,
        }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as ChatResponse;
      const email = data.email ? { ...data.email, attachmentIds: /proposal|attach/i.test(content) ? allDocIds : [] } : undefined;
      reply = { id: uid(), role: "assistant", content: data.content, email, sources: data.sources };
    } catch {
      reply = { id: uid(), role: "assistant", content: "Something went wrong reaching the assistant. Please try again." };
    }
    app.upsertConversation({ ...next, messages: [...next.messages, reply], updatedAt: Date.now() });
    setBusy(false);
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const { docs, failed } = await filesToDocs(files);
    if (docs.length) {
      app.addDocs(docs);
      app.setPendingDocIds([...app.pendingDocIds, ...docs.map((d) => d.id)]);
    }
    if (failed.length) app.notify(`Couldn't read ${failed.join(", ")}`);
    setPicker(false);
  }

  const empty = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      <div ref={scroller} className="scroll-thin flex-1 overflow-y-auto">
        {empty ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col justify-center px-4 pb-10">
            <h1 className="text-center text-3xl font-bold tracking-tight text-ink">How can I help today?</h1>
            <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm text-ink transition hover:border-brand/40 hover:bg-brand-soft/50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
            {messages.map((m) => (
              <MessageRow key={m.id} m={m} docName={docName} onCompose={(e) => app.openComposer(e)} onCopy={(t) => {
                navigator.clipboard?.writeText(t).then(() => app.notify("Copied to clipboard"), () => {});
              }} />
            ))}
            {busy && (
              <div className="flex gap-3">
                <Avatar />
                <div className="typing flex items-center gap-1 pt-3 text-brand">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pb-5 pt-2">
        <div className="relative mx-auto max-w-3xl">
          {picker && (
            <div className="absolute bottom-full left-0 z-20 mb-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface p-2 shadow-lg">
              <button
                onClick={() => fileInput.current?.click()}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold text-brand hover:bg-brand-soft"
              >
                <UploadIcon className="h-4 w-4" /> Upload from computer
              </button>
              {app.docs.length > 0 && <div className="mx-3 my-1.5 border-t border-line" />}
              <div className="scroll-thin max-h-56 overflow-y-auto">
                {app.docs.map((d) => {
                  const on = app.pendingDocIds.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      onClick={() =>
                        app.setPendingDocIds(on ? app.pendingDocIds.filter((x) => x !== d.id) : [...app.pendingDocIds, d.id])
                      }
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-canvas"
                    >
                      <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${on ? "border-brand bg-brand text-white" : "border-line"}`}>
                        {on && <span className="text-[10px] leading-none">✓</span>}
                      </span>
                      <span className="truncate">{d.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-surface shadow-sm focus-within:border-brand/50">
            {app.pendingDocIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-3 pt-3">
                {app.pendingDocIds.map((id) => (
                  <span key={id} className="flex max-w-full items-center gap-1.5 rounded-md bg-river-soft py-1 pl-2 pr-1 text-xs text-river">
                    <DocIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{docName(id)}</span>
                    <button onClick={() => app.setPendingDocIds(app.pendingDocIds.filter((x) => x !== id))} className="rounded p-0.5 hover:bg-white/60" aria-label="Remove">
                      <XIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2 p-2">
              <button
                onClick={() => setPicker((p) => !p)}
                className={`rounded-lg p-2 transition ${picker ? "bg-brand-soft text-brand" : "text-muted hover:bg-canvas hover:text-ink"}`}
                aria-label="Attach documents"
              >
                <ClipIcon />
              </button>
              <textarea
                ref={textarea}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about a policy, or draft an email…"
                className="max-h-[200px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 outline-none placeholder:text-muted/70"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || busy}
                className="rounded-lg bg-brand p-2 text-white transition hover:bg-brand-dark disabled:bg-line disabled:text-muted"
                aria-label="Send"
              >
                <ArrowUpIcon />
              </button>
            </div>
          </div>
          <input ref={fileInput} type="file" multiple hidden accept=".pdf,.docx,.txt,.md,.csv,.json,.html,.eml" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
        </div>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-white">
      <svg viewBox="0 0 32 32" className="h-4 w-4" aria-hidden>
        <path d="M16 6c-4 0-7 3-7 6.5 0 1.2.3 2.2.9 3.1C8.7 16.5 8 17.8 8 19.3 8 22 10.4 24 13.3 24H15v3h2v-3h1.7c2.9 0 5.3-2 5.3-4.7 0-1.5-.7-2.8-1.9-3.7.6-.9.9-1.9.9-3.1C23 9 20 6 16 6z" fill="currentColor" />
      </svg>
    </div>
  );
}

function MessageRow({
  m,
  docName,
  onCompose,
  onCopy,
}: {
  m: Message;
  docName: (id: string) => string;
  onCompose: (e: EmailDraft) => void;
  onCopy: (t: string) => void;
}) {
  if (m.role === "user") {
    return (
      <div className="flex flex-col items-end gap-1.5">
        {!!m.docIds?.length && (
          <div className="flex flex-wrap justify-end gap-1.5">
            {m.docIds.map((id) => (
              <span key={id} className="flex items-center gap-1.5 rounded-md bg-river-soft px-2 py-1 text-xs text-river">
                <DocIcon className="h-3.5 w-3.5" /> {docName(id)}
              </span>
            ))}
          </div>
        )}
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-[15px] leading-6 text-white">
          {m.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Avatar />
      <div className="min-w-0 flex-1 pt-1 text-[15px] leading-7 text-ink">
        <Markdown text={m.content} />

        {m.email && (
          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
            <div className="space-y-1 border-b border-line bg-canvas/60 px-4 py-3 text-sm">
              <div className="flex gap-2"><span className="w-14 text-muted">To</span><span className="truncate">{m.email.to || "—"}</span></div>
              <div className="flex gap-2"><span className="w-14 text-muted">Subject</span><span className="font-bold">{m.email.subject}</span></div>
            </div>
            <div className="max-h-72 overflow-y-auto whitespace-pre-wrap px-4 py-3 text-sm leading-6 scroll-thin">{m.email.body}</div>
            <div className="flex gap-2 border-t border-line px-3 py-2.5">
              <button onClick={() => onCompose(m.email!)} className="flex items-center gap-2 rounded-lg bg-brand px-3 py-1.5 text-sm font-bold text-white hover:bg-brand-dark">
                <MailIcon className="h-4 w-4" /> Edit & send
              </button>
              <button onClick={() => onCopy(`Subject: ${m.email!.subject}\n\n${m.email!.body}`)} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-ink hover:bg-canvas">
                <CopyIcon /> Copy
              </button>
            </div>
          </div>
        )}

        {!!m.sources?.length && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {m.sources.map((s) => (
              <span key={s} className="flex items-center gap-1 rounded-md border border-line px-2 py-0.5 text-xs text-muted">
                <DocIcon className="h-3 w-3" /> {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
