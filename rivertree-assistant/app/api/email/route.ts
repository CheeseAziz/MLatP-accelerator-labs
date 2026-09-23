import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Attachment = { name: string; text: string };
type Payload = { to: string; cc?: string; subject: string; body: string; attachments?: Attachment[] };

export async function POST(req: Request) {
  const p = (await req.json()) as Payload;

  if (!p.to?.trim() || !p.subject?.trim()) {
    return NextResponse.json({ ok: false, error: "Recipient and subject are required." }, { status: 400 });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST) {
    // Demo mode: no mail server configured.
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
    await transport.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: p.to,
      cc: p.cc || undefined,
      subject: p.subject,
      text: p.body,
      attachments: (p.attachments ?? []).map((a) => ({
        filename: a.name.replace(/\.(pdf|docx)$/i, ".txt"),
        content: a.text,
      })),
    });
    return NextResponse.json({ ok: true, demo: false });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "The mail server rejected the message." }, { status: 502 });
  }
}
