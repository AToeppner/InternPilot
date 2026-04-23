import { z } from "zod";
import { refinementQuestions } from "@/services/ai";
import { JobAnalysisSchema, MatchAnalysisSchema } from "@/services/ai/schemas";

export const runtime = "nodejs";

const BodySchema = z.object({
  resumeText: z.string().min(50),
  job: JobAnalysisSchema,
  match: MatchAnalysisSchema,
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Missing resume/job/match data." }, { status: 400 });
  }

  const result = await refinementQuestions({
    resumeText: parsed.data.resumeText,
    job: parsed.data.job,
    match: parsed.data.match,
  });
  return Response.json({ ok: true, ...result });
}

