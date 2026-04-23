"use client";

import { useMemo, useState } from "react";
import { ApplicationStatus, GeneratedDocumentType } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { StatusPicker } from "@/components/status-picker";

import type { JobAnalysis, MatchAnalysis } from "@/services/ai/schemas";

type Doc = {
  id: string;
  type: GeneratedDocumentType;
  versionLabel: string;
  content: string;
};

export function ResultsTabs(props: {
  app: { id: string; company: string; role: string; status: ApplicationStatus; createdAt: string; notes: string };
  resumeText: string;
  jobPosting: { id: string; company: string; role: string; sourceUrl: string; rawText: string };
  job: JobAnalysis;
  docs: Doc[];
}) {
  const [notes, setNotes] = useState(props.app.notes);
  const [match, setMatch] = useState<MatchAnalysis | null>(null);
  const [matchUsedMock, setMatchUsedMock] = useState<boolean | null>(null);

  const resumeDoc = props.docs.find((d) => d.type === "resume");
  const coverDocs = props.docs.filter((d) => d.type === "cover_letter");

  const quick = useMemo(() => {
    const skills = props.job.requiredSkills.slice(0, 10);
    const resp = props.job.responsibilities.slice(0, 5);
    return { skills, resp };
  }, [props.job]);

  async function computeMatch() {
    const res = await fetch("/api/ai/match", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ resumeText: props.resumeText, job: props.job }),
    });
    const data = await res.json().catch(() => null);
    if (!data?.ok) return toast.error("Could not compute match.");
    setMatch(data.data);
    setMatchUsedMock(!!data.usedMock);
    toast.success(data.usedMock ? "Match updated (mock AI)." : "Match updated with AI.");
  }

  async function saveNotes() {
    const res = await fetch(`/api/applications/${props.app.id}/status`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: props.app.status, notes }),
    });
    const data = await res.json().catch(() => null);
    if (!data?.ok) toast.error("Could not save notes.");
    else toast.success("Notes saved.");
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Results</Badge>
            <Badge variant="secondary">{props.app.company}</Badge>
          </div>
          <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight">{props.app.role}</h1>
          <p className="text-sm text-muted-foreground">
            Created {new Date(props.app.createdAt).toLocaleString()}
            {props.jobPosting.sourceUrl ? ` • source: ${props.jobPosting.sourceUrl}` : ""}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <StatusPicker id={props.app.id} value={props.app.status} />
          <Button variant="outline" className="rounded-xl" onClick={computeMatch}>
            Refresh Match Analysis
          </Button>
        </div>
      </div>

      <Tabs defaultValue="match" className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl">
          <TabsTrigger value="match">Match Analysis</TabsTrigger>
          <TabsTrigger value="bullets">Resume Bullets</TabsTrigger>
          <TabsTrigger value="cover">Cover Letter</TabsTrigger>
          <TabsTrigger value="tracker">Tracker</TabsTrigger>
        </TabsList>

        <TabsContent value="match" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Posting Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div>
                  <div className="font-medium">Top skills</div>
                  <div className="mt-1 text-muted-foreground">{quick.skills.join(", ")}</div>
                </div>
                <Separator />
                <div>
                  <div className="font-medium">Responsibilities</div>
                  <div className="mt-1 grid gap-1 text-muted-foreground">
                    {quick.resp.map((r) => (
                      <div key={r}>• {r}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Match</CardTitle>
                {matchUsedMock !== null ? (
                  <Badge variant="secondary">{matchUsedMock ? "mock AI" : "AI"}</Badge>
                ) : (
                  <Badge variant="secondary">click refresh</Badge>
                )}
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                {!match ? (
                  <div className="text-muted-foreground">
                    Click <b>Refresh Match Analysis</b> to compute strengths, transferable skills, and gaps.
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="font-medium">Strongest matches</div>
                      <div className="mt-1 grid gap-1 text-muted-foreground">
                        {match.strongestMatches.map((m) => (
                          <div key={m}>• {m}</div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <div className="font-medium">Transferable skills</div>
                        <div className="mt-1 grid gap-1 text-muted-foreground">
                          {match.transferableSkills.map((s) => (
                            <div key={s}>• {s}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Skill gaps</div>
                        <div className="mt-1 grid gap-1 text-muted-foreground">
                          {match.skillGaps.map((g) => (
                            <div key={g}>• {g}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bullets" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{resumeDoc?.versionLabel ?? "Tailored Bullets"}</CardTitle>
              <Badge variant="secondary">text-only</Badge>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{resumeDoc?.content ?? ""}</pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cover" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            {coverDocs.map((d) => (
              <Card key={d.id} className="rounded-2xl md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">{d.versionLabel}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{d.content}</pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tracker" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Status + Notes</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="text-sm text-muted-foreground">
                  Status changes are saved instantly. Notes are optional (helpful talking point in the demo).
                </div>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[180px] rounded-xl"
                  placeholder="Notes about the application..."
                />
                <Button className="rounded-xl" onClick={saveNotes}>
                  Save Notes
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Raw Posting (for demo)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">
                  {props.jobPosting.rawText}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

