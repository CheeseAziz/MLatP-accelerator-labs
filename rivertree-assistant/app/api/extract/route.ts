import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Extracts plain text from an uploaded PDF or DOCX. */
export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const buf = new Uint8Array(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  try {
    if (name.endsWith(".pdf")) {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(buf);
      const { text } = await extractText(pdf, { mergePages: true });
      return NextResponse.json({ text });
    }
    if (name.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
      return NextResponse.json({ text: value });
    }
    return NextResponse.json({ text: new TextDecoder().decode(buf) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not read this file." }, { status: 422 });
  }
}
