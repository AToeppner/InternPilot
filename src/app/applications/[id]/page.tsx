import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ResultsTabs } from "./results-tabs";

export default async function ApplicationResultsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  if (!id) return notFound();

  const app = await prisma.jobApplication.findUnique({
    where: { id },
    include: {
      jobPosting: true,
      resumeProfile: true,
      generatedDocs: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!app) return notFound();
  if (!app.jobPosting) return notFound();

  const job = {
    responsibilities: (app.jobPosting.extractedResponsibilities ?? []) as string[],
    requiredSkills: (app.jobPosting.extractedSkills ?? []) as string[],
    preferredQualifications: (app.jobPosting.extractedQualifications ?? []) as string[],
    keywords: (app.jobPosting.extractedKeywords ?? []) as string[],
  };

  const resumeText = app.resumeProfile.rawResumeText ?? "";

  return (
    <ResultsTabs
      app={{
        id: app.id,
        company: app.company,
        role: app.role,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
        notes: app.notes ?? "",
      }}
      resumeText={resumeText}
      jobPosting={{
        id: app.jobPosting.id,
        company: app.jobPosting.company,
        role: app.jobPosting.role,
        sourceUrl: app.jobPosting.sourceUrl ?? "",
        rawText: app.jobPosting.rawText,
      }}
      job={job}
      docs={app.generatedDocs.map((d) => ({
        id: d.id,
        type: d.type,
        versionLabel: d.versionLabel,
        content: d.content,
      }))}
    />
  );
}