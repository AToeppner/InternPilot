import OpenAI from "openai";
import { z } from "zod";

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

function extractFirstJsonObject(text: string) {
  const trimmed = text.trim();

  // Common case: already clean JSON
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  // Strip markdown code fences if present
  const noFences = trimmed
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  if (noFences.startsWith("{") && noFences.endsWith("}")) return noFences;

  // Fallback: find first {...} block
  const first = noFences.indexOf("{");
  const last = noFences.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  return noFences.slice(first, last + 1);
}

async function safeJson<T extends z.ZodTypeAny>(opts: {
  system: string;
  user: string;
  schema: T;
  temperature?: number;
}) {
  const client = getClient();
  if (!client) return { ok: false as const, reason: "missing_api_key" as const, data: null as null };

  let resp: Awaited<ReturnType<typeof client.chat.completions.create>>;
  try {
    resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: opts.temperature ?? 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    });
  } catch {
    return { ok: false as const, reason: "openai_error" as const, data: null as null };
  }

  const text = resp.choices?.[0]?.message?.content ?? "";
  const jsonText = extractFirstJsonObject(text);
  if (!jsonText) return { ok: false as const, reason: "no_json_found" as const, data: null as null };
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { ok: false as const, reason: "json_parse_error" as const, data: null as null };
  }

  const result = opts.schema.safeParse(parsed);
  if (!result.success) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[InternPilot] OpenAI schema mismatch. First 500 chars:", jsonText.slice(0, 500));
      console.warn("[InternPilot] Zod issues:", result.error.issues.slice(0, 5));
    }
    return { ok: false as const, reason: "schema_mismatch" as const, data: null as null };
  }
  return { ok: true as const, reason: null as null, data: result.data as z.infer<T> };
}

export async function openaiAnalyzeJobPosting<T extends z.ZodTypeAny>(jobText: string, schema: T) {
  const primary = await safeJson({
    schema,
    system:
      "You are InternPilot. Output MUST be a single JSON object with EXACT keys: responsibilities, requiredSkills, preferredQualifications, keywords. Values must be arrays of short strings. No extra keys.",
    user:
      `Analyze the job posting and return JSON ONLY with EXACT keys.\n\n` +
      `Required output JSON shape (example, replace values):\n` +
      `{\n` +
      `  \"responsibilities\": [\"...\"],\n` +
      `  \"requiredSkills\": [\"...\"],\n` +
      `  \"preferredQualifications\": [\"...\"],\n` +
      `  \"keywords\": [\"...\"]\n` +
      `}\n\n` +
      `JOB POSTING:\n${jobText}`,
    temperature: 0.2,
  });
  if (primary.ok) return primary;

  // If the model returns a different structure, do a single repair pass.
  if (primary.reason === "schema_mismatch") {
    const repair = await safeJson({
      schema,
      system:
        "You convert arbitrary job-posting JSON into InternPilot's required JSON shape. Output MUST be a single JSON object with EXACT keys: responsibilities, requiredSkills, preferredQualifications, keywords. Arrays of strings only. No extra keys.",
      user:
        `Take the job posting text and extract the required fields.\n\n` +
        `Return JSON ONLY with EXACT keys:\n` +
        `responsibilities, requiredSkills, preferredQualifications, keywords.\n\n` +
        `JOB POSTING:\n${jobText}`,
      temperature: 0.2,
    });
    if (repair.ok) return repair;
  }

  return primary;
}

export async function openaiMatch<T extends z.ZodTypeAny>(opts: {
  resumeText: string;
  jobAnalysisJson: string;
  schema: T;
}) {
  const primary = await safeJson({
    schema: opts.schema,
    system:
      "You are InternPilot. RULES: Never invent experience not in the resume. Highlight transferable skills. Keep gaps constructive. Output MUST be a single JSON object with EXACT keys: strongestMatches, transferableSkills, skillGaps, suggestions. Values must be arrays of short strings. No extra keys.",
    user:
      `Return JSON ONLY with EXACT keys.\n\n` +
      `Required output JSON shape (example, replace values):\n` +
      `{\n` +
      `  \"strongestMatches\": [\"...\"],\n` +
      `  \"transferableSkills\": [\"...\"],\n` +
      `  \"skillGaps\": [\"...\"],\n` +
      `  \"suggestions\": [\"...\"]\n` +
      `}\n\n` +
      `RESUME TEXT:\n${opts.resumeText}\n\nJOB ANALYSIS JSON:\n${opts.jobAnalysisJson}`,
    temperature: 0.2,
  });
  if (primary.ok) return primary;

  if (primary.reason === "schema_mismatch") {
    const repair = await safeJson({
      schema: opts.schema,
      system:
        "You convert arbitrary match output into InternPilot's required JSON shape. Output MUST be a single JSON object with EXACT keys: strongestMatches, transferableSkills, skillGaps, suggestions. Arrays of strings only. No extra keys.",
      user:
        `Create a match analysis from the resume and job analysis.\n\n` +
        `Return JSON ONLY with EXACT keys:\n` +
        `strongestMatches, transferableSkills, skillGaps, suggestions.\n\n` +
        `RESUME TEXT:\n${opts.resumeText}\n\nJOB ANALYSIS JSON:\n${opts.jobAnalysisJson}`,
      temperature: 0.2,
    });
    if (repair.ok) return repair;
  }

  return primary;
}

