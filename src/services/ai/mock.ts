import type { GeneratedOutputs, JobAnalysis, MatchAnalysis, RefinementQuestions } from "./schemas";

function uniq(items: string[]) {
  return Array.from(new Set(items.map((s) => s.trim()).filter(Boolean)));
}

function guessNameFromResume(resumeText: string) {
  const firstLine = resumeText
    .split(/\r?\n/g)
    .map((s) => s.trim())
    .find((s) => s.length > 0);
  if (!firstLine) return "Drew Toeppner";
  if (firstLine.toLowerCase().includes("resume")) return "Drew Toeppner";
  return firstLine;
}

function extractKeywords(text: string) {
  const t = text.toLowerCase();
  const candidates = [
    "excel",
    "pivot",
    "xlookup",
    "sql",
    "git",
    "unix",
    "linux",
    "api",
    "java",
    "python",
    "data",
    "analysis",
    "analytics",
    "dashboard",
    "stakeholder",
    "communication",
    "presentation",
    "teamwork",
    "leadership",
    "process",
    "report",
    "detail",
    "client",
  ];
  return candidates.filter((k) => t.includes(k));
}

export function mockAnalyzeJobPosting(jobText: string): JobAnalysis {
  const kws = uniq(extractKeywords(jobText));
  const requiredSkills = uniq([
    ...(kws.includes("excel") ? ["Excel (PivotTables, lookups)"] : []),
    "Clear written & verbal communication",
    "Teamwork and collaboration",
    "Analytical thinking",
    "Attention to detail",
    ...(kws.includes("data") ? ["Basic data analysis"] : []),
    ...(kws.includes("api") ? ["Comfort learning APIs"] : []),
    ...(kws.includes("git") ? ["Version control awareness (Git)"] : []),
  ]).slice(0, 12);

  return {
    responsibilities: [
      "Support cross-functional teams on initiatives and process improvements",
      "Analyze information and summarize findings for stakeholders",
      "Maintain spreadsheets/reports and ensure data accuracy",
      "Collaborate with teammates and take ownership of assigned tasks",
      "Contribute to presentations and written updates",
    ],
    requiredSkills,
    preferredQualifications: uniq([
      ...(kws.includes("java") ? ["Programming exposure (Java or similar)"] : ["Programming exposure (Java/Python)"]),
      ...(kws.includes("git") ? ["Git or version control"] : []),
      ...(kws.includes("sql") ? ["Interest in SQL / querying"] : ["Interest in SQL"]),
      "Leadership experience in clubs, teams, or work",
    ]).slice(0, 8),
    keywords: uniq([
      "cross-functional",
      "stakeholders",
      "process improvement",
      "reports",
      "dashboards",
      "data accuracy",
      ...kws,
    ]).slice(0, 18),
  };
}

export function mockMatch(resumeText: string, job: JobAnalysis): MatchAnalysis {
  const r = resumeText.toLowerCase();
  const matched = (skill: string) => r.includes(skill.toLowerCase());

  const strongestMatches = uniq([
    "Shift leadership experience (leading a team, assigning tasks, resolving issues)",
    "Excel/data comfort (spreadsheets, accuracy, basic analysis)",
    "Training + communication (onboarding employees, clear instructions)",
    "API project experience (Java app calling an external API with error handling)",
    "Operations + accountability (budgets, reconciliation, inventory checks)",
  ]).slice(0, 6);

  const transferableSkills = uniq([
    "Stakeholder-friendly communication",
    "Team coordination and ownership",
    "Prioritization under time pressure",
    "Attention to detail and accuracy checks",
    "Learning new tools quickly",
  ]).slice(0, 8);

  const skillGaps = uniq([
    matched("sql") ? "Deeper SQL practice (joins, aggregations, real datasets)" : "SQL fundamentals (joins, aggregations)",
    matched("dashboard") ? "More dashboard/report examples (even simple ones)" : "Basic dashboard/reporting examples",
    "Business writing: 1–2 concise stakeholder updates",
  ]).slice(0, 6);

  const suggestions = uniq([
    "Add one quantified bullet (team size, volume, or error reduction) to show impact.",
    "Name the tools: Excel features used, Git workflow, and any API libraries.",
    "Create a tiny SQL mini-project (sample dataset + 3 queries) to show momentum.",
    "For presentations, include a short example of explaining findings to non-technical audiences.",
  ]).slice(0, 8);

  // Lightly tailor based on job keywords
  if (job.keywords.some((k) => k.toLowerCase().includes("client"))) {
    strongestMatches.unshift("Customer/client-facing experience (service mindset + communication)");
  }

  return {
    strongestMatches: strongestMatches.slice(0, 8),
    transferableSkills,
    skillGaps,
    suggestions,
  };
}

