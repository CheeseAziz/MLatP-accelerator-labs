"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import type { View } from "@/lib/types";
import ChatView from "./ChatView";
import DocumentsView from "./DocumentsView";
import EmailView from "./EmailView";
import { ChatIcon, DocIcon, Logo, MailIcon, MenuIcon, PlusIcon, TrashIcon } from "./Icons";

const NAV: { id: View; label: string; Icon: typeof ChatIcon }[] = [
  { id: "chat", label: "Assistant", Icon: ChatIcon },
  { id: "documents", label: "Documents", Icon: DocIcon },
  { id: "email", label: "Email", Icon: MailIcon },
];

export default function AppShell() {
  const app = useApp();
  const [open, setOpen] = useState(false);

  const go = (v: View) => {
    app.setView(v);
    setOpen(false);
  };

  if (!app.ready) return <div className="h-screen bg-canvas" />;

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Mobile scrim */}
      {open && <div className="fixed inset-0 z-30 bg-ink/30 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 pb-4 pt-5">
          <Logo />
        </div>

        <div className="px-3">
          <button
            onClick={() => {
              app.newChat();
              setOpen(false);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
          >
            <PlusIcon className="h-4 w-4" /> New chat
          </button>
        </div>

        <nav className="mt-4 space-y-0.5 px-3">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                app.view === id ? "bg-brand-soft font-bold text-brand" : "text-ink hover:bg-canvas"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
              {id === "documents" && <span className="ml-auto text-xs text-muted">{app.docs.length}</span>}
            </button>
          ))}
        </nav>

        <div className="mt-6 px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Recent</div>
        <div className="scroll-thin mt-2 flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {app.conversations.length === 0 && <p className="px-3 py-2 text-sm text-muted">No conversations yet</p>}
          {app.conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center rounded-lg ${
                app.activeId === c.id && app.view === "chat" ? "bg-canvas" : "hover:bg-canvas"
              }`}
            >
              <button
                onClick={() => {
                  app.setActiveId(c.id);
                  go("chat");
                }}
                className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm text-ink"
                title={c.title}
              >
                {c.title}
              </button>
              <button
                onClick={() => app.deleteConversation(c.id)}
                className="mr-1 rounded p-1.5 text-muted transition hover:text-danger md:opacity-0 md:group-hover:opacity-100"
                aria-label="Delete conversation"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-line px-5 py-4 text-xs text-muted">Madison, AL · (256) 715-0477</div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 md:hidden">
          <button onClick={() => setOpen(true)} className="rounded-md p-1.5 text-ink hover:bg-canvas" aria-label="Open menu">
            <MenuIcon />
          </button>
          <Logo />
        </header>
        <div className="min-h-0 flex-1">
          {app.view === "chat" && <ChatView />}
          {app.view === "documents" && <DocumentsView />}
          {app.view === "email" && <EmailView />}
        </div>
      </main>

      {app.toast && (
        <div className="fixed top-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {app.toast}
        </div>
      )}
    </div>
  );
}
