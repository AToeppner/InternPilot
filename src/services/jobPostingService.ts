import * as cheerio from "cheerio";

function normalizeText(input: string): string {
  return input
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function removeNoise($: cheerio.CheerioAPI) {
  $(
    [
      "script",
      "style",
      "noscript",
      "svg",
      "iframe",
      "form",
      "button",
      "input",
      "textarea",
      "select",
      "nav",
      "footer",
      "header",
      "aside",
      '[aria-hidden="true"]',
      '[class*="cookie"]',
      '[class*="banner"]',
      '[class*="modal"]',
      '[class*="tooltip"]',
      '[class*="dropdown"]',
      '[class*="recommend"]',
      '[class*="related"]',
      '[class*="social"]',
      '[id*="cookie"]',
      '[id*="modal"]',
    ].join(", ")
  ).remove();
}

function pickBestText($: cheerio.CheerioAPI): string {
  const candidateSelectors = [
    "main",
    "article",
    '[role="main"]',
    '[class*="job-description"]',
    '[class*="job_description"]',
    '[class*="description"]',
    '[class*="posting"]',
    '[class*="jobPosting"]',
    '[class*="job-posting"]',
    '[id*="job-description"]',
    '[id*="job_description"]',
    '[id*="description"]',
    '[id*="posting"]',
  ];

  let bestText = "";

  for (const selector of candidateSelectors) {
    $(selector).each((_, el) => {
      const text = normalizeText($(el).text());
      if (text.length > bestText.length) {
        bestText = text;
      }
    });
  }

  if (bestText.length >= 400) return bestText;

  return normalizeText($("body").text());
}

export async function fetchJobPostingTextFromUrl(url: string) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent":
        "InternPilotDemoBot/1.0 (school demo; Next.js fetch; contact: demo@example.com)",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const hint =
      res.status === 403 || res.status === 429
        ? " (site blocked automated requests)"
        : "";
    throw new Error(`Fetch failed with status ${res.status}${hint}. ${body.slice(0, 120)}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    throw new Error(`Expected HTML but received "${contentType}"`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  removeNoise($);

  const cleaned = pickBestText($);

  if (cleaned.length < 200) {
    throw new Error("Scrape produced too little text (likely blocked or page is JS-rendered).");
  }

  return cleaned;
}