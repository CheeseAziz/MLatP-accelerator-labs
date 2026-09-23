"use client";

import { useMemo, useRef, useState } from "react";
import { filesToDocs, formatSize, useApp } from "@/lib/store";
import { ChatIcon, DocIcon, MailIcon, SearchIcon, TrashIcon, UploadIcon, XIcon } from "./Icons";

export default function DocumentsView() {
  const app = useApp();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const list = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return app.docs;
    return app.docs.filter((d) => d.name.toLowerCase().includes(q) || d.text.toLowerCase().includes(q));
  }, [app.docs, query]);

  const doc = app.docs.find((d) => d.id === selected) ?? null;

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setLoading(true);
    const { docs, failed } = await filesToDocs(files);
    setLoading(false);
    if (docs.length) {
      app.addDocs(docs);
      app.notify(`Added ${docs.length} document${docs.length > 1 ? "s" : ""}`);
    }
    if (failed.length) app.notify(`Couldn't read ${failed.join(", ")}`);
  }

  return (
    <div
      className="flex h-full"
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDrag(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        upload(e.dataTransfer.files);
      }}
    >
      <section className={`scroll-thin flex-1 overflow-y-auto ${doc ? "hidden lg:block" : ""}`}>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="mr-auto text-2xl font-bold tracking-tight">Documents</h1>
            <label className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm focus-within:border-brand/50">
              <SearchIcon className="h-4 w-4 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-36 bg-transparent outline-none placeholder:text-muted/70 sm:w-48"
              />
            </label>
            <button
              onClick={() => input.current?.click()}
              className="flex items-center gap-2 rounded-lg bg-brand px-3.5 py-2 text-sm font-bold text-white hover:bg-brand-dark"
            >
              <UploadIcon className="h-4 w-4" /> {loading ? "Reading…" : "Upload"}
            </button>
            <input ref={input} type="file" multiple hidden accept=".pdf,.docx,.txt,.md,.csv,.json,.html,.eml" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
          </div>

          <div
            className={`mt-6 rounded-xl border border-dashed px-4 py-5 text-center text-sm transition ${
              drag ? "border-brand bg-brand-soft text-brand" : "border-line text-muted"
            }`}
          >
            Drop PDF, Word or text files here
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
            {list.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted">No documents found</p>}
            {list.map((d, i) => (
              <div
                key={d.id}
                onClick={() => setSelected(d.id)}
                className={`group flex cursor-pointer items-center gap-3 px-4 py-3.5 transition ${i > 0 ? "border-t border-line" : ""} ${
                  selected === d.id ? "bg-brand-soft/60" : "hover:bg-canvas"
                }`}
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-river-soft text-river">
                  <DocIcon className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{d.name}</div>
                  <div className="text-xs text-muted">
                    {formatSize(d.size)} · {new Date(d.addedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <RowAction label="Ask" onClick={() => app.askAboutDoc(d.id)}><ChatIcon className="h-4 w-4" /></RowAction>
                  <RowAction label="Email" onClick={() => app.openComposer({ attachmentIds: [d.id] })}><MailIcon className="h-4 w-4" /></RowAction>
                  <RowAction
                    label="Delete"
                    danger
                    onClick={() => {
                      app.removeDoc(d.id);
                      if (selected === d.id) setSelected(null);
                    }}
                  >
                    <TrashIcon />
                  </RowAction>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {doc && (
        <aside className="flex w-full flex-col border-l border-line bg-surface lg:w-[440px]">
          <div className="flex items-center gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold">{doc.name}</div>
              <div className="text-xs text-muted">{formatSize(doc.size)}</div>
            </div>
            <button onClick={() => setSelected(null)} className="rounded-md p-1.5 text-muted hover:bg-canvas hover:text-ink" aria-label="Close">
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex gap-2 border-b border-line px-5 py-3">
            <button onClick={() => app.askAboutDoc(doc.id)} className="flex items-center gap-2 rounded-lg bg-brand px-3 py-1.5 text-sm font-bold text-white hover:bg-brand-dark">
              <ChatIcon className="h-4 w-4" /> Ask about this
            </button>
            <button onClick={() => app.openComposer({ attachmentIds: [doc.id] })} className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-canvas">
              <MailIcon className="h-4 w-4" /> Email
            </button>
          </div>
          <pre className="scroll-thin flex-1 overflow-auto whitespace-pre-wrap px-5 py-4 font-sans text-[13px] leading-6 text-ink">
            {doc.text || "No readable text in this file."}
          </pre>
        </aside>
      )}
    </div>
  );
}

function RowAction({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={label}
      aria-label={label}
      className={`rounded-md p-2 text-muted transition hover:bg-surface ${danger ? "hover:text-danger" : "hover:text-brand"}`}
    >
      {children}
    </button>
  );
}
