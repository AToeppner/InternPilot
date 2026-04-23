import { z } from "zod";
import { matchResume } from "@/services/ai";
import { JobAnalysisSchema } from "@/services/ai/schemas";

export const runtime = "nodejs";

const BodySchema = z.object({
  resumeText: z.string().min(50),
  job: JobAnalysisSchema,
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Missing resume/job data." }, { status: 400 });
  }

  const result = await matchResume({ resumeText: parsed.data.resumeText, job: parsed.data.job });
  return Response.json({ ok: true, ...result });
}

