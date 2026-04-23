import { z } from "zod";
import { generateOutputs } from "@/services/ai";
import { JobAnalysisSchema, MatchAnalysisSchema } from "@/services/ai/schemas";

export const runtime = "nodejs";

const BodySchema = z.object({
  resumeText: z.string().min(50),
  job: JobAnalysisSchema,
  match: MatchAnalysisSchema,
  preferences: z.record(z.string(), z.string()).optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Missing resume/job/match data." }, { status: 400 });
  }

  const result = await generateOutputs({
    resumeText: parsed.data.resumeText,
    job: parsed.data.job,
    match: parsed.data.match,
    preferences: parsed.data.preferences,
  });
  return Response.json({ ok: true, ...result });
}

