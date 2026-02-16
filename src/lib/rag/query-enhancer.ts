import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { EnhancedQuery } from "@/types/rag";
import { extractArticleRefs, articleNumberToId } from "@/lib/utils/article-parser";
import { detectLibro, expandQuery } from "@/lib/utils/legal-terms";

export async function enhanceQuery(
  query: string,
  options: { useHyDE?: boolean; useQueryExpansion?: boolean } = {}
): Promise<EnhancedQuery> {
  const detectedArticles = extractArticleRefs(query).map(articleNumberToId);
  const detectedLibro = detectLibro(query);

  const expanded = options.useQueryExpansion !== false ? expandQuery(query) : query;

  const [rewritten, hyde, subQueries] = await Promise.all([
    rewriteQuery(expanded),
    shouldUseHyDE(query, detectedArticles, options.useHyDE)
      ? generateHyDE(query)
      : Promise.resolve(undefined),
    isComplexQuery(query) ? decomposeQuery(query) : Promise.resolve(undefined),
  ]);

  return {
    original: query,
    rewritten,
    hyde,
    subQueries,
    detectedArticles,
    detectedLibro,
  };
}

async function rewriteQuery(query: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      maxOutputTokens: 200,
      system:
        "Eres un experto en el Estatuto Tributario colombiano. Reescribe la consulta del usuario usando terminología legal precisa del Estatuto Tributario. Responde SOLO con la consulta reescrita, sin explicaciones.",
      prompt: query,
    });
    return text.trim() || query;
  } catch {
    return query;
  }
}

function shouldUseHyDE(
  query: string,
  detectedArticles: string[],
  forceHyDE?: boolean
): boolean {
  if (forceHyDE !== undefined) return forceHyDE;
  if (detectedArticles.length > 0) return false;
  if (query.length < 50) return false;
  return true;
}

async function generateHyDE(query: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      maxOutputTokens: 300,
      system:
        "Eres un experto en el Estatuto Tributario colombiano. Genera un párrafo hipotético que podría ser el texto de un artículo del Estatuto Tributario que respondería esta pregunta. Escribe SOLO el párrafo, sin preámbulos.",
      prompt: query,
    });
    return text.trim();
  } catch {
    return "";
  }
}

function isComplexQuery(query: string): boolean {
  const lower = query.toLowerCase();
  const hasConjunctions = /\by\b/.test(lower) && query.length > 80;
  const hasMultipleClauses = (query.match(/[,;]/g) || []).length >= 2;
  const hasComparison = /diferencia|compar|versus|vs\b/i.test(lower);
  return hasConjunctions || hasMultipleClauses || hasComparison;
}

async function decomposeQuery(query: string): Promise<string[]> {
  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      maxOutputTokens: 300,
      system:
        "Descompón esta pregunta tributaria en 2-3 sub-preguntas simples. Responde con una sub-pregunta por línea, sin numeración ni viñetas.",
      prompt: query,
    });
    return text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 10)
      .slice(0, 3);
  } catch {
    return [];
  }
}
