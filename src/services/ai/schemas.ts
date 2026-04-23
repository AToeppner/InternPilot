import { z } from "zod";

function normalizeKeys(input: unknown) {
  if (!input || typeof input !== "object") return input;
  const obj = input as Record<string, unknown>;

  // Shallow normalize a few common variants.
  const out: Record<string, unknown> = { ...obj };

  // snake_case → camelCase (common top-level keys)
  if (out.required_skills && !out.requiredSkills) out.requiredSkills = out.required_skills;
  if (out.preferred_qualifications && !out.preferredQualifications) out.preferredQualifications = out.preferred_qualifications;
  if (out.key_words && !out.keywords) out.keywords = out.key_words;

  // common short aliases
  if (out.skills && !out.requiredSkills) out.requiredSkills = out.skills;
  if (out.qualifications && !out.preferredQualifications) out.preferredQualifications = out.qualifications;
  if (out.responsibility && !out.responsibilities) out.responsibilities = out.responsibility;
  if (out.keyword_list && !out.keywords) out.keywords = out.keyword_list;

  // match schema variants
  if (out.strong_matches && !out.strongestMatches) out.strongestMatches = out.strong_matches;
  if (out.transferable && !out.transferableSkills) out.transferableSkills = out.transferable;
  if (out.gaps && !out.skillGaps) out.skillGaps = out.gaps;

  // generation variants
  if (out.bullets && !out.resumeBullets) out.resumeBullets = out.bullets;
  if (out.cover_letter && !out.coverLetterMain) out.coverLetterMain = out.cover_letter;
  if (out.coverLetter && !out.coverLetterMain) out.coverLetterMain = out.coverLetter;

  // refinement schema variants
  if (out.refinementQuestions && !out.questions) out.questions = out.refinementQuestions;
  // refinement schema variants
  if (out.questions && Array.isArray(out.questions)) {
  out.questions = out.questions
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "question" in item) {
        return String((item as Record<string, unknown>).question ?? "");
      }
      return "";
    })
    .filter(Boolean);
  }
  return out;
}

export const JobAnalysisSchema = z.preprocess(
  normalizeKeys,
  z.object({
    responsibilities: z.array(z.string()).min(1).max(20),
    requiredSkills: z.array(z.string()).min(1).max(30),
    preferredQualifications: z.array(z.string()).min(1).max(20),
    keywords: z.array(z.string()).min(1).max(50),
  }),
);

export type JobAnalysis = z.infer<typeof JobAnalysisSchema>;

export const MatchAnalysisSchema = z.preprocess(
  normalizeKeys,
  z.object({
    strongestMatches: z.array(z.string()).min(1).max(20),
    transferableSkills: z.array(z.string()).min(1).max(20),
    skillGaps: z.array(z.string()).min(1).max(20),
    suggestions: z.array(z.string()).min(1).max(30),
  }),
);

export type MatchAnalysis = z.infer<typeof MatchAnalysisSchema>;

export const GeneratedOutputsSchema = z.preprocess(
  normalizeKeys,
  z.object({
    resumeBullets: z.array(z.string()).min(1).max(12),
    coverLetterMain: z.string().min(120),
    coverLetterAltA: z.string().min(120),
    coverLetterAltB: z.string().min(120),
  }),
);

export type GeneratedOutputs = z.infer<typeof GeneratedOutputsSchema>;

export const RefinementQuestionsSchema = z.preprocess(
  normalizeKeys,
  z.object({
    questions: z.array(z.string()).min(1).max(5),
  }),
);

export type RefinementQuestions = z.infer<typeof RefinementQuestionsSchema>;

