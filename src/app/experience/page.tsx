import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ExperienceBankPage() {
  const profile = await prisma.resumeProfile.findFirst({
    orderBy: { createdAt: "desc" },
    include: { experiences: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Experience Bank</h1>
        <p className="text-sm text-muted-foreground">
          Centralized memory of what you’ve done (used for matching and generation).
        </p>
      </div>

      {!profile ? (
        <Card className="rounded-2xl">
          <CardContent className="p-6 text-sm text-muted-foreground">No demo profile found.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {profile.experiences.map((e) => (
            <Card key={e.id} className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {e.title} <span className="text-muted-foreground">• {e.organization}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="text-muted-foreground">
                  {e.startDate ?? "—"} → {e.endDate ?? "—"}
                </div>
                <div className="text-pretty">{e.description}</div>
                {Array.isArray(e.skills) && e.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(e.skills as string[]).slice(0, 8).map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

