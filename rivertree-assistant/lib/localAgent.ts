/**
 * Offline assistant used when no ANTHROPIC_API_KEY is configured.
 * Routes each request to one of: draft email, summarize document,
 * answer from documents, or answer from the Rivertree FAQ.
 */
import { AGENCY, FAQS } from "./knowledge";
import type { ChatRequest, ChatResponse, EmailDraft } from "./types";

const STOP = new Set(
  "a an the is are was were be to of and or in on for with what how does do my our your i me we it this that at by from can about any there which who whom when where why should would could will".split(" "),
);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9$%./-]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function scoreFaq(q: string) {
  const text = q.toLowerCase();
  return FAQS.map((f) => {
    let s = 0;
    for (const k of f.keywords) if (text.includes(k)) s += k.includes(" ") ? 3 : 2;
    return { f, s };
  })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
}

function field(text: string, label: RegExp): string | undefined {
  const m = text.match(new RegExp(label.source + "\\s*[:\\-–]\\s*(.+)", "i"));
  return m?.[1].trim();
}

function keyLines(text: string, max = 14): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /[:$]/.test(l) && l.length < 160 && !/^[A-Z\s]+$/.test(l))
    .slice(0, max);
}

function searchDocs(q: string, docs: ChatRequest["docs"]) {
  const qt = tokens(q);
  const hits: { doc: string; line: string; s: number }[] = [];
  for (const d of docs) {
    for (const raw of d.text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || /^[^a-z]+$/.test(line) && !/\d/.test(line)) continue;
      const lt = line.toLowerCase();
      let s = 0;
      for (const t of qt) if (lt.includes(t)) s += t.length > 4 ? 2 : 1;
      if (s > 0) hits.push({ doc: d.name, line, s });
    }
  }
  return hits.sort((a, b) => b.s - a.s);
}

function firstName(full?: string) {
  if (!full) return "";
  return full.replace(/\b(and|&).*$/i, "").trim().split(/\s+/)[0] ?? "";
}

function recipientFrom(q: string): { email: string; name: string } {
  const email = q.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] ?? "";
  const name = q.match(/\bto\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/)?.[1] ?? "";
  return { email, name };
}

const SIGNATURE = `\n\nBest regards,\n\nRiver Tree Insurance\n${AGENCY.phone} · ${AGENCY.email}`;

