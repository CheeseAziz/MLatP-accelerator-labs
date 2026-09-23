# Rivertree Assistant

Client assistant for River Tree Insurance. Answers insurance questions, reads policy documents, and drafts and sends emails.

Built with Next.js (App Router) and Tailwind CSS.

## Run it

```bash
cd rivertree-assistant
npm install
npm run dev
```

Open http://localhost:3000.

It works with no configuration: answers come from a built-in Rivertree knowledge base, and "Send" runs in demo mode. Two sample documents (a homeowners declarations page and a commercial proposal) are preloaded so the demo has data to use.

## Optional configuration

Copy `.env.example` to `.env.local` and fill in:

| Variable | Effect |
| --- | --- |
| `ANTHROPIC_API_KEY` | Uses Claude for answers, document Q&A and email drafts (default model `claude-opus-5`, override with `ANTHROPIC_MODEL`). |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Sends real email through your mail server. |

## Features

- **Assistant** – Ask about auto, home, flood, umbrella, life and commercial lines. Attach documents with the paperclip; naming a document in the prompt attaches it automatically.
- **Documents** – Upload PDF, Word (.docx) or text files. Search, preview, ask about a document, or attach it to an email.
- **Email** – Compose, draft with AI from a description or a template, attach documents, send, and review the Sent folder.

Conversations, documents and sent mail are saved in the browser (localStorage).

## Brand

Colors live as tokens at the top of `app/globals.css` (forest green, river blue, navy). Swap them for the values in Rivertree's official brand guide. Font is Arial.

## Structure

```
app/
  page.tsx            App entry
  api/chat            Assistant (Claude, or the offline agent)
  api/email           Sending (SMTP, or demo mode)
  api/extract         PDF/DOCX text extraction
components/           AppShell, ChatView, DocumentsView, EmailView
lib/
  knowledge.ts        Agency details, FAQ, sample documents
  localAgent.ts       Offline assistant logic
  store.tsx           Client state and persistence
```
