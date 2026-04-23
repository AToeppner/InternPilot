import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border bg-gradient-to-br from-background via-background to-secondary/40 p-8 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Demo-ready</Badge>
              <Badge variant="secondary">No auth</Badge>
              <Badge variant="secondary">Mock AI fallback</Badge>
            </div>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              InternPilot helps students tailor applications fast.
            </h1>
            <p className="mt-3 text-pretty text-muted-foreground md:text-lg">
              Upload a resume PDF, paste a job posting (or load the demo), and generate matched bullets + cover letters
              with a clean tracker for your internship search.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="h-11 rounded-2xl px-6">
              <Link href="/applications/new">Start demo flow</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-2xl px-6">
              <Link href="/dashboard">View dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Upload → Preview</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            PDF parsing with an editable text fallback so you’re never blocked during a demo.
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Analyze → Match</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Extracts responsibilities/skills, then highlights strongest experiences + skill gaps constructively.
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Generate → Track</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Tailored bullets + 3 cover letters, saved into a simple application tracker (Draft → Offer).
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