export function mockRefinementQuestions(resumeText: string, job: JobAnalysis, match: MatchAnalysis): RefinementQuestions {
  const hints = resumeText.toLowerCase();
  const mentionsTech = hints.includes("java") || hints.includes("api") || hints.includes("sql");
  const mentionsLead = hints.includes("lead") || hints.includes("shift") || hints.includes("recruit");
  const wantsClient = job.keywords.some((k) => k.toLowerCase().includes("client"));
  const gapHint = match.skillGaps?.[0] ? ` (e.g., ${match.skillGaps[0]})` : "";
  return {
    questions: [
      mentionsLead && mentionsTech
        ? "Do you want to emphasize leadership (shift lead/recruitment) or technical skills (Java/APIs/SQL learning) more?"
        : "Which strength should we emphasize most: leadership, analysis, or communication?",
      "Which project or experience should be the centerpiece (OpenAI Java app, Excel/data work, or shift leadership)?",
      wantsClient
        ? "Do you want to lean into a client/service mindset, or internal operations/process improvement?"
        : `Is there a specific skill gap you want to address${gapHint}, or should we focus on your strengths?`,
    ],
  };
}

export function mockGenerateOutputs(opts: {
  resumeText: string;
  job: JobAnalysis;
  match: MatchAnalysis;
  preferences?: Record<string, string>;
}): GeneratedOutputs {
  const fullName = guessNameFromResume(opts.resumeText);
  const pref = Object.values(opts.preferences ?? {}).join(" ").toLowerCase();
  const leanLeadership = pref.includes("lead") || pref.includes("leadership");
  const leanTechnical = pref.includes("tech") || pref.includes("java") || pref.includes("api") || pref.includes("sql");

  const bullets = uniq([
    "Led a 5-person shift team in a high-volume environment, prioritizing tasks and resolving issues to maintain service quality and accuracy.",
    "Trained new employees on POS workflows and customer communication, improving onboarding consistency and reducing common mistakes.",
    "Built a Java project that integrates an external API (OpenAI), using structured prompts and robust error handling to improve output quality.",
    "Supported daily budget and inventory checks, ensuring accurate reconciliation and clear handoffs to stakeholders.",
    "Collaborated with a 6-person team during peak hours, communicating quickly and adapting to changing priorities.",
  ])
    .filter((b) => {
      if (leanLeadership) return true;
      if (leanTechnical) return !b.toLowerCase().includes("shift team") || b.toLowerCase().includes("api");
      return true;
    })
    .slice(0, 6);

  const base = {
    company: "the team",
    role: "this internship",
  };

  const coverMain = `Dear Hiring Team,

I’m a University of Georgia MIS student with a Computing Certificate, excited to apply for ${base.role}. I’m drawn to opportunities that combine business context with technology and data awareness, and I bring strong communication, teamwork, and an analytical mindset.

In my role as a shift leader, I coordinate a five-person team in a fast-paced environment. I assign tasks, train new employees, and support daily budget and inventory checks—work that strengthened my attention to detail and ability to communicate clearly. I also enjoy the technical side: I built a Java app that calls an external API (OpenAI) and improved output quality through structured prompts and error handling, which reflects how I approach learning new tools and improving processes.

I’d love to contribute to cross-functional initiatives by maintaining accurate reports, summarizing findings clearly, and taking ownership of assigned tasks. Thank you for your time and consideration.

Sincerely,
${fullName}`;

  const coverA = `Dear Hiring Team,

I’m excited to apply for ${base.role} because it fits how I like to work: collaborate with a team, keep details accurate, and communicate progress clearly. As a UGA MIS student, I’m especially interested in roles where business decisions are supported by data and systems.

As a shift leader, I coordinate a team of five, train new employees, and help with daily reconciliation tasks—experience that taught me to prioritize quickly and communicate expectations in a calm, clear way. Outside of work, I built a Java project that integrates an external API (OpenAI), where I focused on reliable inputs, error handling, and iteration—skills that translate to learning new tools fast and improving processes.

I’d be thrilled to bring this mix of leadership and curiosity to your team this summer. Thank you for considering my application.

Sincerely,
${fullName}`;

  const coverB = `Dear Hiring Team,

I’m applying for ${base.role} because it matches my strengths: accurate execution, structured problem-solving, and stakeholder-friendly communication. I’m a UGA MIS student with a Computing Certificate who enjoys turning information into clear next steps.

In a shift leadership role, I regularly assess priorities, assign responsibilities, and resolve issues quickly to maintain service standards. I also support budget and inventory checks, which reinforced careful validation and clear handoffs. In parallel, I built a Java app integrating an external API (OpenAI) with prompt templates and error handling, demonstrating comfort with basic technical concepts and iterative improvement.

I would welcome the opportunity to support cross-functional projects, maintain reliable reporting, and communicate findings clearly. Thank you for your consideration.

Sincerely,
${fullName}`;

  return {
    resumeBullets: bullets,
    coverLetterMain: coverMain,
    coverLetterAltA: coverA,
    coverLetterAltB: coverB,
  };
}

