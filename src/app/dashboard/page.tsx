import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const [appsCount, expCount, latestApps] = await Promise.all([
    prisma.jobApplication.count(),
    prisma.experienceItem.count(),
    prisma.jobApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Quick overview for the demo user. Everything runs locally with SQLite.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="rounded-2xl">
            <Link href="/applications/new">New Application</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href="/tracker">Open Tracker</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Applications</CardTitle>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between">
            <div className="text-3xl font-semibold">{appsCount}</div>
            <Badge variant="secondary">Tracker</Badge>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Experience Items</CardTitle>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between">
            <div className="text-3xl font-semibold">{expCount}</div>
            <Badge variant="secondary">Bank</Badge>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Mode</CardTitle>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between">
            <div className="text-3xl font-semibold">Safe</div>
            <Badge variant="secondary">Mock fallback</Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent applications</CardTitle>
          <Button asChild variant="ghost" className="rounded-xl">
            <Link href="/tracker">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-2">
          {latestApps.length === 0 ? (
            <div className="text-sm text-muted-foreground">No applications yet. Create one for the demo.</div>
          ) : (
            latestApps.map((a) => (
              <Link
                key={a.id}
                href={`/applications/${a.id}`}
                className="flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-muted/30"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{a.company}</div>
                  <div className="truncate text-sm text-muted-foreground">{a.role}</div>
                </div>
                <Badge variant="secondary">{a.status}</Badge>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

