import { z } from "zod";
import { saveApplication, listApplications } from "@/services/applicationService";
import { JobAnalysisSchema, MatchAnalysisSchema, GeneratedOutputsSchema } from "@/services/ai/schemas";

export const runtime = "nodejs";

export async function GET() {
  const apps = await listApplications();
  return Response.json({ ok: true, apps });
}

const CreateSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  sourceUrl: z.string().url().optional().nullable(),
  resumeText: z.string().min(50),
  jobText: z.string().min(50),
  job: JobAnalysisSchema,
  match: MatchAnalysisSchema,
  generated: GeneratedOutputsSchema,
  notes: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Invalid application payload." }, { status: 400 });
  }

  const { applicationId } = await saveApplication(parsed.data);
  return Response.json({ ok: true, applicationId });
}