export async function openaiRefinementQuestions<T extends z.ZodTypeAny>(opts: {
  resumeText: string;
  jobAnalysisJson: string;
  matchJson: string;
  schema: T;
}) {
  return safeJson({
    schema: opts.schema,
    system:
      "You are InternPilot. Ask 2-3 short refinement questions to tailor resume bullets and cover letter. " +
      "Questions should be easy for a student to answer. " +
      'Output MUST be a single JSON object in exactly this shape: { "questions": ["question 1", "question 2"] }. ' +
      "Each question must be a plain string. Do NOT return objects. Do NOT include a type field. No extra keys.",
    user:
      `Return JSON ONLY in exactly this format:\n\n` +
      `{\n` +
      `  "questions": ["question 1", "question 2"]\n` +
      `}\n\n` +
      `Do NOT return objects. Only strings.\n\n` +
      `RESUME TEXT:\n${opts.resumeText}\n\n` +
      `JOB ANALYSIS JSON:\n${opts.jobAnalysisJson}\n\n` +
      `MATCH JSON:\n${opts.matchJson}`,
    temperature: 0.5,
  });
}

export async function openaiGenerate<T extends z.ZodTypeAny>(opts: {
  resumeText: string;
  jobAnalysisJson: string;
  matchJson: string;
  preferencesJson?: string;
  schema: T;
}) {
  const primary = await safeJson({
    schema: opts.schema,
    system:
  "You are InternPilot. RULES: Never invent experience not in the resume. " +
"Keep tone professional and student-appropriate. Use action verbs. Tailor directly to the job posting. " +
"Never use the phrase 'as advertised'" +
"Each cover letter MUST be a complete letter. " +
"That means each cover letter must include: " +
"1) the exact salutation 'Dear Hiring Manager,', " +
"2) 2 to 3 body paragraphs, " +
"3) the exact closing 'Sincerely,', " +
"4) the exact applicant name 'Andrew Toeppner' on the final line. " +
"Do not omit the greeting or signature. " +
"Output MUST be a single JSON object with EXACT keys: resumeBullets, coverLetterMain, coverLetterAltA, coverLetterAltB. No extra keys.",
    user:
      `Return JSON ONLY with EXACT keys.\n\n` +
      `Required output JSON shape (example, replace values):\n` +
      `{\n` +
      `  "resumeBullets": ["..."],\n` +
      `  "coverLetterMain": "...",\n` +
      `  "coverLetterAltA": "...",\n` +
      `  "coverLetterAltB": "..."\n` +
      `}\n\n` +
      `Each cover letter must:\n` +
      `- begin with exactly: Dear Hiring Manager,\n` +
      `- include 2 to 3 body paragraphs\n` +
      `- end with exactly:\nSincerely,\nAndrew Toeppner\n\n` +
      `RESUME TEXT:\n${opts.resumeText}\n\n` +
      `JOB ANALYSIS JSON:\n${opts.jobAnalysisJson}\n\n` +
      `MATCH JSON:\n${opts.matchJson}\n\n` +
      `PREFERENCES JSON (optional):\n${opts.preferencesJson ?? "{}"}`,
    temperature: 0.35,
  });
  if (primary.ok) return primary;

  if (primary.reason === "schema_mismatch") {
    const repair = await safeJson({
      schema: opts.schema,
      system:
        "You convert arbitrary generation output into InternPilot's required JSON shape. " +
        "Output MUST be a single JSON object with EXACT keys: resumeBullets, coverLetterMain, coverLetterAltA, coverLetterAltB. " +
        "resumeBullets is an array of strings; cover letters are strings. " +
        "Each cover letter must be a complete letter with the exact salutation 'Dear Hiring Manager,' and the exact closing 'Sincerely,' followed by 'Andrew Toeppner'. " +
        "No extra keys.",
      user:
        `Generate tailored resume bullets and 3 complete cover letter versions.\n\n` +
        `Return JSON ONLY with EXACT keys:\n` +
        `resumeBullets, coverLetterMain, coverLetterAltA, coverLetterAltB.\n\n` +
        `Each cover letter must:\n` +
        `- begin with exactly: Dear Hiring Manager,\n` +
        `- include 2 to 3 body paragraphs\n` +
        `- end with exactly:\nSincerely,\nAndrew Toeppner\n\n` +
        `RESUME TEXT:\n${opts.resumeText}\n\n` +
        `JOB ANALYSIS JSON:\n${opts.jobAnalysisJson}\n\n` +
        `MATCH JSON:\n${opts.matchJson}\n\n` +
        `PREFERENCES JSON (optional):\n${opts.preferencesJson ?? "{}"}`,
      temperature: 0.35,
    });
    if (repair.ok) return repair;
  }

  return primary;
}

