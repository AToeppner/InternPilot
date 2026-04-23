import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";
import { updateApplicationStatus } from "@/services/applicationService";

export const runtime = "nodejs";

const BodySchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  notes: z.string().optional().nullable(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ ok: false, error: "Invalid payload." }, { status: 400 });

  const updated = await updateApplicationStatus({ id, status: parsed.data.status, notes: parsed.data.notes });
  return Response.json({ ok: true, updated });
}

