"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import type { GeneratedOutputs, JobAnalysis, MatchAnalysis } from "@/services/ai/schemas";

type Step = "Upload" | "Analyze" | "Match" | "Generate" | "Save";
const steps: Step[] = ["Upload", "Analyze", "Match", "Generate", "Save"];

function Stepper(props: { current: Step }) {
  const idx = steps.indexOf(props.current);
  const pct = Math.round(((idx + 1) / steps.length) * 100);
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((s, i) => (
          <Badge key={s} variant={i <= idx ? "default" : "secondary"}>
            {s}
          </Badge>
        ))}
      </div>
      <Progress value={pct} />
    </div>
  );
}

export default function NewApplicationPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("Upload");

  const [resumeText, setResumeText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobText, setJobText] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
  const [match, setMatch] = useState<MatchAnalysis | null>(null);
  const [generated, setGenerated] = useState<GeneratedOutputs | null>(null);
  const [usedMock, setUsedMock] = useState<{ analyze?: boolean; match?: boolean; generate?: boolean }>({});
  const [mockReason, setMockReason] = useState<{ analyze?: string; match?: string; generate?: string }>({});

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const canAnalyze = resumeText.trim().length >= 50 && jobText.trim().length >= 50;

  const preferences = useMemo(() => {
    const obj: Record<string, string> = {};
    questions.forEach((q, i) => {
      obj[`q${i + 1}`] = answers[`q${i + 1}`] ?? "";
    });
    return obj;
  }, [answers, questions]);

  async function loadDemoScenario() {
    const res = await fetch("/api/demo/scenario");
    const data = await res.json().catch(() => null);
    if (!data?.profile || !data?.posting) {
      toast.error("Demo seed missing. Run migrations/seed.");
      return;
    }
    setResumeText(data.profile.rawResumeText ?? "");
    setJobText(data.posting.rawText ?? "");
    setJobUrl(data.posting.sourceUrl ?? "");
    setCompany(data.posting.company ?? "");
    setRole(data.posting.title ?? "");

    // Pre-fill analysis from seed if present
    const seedJob: JobAnalysis = {
      responsibilities: (data.posting.extractedResponsibilities ?? []) as string[],
      requiredSkills: (data.posting.extractedSkills ?? []) as string[],
      preferredQualifications: (data.posting.extractedQualifications ?? []) as string[],
      keywords: (data.posting.extractedKeywords ?? []) as string[],
    };
    if (seedJob.responsibilities.length) setJobAnalysis(seedJob);
    toast.success("Loaded demo scenario.");
    setStep("Analyze");
  }

  async function parsePdf(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/resume/parse", { method: "POST", body: fd });
    const data = await res.json().catch(() => null);
    if (data?.ok) {
      setResumeText(data.text ?? "");
      toast.success("Resume parsed. You can edit it.");
    } else {
      const dbg = data?.debug ? `\n\nDebug: ${data.debug}` : "";
      toast.error((data?.error ?? "Could not parse PDF. Use manual paste/edit.") + dbg);
      if (typeof data?.text === "string") setResumeText(data.text);
    }
  }

  async function fetchFromUrl() {
    if (!jobUrl.trim()) return;
    const res = await fetch("/api/job/fetch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: jobUrl }),
    });
    const data = await res.json().catch(() => null);
    if (data?.ok) {
      setJobText(data.text ?? "");
      toast.success("Job text loaded. You can edit it.");
    } else {
      const dbg = data?.debug ? `\n\nDebug: ${data.debug}` : "";
      toast.error((data?.error ?? "Could not load URL. Paste the job text instead.") + dbg);
    }
  }

  async function runAnalyze() {
    if (!canAnalyze) return;
    const res = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jobText }),
    });
    const data = await res.json().catch(() => null);
    if (!data?.ok) return toast.error("Analyze failed.");
    setJobAnalysis(data.data);
    setUsedMock((m) => ({ ...m, analyze: !!data.usedMock }));
    setMockReason((r) => ({ ...r, analyze: data.reason ?? "" }));
    toast.success(data.usedMock ? "Analyzed (mock AI)." : "Analyzed with AI.");
    setStep("Match");
  }

  async function runMatch() {
    if (!jobAnalysis) return;
    const res = await fetch("/api/ai/match", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ resumeText, job: jobAnalysis }),
    });
    const data = await res.json().catch(() => null);
    if (!data?.ok) return toast.error("Match failed.");
    setMatch(data.data);
    setUsedMock((m) => ({ ...m, match: !!data.usedMock }));
    setMockReason((r) => ({ ...r, match: data.reason ?? "" }));
    toast.success(data.usedMock ? "Matched (mock AI)." : "Matched with AI.");
    setStep("Generate");

    // Fetch refinement questions in the background (non-blocking)
    fetch("/api/ai/refine", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ resumeText, job: jobAnalysis, match: data.data }),
    })
      .then((r) => r.json())
      .then((d) => {
        const qs = d?.data?.questions as string[] | undefined;
        if (Array.isArray(qs) && qs.length) setQuestions(qs);
      })
      .catch(() => {});
  }

  async function runGenerate() {
    if (!jobAnalysis || !match) return;
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ resumeText, job: jobAnalysis, match, preferences }),
    });
    const data = await res.json().catch(() => null);
    if (!data?.ok) return toast.error("Generate failed.");
    setGenerated(data.data);
    setUsedMock((m) => ({ ...m, generate: !!data.usedMock }));
    setMockReason((r) => ({ ...r, generate: data.reason ?? "" }));
    toast.success(data.usedMock ? "Generated (mock AI)." : "Generated with AI.");
    setStep("Save");
  }

  async function save() {
    if (!jobAnalysis || !match || !generated) return;
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        company,
        role,
        sourceUrl: jobUrl || null,
        resumeText,
        jobText,
        job: jobAnalysis,
        match,
        generated,
        notes: "Created via demo flow.",
      }),
    });
    const data = await res.json().catch(() => null);
    if (!data?.ok) return toast.error("Save failed.");
    toast.success("Saved to tracker.");
    router.push(`/applications/${data.applicationId}`);
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New Application</h1>
          <p className="text-sm text-muted-foreground">
            The demo flow: Upload → Analyze → Match → Generate → Save. Nothing auto-runs.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="rounded-2xl" onClick={loadDemoScenario}>
            Load Demo Scenario
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <Stepper current={step} />
          <div className="mt-3 text-xs text-muted-foreground">
            {usedMock.analyze || usedMock.match || usedMock.generate ? (
              <span>
                Running in <b>Mock AI fallback</b> for at least one step (still demo-safe).
                {usedMock.analyze && mockReason.analyze ? (
                  <> <span className="ml-2">Analyze reason: <b>{mockReason.analyze}</b></span></>
                ) : null}
                {usedMock.match && mockReason.match ? (
                  <> <span className="ml-2">Match reason: <b>{mockReason.match}</b></span></>
                ) : null}
                {usedMock.generate && mockReason.generate ? (
                  <> <span className="ml-2">Generate reason: <b>{mockReason.generate}</b></span></>
                ) : null}
              </span>
            ) : (
              <span>Tip: If no API key is set, InternPilot automatically switches to mock AI.</span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>1) Upload Resume (PDF) + Preview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input
              type="file"
              accept="application/pdf"
              className="rounded-xl"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) parsePdf(f);
              }}
            />
            <Textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="If PDF parsing fails, paste or type your resume text here."
              className="min-h-[260px] rounded-xl"
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>2) Job Posting (URL or Paste)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex gap-2">
              <Input
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://... (optional)"
                className="rounded-xl"
              />
              <Button variant="outline" className="rounded-xl" onClick={fetchFromUrl}>
                Fetch
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
            <Input
  value={company}
  onChange={(e) => setCompany(e.target.value)}
  placeholder="Insert company name here"
  className="rounded-xl"
