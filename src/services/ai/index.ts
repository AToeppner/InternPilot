import {
  GeneratedOutputsSchema,
  JobAnalysisSchema,
  MatchAnalysisSchema,
  RefinementQuestionsSchema,
  type GeneratedOutputs,
  type JobAnalysis,
  type MatchAnalysis,
  type RefinementQuestions,
} from "./schemas";
import { mockAnalyzeJobPosting, mockGenerateOutputs, mockMatch, mockRefinementQuestions } from "./mock";
import { openaiAnalyzeJobPosting, openaiGenerate, openaiMatch, openaiRefinementQuestions } from "./openai";

export type AiFallbackReason =
  | "missing_api_key"
  | "openai_error"
  | "no_json_found"
  | "json_parse_error"
  | "schema_mismatch"
  | "unknown";

export async function analyzeJobPosting(
  jobText: string,
): Promise<{ data: JobAnalysis; usedMock: boolean; reason: AiFallbackReason | null }> {
  const ai = await openaiAnalyzeJobPosting(jobText, JobAnalysisSchema);
  if (ai.ok) return { data: ai.data, usedMock: false, reason: null };
  return { data: mockAnalyzeJobPosting(jobText), usedMock: true, reason: ai.reason ?? "unknown" };
}

export async function matchResume(opts: {
  resumeText: string;
  job: JobAnalysis;
}): Promise<{ data: MatchAnalysis; usedMock: boolean; reason: AiFallbackReason | null }> {
  const ai = await openaiMatch({
    resumeText: opts.resumeText,
    jobAnalysisJson: JSON.stringify(opts.job),
    schema: MatchAnalysisSchema,
  });
  if (ai.ok) return { data: ai.data, usedMock: false, reason: null };
  return { data: mockMatch(opts.resumeText, opts.job), usedMock: true, reason: ai.reason ?? "unknown" };
}

export async function refinementQuestions(opts: {
  resumeText: string;
  job: JobAnalysis;
  match: MatchAnalysis;
}): Promise<{ data: RefinementQuestions; usedMock: boolean; reason: AiFallbackReason | null }> {
  const ai = await openaiRefinementQuestions({
    resumeText: opts.resumeText,
    jobAnalysisJson: JSON.stringify(opts.job),
    matchJson: JSON.stringify(opts.match),
    schema: RefinementQuestionsSchema,
  });
  if (ai.ok) return { data: ai.data, usedMock: false, reason: null };
  return {
    data: mockRefinementQuestions(opts.resumeText, opts.job, opts.match),
    usedMock: true,
    reason: ai.reason ?? "unknown",
  };
}

export async function generateOutputs(opts: {
  resumeText: string;
  job: JobAnalysis;
  match: MatchAnalysis;
  preferences?: Record<string, string>;
}): Promise<{ data: GeneratedOutputs; usedMock: boolean; reason: AiFallbackReason | null }> {
  const ai = await openaiGenerate({
    resumeText: opts.resumeText,
    jobAnalysisJson: JSON.stringify(opts.job),
    matchJson: JSON.stringify(opts.match),
    preferencesJson: JSON.stringify(opts.preferences ?? {}),
    schema: GeneratedOutputsSchema,
  });
  if (ai.ok) return { data: ai.data, usedMock: false, reason: null };
  return { data: mockGenerateOutputs(opts), usedMock: true, reason: ai.reason ?? "unknown" };
}

