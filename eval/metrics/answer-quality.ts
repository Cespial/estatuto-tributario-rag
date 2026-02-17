import { SourceCitation } from "@/types/rag";

export function citationAccuracy(
  answer: string,
  expectedArticles: string[]
): number {
  // Check how many expected articles are cited in the answer
  let cited = 0;
  for (const art of expectedArticles) {
    const num = art.replace("Art. ", "");
    const patterns = [
      new RegExp(`Art\\.?\\s*${num}\\b`, "i"),
      new RegExp(`artículo\\s*${num}\\b`, "i"),
      new RegExp(`articulo\\s*${num}\\b`, "i"),
    ];
    if (patterns.some((p) => p.test(answer))) {
      cited++;
    }
  }

  return expectedArticles.length > 0 ? cited / expectedArticles.length : 0;
}

export function sourcePresence(
  sources: SourceCitation[],
  expectedArticles: string[]
): number {
  const sourceArticles = new Set(sources.map((s) => s.idArticulo));
  const found = expectedArticles.filter((a) => sourceArticles.has(a));
  return expectedArticles.length > 0 ? found.length / expectedArticles.length : 0;
}

export function answerContainsExpected(
  answer: string,
  expectedContains: string[]
): number {
  const lower = answer.toLowerCase();
  const found = expectedContains.filter((term) =>
    lower.includes(term.toLowerCase())
  );
  return expectedContains.length > 0
    ? found.length / expectedContains.length
    : 0;
}
