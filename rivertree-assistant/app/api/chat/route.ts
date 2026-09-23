import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { AGENCY, FAQS } from "@/lib/knowledge";
import { runLocalAgent } from "@/lib/localAgent";
import type { ChatRequest, ChatResponse, EmailDraft } from "@/lib/types";

export const runtime = "nodejs";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";

const SYSTEM = `You are the client assistant for ${AGENCY.name}, an independent insurance agency in Madison, Alabama (est. ${AGENCY.founded}). Phone ${AGENCY.phone}, email ${AGENCY.email}, office ${AGENCY.address}.

You help agency staff and clients:
- answer questions about personal and commercial insurance (auto, home, flood, umbrella, RV, life, general liability, BOP, workers' comp, commercial auto, cyber);
- read attached policy documents, declarations pages and proposals, and answer from them;
- draft emails and proposal summaries.

Style: plain, warm and brief. Short paragraphs or short bullet lists. Use **bold** sparingly for key figures. No headings unless the answer is long. Never invent policy numbers, limits or premiums; if a document doesn't say, say so. Coverage depends on the actual policy wording, so for binding decisions point people to their agent.

When the user asks for an email, call the draft_email tool with the complete draft and add at most one short sentence of text. Sign emails as "River Tree Insurance" with the phone and email above.

Agency FAQ reference:
${FAQS.map((f) => `## ${f.title}\n${f.answer}`).join("\n\n")}`;

const DRAFT_EMAIL_TOOL = {
  name: "draft_email",
  description:
    "Produce an email draft for the user to review in the composer. Use whenever the user asks to write, draft or send an email or message.",
  strict: true,
  input_schema: {
    type: "object" as const,
    properties: {
      to: { type: "string", description: "Recipient email address, or empty string if unknown." },
      subject: { type: "string" },
      body: { type: "string", description: "Full plain-text email body including greeting and signature." },
    },
    required: ["to", "subject", "body"],
    additionalProperties: false,
  },
};

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequest;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(runLocalAgent(body));
  }

  try {
    const client = new Anthropic();
    const docBlock = body.docs.length
      ? `\n\nAttached documents:\n${body.docs.map((d) => `<document name="${d.name}">\n${d.text}\n</document>`).join("\n")}`
      : "";

    const params = {
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM + docBlock,
      tools: [DRAFT_EMAIL_TOOL],
      messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
    } as unknown as Anthropic.Beta.MessageCreateParamsNonStreaming;

    const res = await client.beta.messages.create(params);

    if (res.stop_reason === "refusal") {
      return NextResponse.json<ChatResponse>({
        engine: "claude",
        content: `I can't help with that request. Please contact the office at ${AGENCY.phone}.`,
      });
    }

    let text = "";
    let email: EmailDraft | undefined;
    for (const block of res.content) {
      if (block.type === "text") text += block.text;
      if (block.type === "tool_use" && block.name === "draft_email") {
        email = block.input as EmailDraft;
      }
    }

    return NextResponse.json<ChatResponse>({
      engine: "claude",
      content: text.trim() || (email ? "Here's a draft. Review it, then open it in the composer to send." : ""),
      email,
      sources: body.docs.map((d) => d.name),
    });
  } catch (err) {
    console.error("Claude request failed, using local assistant:", err);
    return NextResponse.json(runLocalAgent(body));
  }
}