/>

<Input
  value={role}
  onChange={(e) => setRole(e.target.value)}
  placeholder="Insert job title here"
  className="rounded-xl"
/>
            </div>
            <Textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste job posting text here (recommended for reliability)."
              className="min-h-[260px] rounded-xl"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>3–5) Analyze, Match, Generate, Save</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-xl" onClick={runAnalyze} disabled={!canAnalyze}>
              Analyze Posting
            </Button>
            <Button className="rounded-xl" variant="outline" onClick={runMatch} disabled={!jobAnalysis}>
              Match Resume
            </Button>
            <Button className="rounded-xl" variant="outline" onClick={runGenerate} disabled={!match}>
              Generate Outputs
            </Button>
            <Button className="rounded-xl" variant="default" onClick={save} disabled={!generated}>
              Save to Tracker
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {jobAnalysis ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border p-4">
                <div className="font-medium">Job Analysis</div>
                <div className="mt-2 grid gap-2 text-sm text-muted-foreground">
                  <div>
                    <b>Skills</b>: {jobAnalysis.requiredSkills.slice(0, 8).join(", ")}
                  </div>
                  <div>
                    <b>Responsibilities</b>: {jobAnalysis.responsibilities.slice(0, 3).join(" • ")}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="font-medium">Match Snapshot</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {match ? match.strongestMatches.slice(0, 3).map((m) => <div key={m}>• {m}</div>) : "Run match to see this."}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Run “Analyze Posting” to extract skills and keywords.</div>
          )}

          {questions.length ? (
            <div className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium">Refinement (optional)</div>
                <div className="text-xs text-muted-foreground">Answering these can improve the generation.</div>
              </div>
              <Separator className="my-3" />
              <div className="grid gap-3 md:grid-cols-3">
                {questions.map((q, i) => (
                  <div key={q} className="grid gap-2">
                    <div className="text-sm font-medium">{q}</div>
                    <Input
                      className="rounded-xl"
                      value={answers[`q${i + 1}`] ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [`q${i + 1}`]: e.target.value }))}
                      placeholder="Short answer"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {generated ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border p-4">
                <div className="font-medium">Tailored Resume Bullets</div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {generated.resumeBullets.map((b) => `- ${b}`).join("\n")}
                </div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="font-medium">Cover Letter (Main)</div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{generated.coverLetterMain}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Run “Generate Outputs” to preview bullets and cover letter.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

