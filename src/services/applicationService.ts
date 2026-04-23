import { prisma } from "@/lib/db";
import { ApplicationStatus, GeneratedDocumentType } from "@prisma/client";
import type { GeneratedOutputs, JobAnalysis, MatchAnalysis } from "@/services/ai/schemas";

const DEMO_EMAIL = "drew.student@example.com";

export async function getOrCreateDemoProfile(opts: { rawResumeText?: string }) {
  const existing = await prisma.resumeProfile.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    if (opts.rawResumeText && opts.rawResumeText.trim() && opts.rawResumeText !== existing.rawResumeText) {
      return prisma.resumeProfile.update({
        where: { id: existing.id },
        data: { rawResumeText: opts.rawResumeText },
      });
    }
    return existing;
  }
  return prisma.resumeProfile.create({
    data: {
      fullName: "Demo Student",
      email: DEMO_EMAIL,
      school: "University of Georgia (UGA)",
      major: "MIS",
      graduationDate: "May 2027",
      gpa: "3.54",
      rawResumeText: opts.rawResumeText ?? "",
    },
  });
}

export async function saveApplication(opts: {
  company: string;
  role: string;
  sourceUrl?: string | null;
  resumeText: string;
  jobText: string;
  job: JobAnalysis;
  match: MatchAnalysis;
  generated: GeneratedOutputs;
  notes?: string | null;
}) {
  const profile = await getOrCreateDemoProfile({ rawResumeText: opts.resumeText });

  const posting = await prisma.jobPosting.create({
    data: {
      company: opts.company,
      role: opts.role,
      sourceUrl: opts.sourceUrl ?? null,
      rawText: opts.jobText,
      extractedSkills: opts.job.requiredSkills,
      extractedResponsibilities: opts.job.responsibilities,
      extractedQualifications: opts.job.preferredQualifications,
      extractedKeywords: opts.job.keywords,
    },
  });

  const app = await prisma.jobApplication.create({
    data: {
      company: opts.company,
      role: opts.role,
      status: ApplicationStatus.Draft,
      notes: opts.notes ?? null,
      resumeProfileId: profile.id,
      jobPostingId: posting.id,
      generatedDocs: {
        create: [
          {
            type: GeneratedDocumentType.resume,
            versionLabel: "Tailored Bullets",
            content: opts.generated.resumeBullets.join("\n"),
          },
          {
            type: GeneratedDocumentType.cover_letter,
            versionLabel: "Main (Professional)",
            content: opts.generated.coverLetterMain,
          },
          {
            type: GeneratedDocumentType.cover_letter,
            versionLabel: "Alt A",
            content: opts.generated.coverLetterAltA,
          },
          {
            type: GeneratedDocumentType.cover_letter,
            versionLabel: "Alt B",
            content: opts.generated.coverLetterAltB,
          },
        ],
      },
    },
  });

  return { applicationId: app.id };
}

export async function listApplications() {
  return prisma.jobApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: { jobPosting: true },
  });
}

export async function updateApplicationStatus(opts: {
  id: string;
  status: ApplicationStatus;
  notes?: string | null;
}) {
  return prisma.jobApplication.update({
    where: { id: opts.id },
    data: { status: opts.status, notes: opts.notes ?? undefined },
  });
}

