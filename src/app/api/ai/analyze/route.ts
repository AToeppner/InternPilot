import { z } from "zod";
import { analyzeJobPosting } from "@/services/ai";

export const runtime = "nodejs";

const BodySchema = z.object({
  jobText: z.string().min(50),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Missing job posting text." }, { status: 400 });
  }

  const result = await analyzeJobPosting(parsed.data.jobText);
  return Response.json({ ok: true, ...result });
}

