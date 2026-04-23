import { prisma } from "@/lib/db";

export async function GET() {
  const profile = await prisma.resumeProfile.findFirst({
    orderBy: { createdAt: "desc" },
    include: { experiences: { orderBy: { createdAt: "asc" } } },
  });

  const posting = await prisma.jobPosting.findUnique({
    where: { id: "demo-blackrock-posting" },
  });

  const application = await prisma.jobApplication.findUnique({
    where: { id: "demo-application" },
    include: { generatedDocs: { orderBy: { createdAt: "asc" } } },
  });

  return Response.json({
    profile,
    posting,
    application,
  });
}

