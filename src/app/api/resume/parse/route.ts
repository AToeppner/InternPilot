import { parseResumePdf } from "@/services/resumeParserService";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return Response.json({ ok: false, error: "Missing file." }, { status: 400 });
    }

    // Keep demo reliable: avoid huge PDFs that can time out.
    if (file.size > 6 * 1024 * 1024) {
      return Response.json({
        ok: false,
        error: "PDF is too large for the demo parser (max ~6MB). Paste your resume text instead.",
      });
    }

    const ab = await file.arrayBuffer();
    const buffer = Buffer.from(ab);
    const parsed = await parseResumePdf(buffer);

    if (!parsed.text || parsed.text.trim().length < 20) {
      return Response.json({
        ok: false,
        error:
          "We couldn't extract enough text from that PDF. Use the manual paste/edit fallback (some PDFs are scanned images).",
        text: parsed.text ?? "",
      });
    }

    return Response.json({ ok: true, text: parsed.text, meta: { pages: parsed.numpages } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (process.env.NODE_ENV !== "production") {
      console.error("[InternPilot] PDF parse failed:", msg);
    }
    return Response.json(
      {
        ok: false,
        error: "PDF parsing failed. Use the manual paste/edit fallback.",
        debug: process.env.NODE_ENV !== "production" ? msg : undefined,
      },
      { status: 200 },
    );
  }
}

