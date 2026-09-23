"use client";

import { useState } from "react";
import { uid, useApp } from "@/lib/store";
import type { ChatResponse, SentEmail } from "@/lib/types";
import { ClipIcon, DocIcon, SendIcon, SparkIcon, XIcon } from "./Icons";

const TEMPLATES = [
  { label: "Renewal reminder", prompt: "Draft a policy renewal reminder email" },
  { label: "Proposal summary", prompt: "Draft an email with a proposal summary" },
  { label: "Claim follow-up", prompt: "Draft a claim follow-up email" },
  { label: "Welcome", prompt: "Draft a welcome email for a new client" },
];

export default function EmailView() {
  const app = useApp();
  const { draft, setDraft } = app;
  const [tab, setTab] = useState<"compose" | "sent">("compose");
  const [showCc, setShowCc] = useState(!!draft.cc);
  const [ask, setAsk] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [picker, setPicker] = useState(false);
  const [openSent, setOpenSent] = useState<SentEmail | null>(null);

  const attachments = (draft.attachmentIds ?? []).map((id) => app.docs.find((d) => d.id === id)).filter((d) => !!d);
  const set = (patch: Partial<typeof draft>) => setDraft({ ...draft, ...patch });

  async function aiDraft(prompt: string) {
    const p = prompt.trim();
    if (!p || drafting) return;
    setDrafting(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: /e-?mail/i.test(p) ? p : `Draft an email: ${p}` }],
          docs: attachments.map((d) => ({ name: d.name, text: d.text })),
        }),
      });
      const data = (await res.json()) as ChatResponse;
      if (data.email) {
        setDraft({ ...draft, to: draft.to || data.email.to, subject: data.email.subject, body: data.email.body });
        setAsk("");
      } else {
        app.notify("Couldn't create a draft. Try describing the email differently.");
      }
    } catch {
      app.notify("Couldn't reach the assistant.");
    }
    setDrafting(false);
  }

  async function send() {
    if (!draft.to.trim()) return app.notify("Add a recipient");
    if (!draft.subject.trim()) return app.notify("Add a subject");
    setSending(true);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, attachments: attachments.map((d) => ({ name: d.name, text: d.text })) }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      app.setSent([{ ...draft, id: uid(), sentAt: Date.now(), demo: !!data.demo }, ...app.sent]);
      app.resetDraft();
      setShowCc(false);
      app.notify(data.demo ? "Sent (demo mode — no mail server configured)" : "Email sent");
    } catch (e) {
      app.notify(e instanceof Error && e.message ? e.message : "Email failed to send");
    }
    setSending(false);
  }

  const fieldCls = "w-full bg-transparent py-3 text-[15px] outline-none placeholder:text-muted/70";

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        <div className="flex items-center gap-6 border-b border-line">
          {(["compose", "sent"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setOpenSent(null);
              }}
              className={`-mb-px border-b-2 pb-3 text-sm transition ${tab === t ? "border-brand font-bold text-ink" : "border-transparent text-muted hover:text-ink"}`}
            >
              {t === "compose" ? "Compose" : `Sent${app.sent.length ? ` (${app.sent.length})` : ""}`}
            </button>
          ))}
        </div>

        {tab === "compose" && (
          <>
            <div className="mt-6 rounded-xl border border-line bg-surface p-3">
              <div className="flex items-center gap-2">
                <SparkIcon className="ml-1 h-4 w-4 shrink-0 text-brand" />
                <input
                  value={ask}
                  onChange={(e) => setAsk(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && aiDraft(ask)}
                  placeholder="Describe the email and let the assistant draft it"
                  className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted/70"
                />
                <button
                  onClick={() => aiDraft(ask)}
                  disabled={!ask.trim() || drafting}
                  className="rounded-lg bg-brand px-3 py-1.5 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-line disabled:text-muted"
                >
                  {drafting ? "Drafting…" : "Draft"}
                </button>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => aiDraft(t.prompt)}
                    disabled={drafting}
                    className="rounded-full border border-line px-3 py-1 text-xs text-ink transition hover:border-brand/40 hover:bg-brand-soft/50"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-line bg-surface">
              <div className="flex items-center gap-3 border-b border-line px-4">
                <span className="w-14 text-sm text-muted">To</span>
                <input value={draft.to} onChange={(e) => set({ to: e.target.value })} placeholder="client@example.com" className={fieldCls} />
                {!showCc && (
                  <button onClick={() => setShowCc(true)} className="text-sm text-muted hover:text-ink">Cc</button>
                )}
              </div>
              {showCc && (
                <div className="flex items-center gap-3 border-b border-line px-4">
                  <span className="w-14 text-sm text-muted">Cc</span>
                  <input value={draft.cc ?? ""} onChange={(e) => set({ cc: e.target.value })} className={fieldCls} />
                </div>
              )}
              <div className="flex items-center gap-3 border-b border-line px-4">
                <span className="w-14 text-sm text-muted">Subject</span>
                <input value={draft.subject} onChange={(e) => set({ subject: e.target.value })} className={`${fieldCls} font-bold`} />
              </div>
              <textarea
                value={draft.body}
                onChange={(e) => set({ body: e.target.value })}
                placeholder="Write your message"
                rows={14}
                className="block w-full resize-y bg-transparent px-4 py-4 text-[15px] leading-7 outline-none placeholder:text-muted/70"
              />

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                  {attachments.map((d) => (
                    <span key={d.id} className="flex max-w-full items-center gap-1.5 rounded-md bg-river-soft py-1 pl-2 pr-1 text-xs text-river">
                      <DocIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{d.name}</span>
                      <button
                        onClick={() => set({ attachmentIds: (draft.attachmentIds ?? []).filter((x) => x !== d.id) })}
                        className="rounded p-0.5 hover:bg-white/60"
                        aria-label="Remove attachment"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="relative flex items-center gap-2 border-t border-line px-3 py-2.5">
                <button
                  onClick={send}
                  disabled={sending}
                  className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
                >
                  <SendIcon /> {sending ? "Sending…" : "Send"}
                </button>
                <button
                  onClick={() => setPicker((p) => !p)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition ${picker ? "bg-brand-soft text-brand" : "text-muted hover:bg-canvas hover:text-ink"}`}
                >
                  <ClipIcon className="h-4 w-4" /> Attach
                </button>
                <button
                  onClick={() => {
                    app.resetDraft();
                    setShowCc(false);
                  }}
                  className="ml-auto rounded-lg px-3 py-2 text-sm text-muted hover:bg-canvas hover:text-ink"
                >
                  Discard
                </button>

                {picker && (
                  <div className="absolute bottom-full left-3 z-20 mb-2 w-80 max-w-[calc(100vw-3rem)] rounded-xl border border-line bg-surface p-2 shadow-lg">
                    {app.docs.length === 0 && <p className="px-3 py-2 text-sm text-muted">Upload files in Documents first</p>}
                    <div className="scroll-thin max-h-56 overflow-y-auto">
                      {app.docs.map((d) => {
                        const ids = draft.attachmentIds ?? [];
                        const on = ids.includes(d.id);
                        return (
                          <button
                            key={d.id}
                            onClick={() => set({ attachmentIds: on ? ids.filter((x) => x !== d.id) : [...ids, d.id] })}
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
              </div>
            </div>
          </>
        )}

        {tab === "sent" && !openSent && (
          <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
            {app.sent.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted">No sent emails yet</p>}
            {app.sent.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setOpenSent(s)}
                className={`flex w-full items-baseline gap-4 px-4 py-3.5 text-left hover:bg-canvas ${i > 0 ? "border-t border-line" : ""}`}
              >
                <span className="w-40 shrink-0 truncate text-sm">{s.to}</span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  <span className="font-bold">{s.subject}</span>
                  <span className="text-muted"> — {s.body.replace(/\s+/g, " ").slice(0, 80)}</span>
                </span>
                <span className="shrink-0 text-xs text-muted">{new Date(s.sentAt).toLocaleDateString()}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "sent" && openSent && (
          <div className="mt-6 rounded-xl border border-line bg-surface">
            <div className="flex items-start gap-3 border-b border-line px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="text-lg font-bold">{openSent.subject}</div>
                <div className="mt-1 text-sm text-muted">
                  To {openSent.to}
                  {openSent.cc ? `, cc ${openSent.cc}` : ""} · {new Date(openSent.sentAt).toLocaleString()}
                  {openSent.demo && " · demo"}
                </div>
              </div>
              <button onClick={() => setOpenSent(null)} className="rounded-md p-1.5 text-muted hover:bg-canvas hover:text-ink" aria-label="Back">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="whitespace-pre-wrap px-5 py-5 text-[15px] leading-7">{openSent.body}</div>
          </div>
        )}
      </div>
    </div>
  );
}
