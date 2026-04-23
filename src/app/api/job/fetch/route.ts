import { z } from "zod";
import { fetchJobPostingTextFromUrl } from "@/services/jobPostingService";

export const runtime = "nodejs";

const BodySchema = z.object({
  url: z.string().url(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Invalid URL." }, { status: 400 });
  }

  try {
    const text = await fetchJobPostingTextFromUrl(parsed.data.url);
    return Response.json({ ok: true, text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (process.env.NODE_ENV !== "production") {
      console.error("[InternPilot] Job fetch failed:", msg);
    }
    return Response.json(
      {
        ok: false,
        error:
          "Could not scrape that URL. Many job sites block scraping or require JavaScript. Paste the job posting text instead.",
        debug: process.env.NODE_ENV !== "production" ? msg : undefined,
      },
      { status: 200 },
    );
  }
}

