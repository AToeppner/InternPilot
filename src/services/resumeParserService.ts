import { getData } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

// Set the worker once, before creating parsers.
PDFParse.setWorker(getData());

export async function parseResumePdf(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const textResult = await parser.getText();

    const rawText = textResult?.text ?? "";

    const text = rawText
      .replace(/\u0000/g, "")
      .replace(/\r/g, "\n")
      .replace(/\t/g, " ")
      .replace(/[ ]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return {
      text,
      numpages:
        typeof textResult?.total === "number" ? textResult.total : null,
    };
  } catch (error) {
    console.error("[InternPilot] PDF parse error:", error);

    return {
      text: "",
      numpages: null,
    };
  } finally {
    await parser.destroy().catch(() => {});
  }
}