function draftEmail(q: string, docs: ChatRequest["docs"]): EmailDraft {
  const lower = q.toLowerCase();
  const r = recipientFrom(q);
  const doc = docs[0];
  const text = doc?.text ?? "";
  const docName = firstName(field(text, /Contact/) ?? field(text, /Named Insured/));
  const greetName = r.name || docName || "there";

  if (/proposal|quote/.test(lower) && doc) {
    const client = field(text, /Prepared for/) ?? "your business";
    const eff = field(text, /Effective Date/);
    const total = text.match(/TOTAL[^\n$]*\$[\d,]+(\.\d+)?/i)?.[0].replace(/^.*?(\$)/, "$1");
    const lines = text
      .split(/\r?\n/)
      .filter((l) => /^\s*\d+\.\s/.test(l))
      .map((l) => "• " + l.replace(/^\s*\d+\.\s*/, "").trim());
    return {
      to: r.email,
      subject: `Insurance proposal for ${client}`,
      body: `Hi ${greetName},\n\nThank you for the opportunity to review ${client}'s insurance program. Here is a summary of our recommended coverage${eff ? `, effective ${eff}` : ""}:\n\n${lines.join("\n")}${total ? `\n\nTotal estimated annual premium: ${total}` : ""}\n\nThe full proposal is attached. I'm happy to walk through any of the options or adjust limits before binding.${SIGNATURE}`,
    };
  }

  if (/proposal|quote/.test(lower)) {
    return {
      to: r.email,
      subject: "Your insurance proposal",
      body: `Hi ${greetName},\n\nThank you for the opportunity to quote your coverage. Attached is our proposal with the recommended coverages, limits and estimated premiums.\n\nI'm happy to walk through the options or adjust limits before binding. Let me know a good time to talk.${SIGNATURE}`,
    };
  }

  if (/renew/.test(lower)) {
    const policy = field(text, /Policy Number/);
    const period = field(text, /Policy Period/);
    const premium = text.match(/^ANNUAL PREMIUM[^\n$]*(\$[\d,]+(\.\d+)?)/im)?.[1];
    return {
      to: r.email,
      subject: `Your upcoming policy renewal${policy ? ` – ${policy}` : ""}`,
      body: `Hi ${greetName},\n\nYour policy${policy ? ` (${policy})` : ""} is coming up for renewal${period ? `; the current term runs ${period}` : ""}.${premium ? ` The current annual premium is ${premium}.` : ""}\n\nBefore it renews, we'd like to confirm nothing has changed with your property, vehicles or drivers, and we'll re-shop the market to make sure you still have the best value.\n\nCould you reply with a good time for a quick call this week?${SIGNATURE}`,
    };
  }

  if (/claim/.test(lower)) {
    return {
      to: r.email,
      subject: "Following up on your claim",
      body: `Hi ${greetName},\n\nI wanted to follow up on your recent claim. To keep things moving, please send any photos, repair estimates and receipts you have, and let me know if the adjuster has reached out yet.\n\nWe'll stay involved until everything is resolved.${SIGNATURE}`,
    };
  }

  if (/welcome|new client|onboard/.test(lower)) {
    return {
      to: r.email,
      subject: "Welcome to River Tree Insurance",
      body: `Hi ${greetName},\n\nWelcome to River Tree Insurance, and thank you for trusting us with your coverage. As an independent agency, we work for you, not the insurance company.\n\nYour policy documents are attached. Save our number for claims, questions, or changes: ${AGENCY.phone}.${SIGNATURE}`,
    };
  }

  if (/certificate|coi/.test(lower)) {
    return {
      to: r.email,
      subject: "Certificate of insurance request",
      body: `Hi ${greetName},\n\nWe've received your certificate of insurance request. Please confirm the certificate holder's name and address and whether they should be listed as an additional insured, and we'll issue it the same day.${SIGNATURE}`,
    };
  }

  const topic = q
    .replace(/^(please\s+)?(draft|write|compose|send)\s+(an?\s+)?(e-?mail|message|note)\s*/i, "")
    .replace(/\bto\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?/, "")
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/, "")
    .replace(/^(about|regarding|re:?)\s+/i, "")
    .trim();
  const subject = topic ? topic.charAt(0).toUpperCase() + topic.slice(1, 70) : "Checking in";
  return {
    to: r.email,
    subject,
    body: `Hi ${greetName},\n\nI'm reaching out regarding ${topic || "your insurance coverage"}. Please let me know a convenient time to talk, or reply here with any questions.${SIGNATURE}`,
  };
}

function summarize(doc: { name: string; text: string }): string {
  const lines = keyLines(doc.text);
  const title = doc.text.split(/\r?\n/).find((l) => l.trim())?.trim() ?? doc.name;
  return `**${title}**\n\n${lines.map((l) => `- ${l.replace(/^\d+\.\s*/, "")}`).join("\n")}`;
}

export function runLocalAgent(req: ChatRequest): ChatResponse {
  const last = req.messages[req.messages.length - 1]?.content ?? "";
  const lower = last.toLowerCase();
  const docs = req.docs;

  if (/\b(e-?mail|write to|message to|send (a|an)?\s*(note|letter))\b/.test(lower) || /^draft\b/.test(lower)) {
    const email = draftEmail(last, docs);
    return {
      engine: "local",
      content: "Here's a draft. Review it, then open it in the composer to send.",
      email,
      sources: docs.slice(0, 1).map((d) => d.name),
    };
  }

  if (docs.length && /\b(summar|overview|recap|key points|tl;?dr|proposal summary)/.test(lower)) {
    return {
      engine: "local",
      content: docs.map(summarize).join("\n\n"),
      sources: docs.map((d) => d.name),
    };
  }

  if (docs.length) {
    const hits = searchDocs(last, docs).filter((h) => h.s >= 2).slice(0, 5);
    if (hits.length) {
      const sources = [...new Set(hits.map((h) => h.doc))];
      return {
        engine: "local",
        content: `From the attached document${sources.length > 1 ? "s" : ""}:\n\n${hits.map((h) => `- ${h.line}`).join("\n")}`,
        sources,
      };
    }
  }

  const faqs = scoreFaq(last);
  if (faqs.length) {
    const top = faqs.slice(0, faqs[1] && faqs[1].s === faqs[0].s ? 2 : 1);
    return { engine: "local", content: top.map((x) => x.f.answer).join("\n\n") };
  }

  if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(lower)) {
    return {
      engine: "local",
      content: "Hello! Ask me about a policy, attach a document to review, or have me draft an email.",
    };
  }

  return {
    engine: "local",
    content: `I don't have a confident answer for that yet. Try asking about auto, home, business or life coverage, attach a policy document, or call the office at ${AGENCY.phone}.`,
  };
}
