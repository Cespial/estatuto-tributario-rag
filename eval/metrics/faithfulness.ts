import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const faithfulnessSchema = z.object({
  supportedClaims: z
    .number()
    .describe("Number of claims in the answer that are supported by the context"),
  unsupportedClaims: z
    .number()
    .describe("Number of claims in the answer NOT supported by the context (possible hallucination)"),
  fabricatedArticles: z
    .array(z.string())
    .describe("Articles cited in the answer that are NOT present in the context"),
  fabricatedLaws: z
    .array(z.string())
    .describe("Laws or norms mentioned without source in the context"),
  reasoning: z.string().describe("Brief explanation of the evaluation"),
});

export interface FaithfulnessMetrics {
  supportedClaims: number;
  unsupportedClaims: number;
  faithfulnessScore: number;
  fabricatedArticles: string[];
  fabricatedLaws: string[];
  reasoning: string;
}

/**
 * Evaluate faithfulness of an answer against the provided context.
 * Uses Claude Haiku as a judge to assess whether claims are grounded.
 */
export async function evaluateFaithfulness(
  question: string,
  answer: string,
  context: string
): Promise<FaithfulnessMetrics> {
  const { object } = await generateObject({
    model: anthropic("claude-haiku-4-5-20251001"),
    schema: faithfulnessSchema,
    prompt: `Evalúa la fidelidad de la siguiente respuesta al contexto proporcionado.

Pregunta: ${question}

Contexto proporcionado:
${context}

Respuesta a evaluar:
${answer}

Instrucciones:
1. Cuenta cuántas afirmaciones factuales en la respuesta tienen soporte directo en el contexto (supportedClaims)
2. Cuenta cuántas afirmaciones NO tienen soporte en el contexto (unsupportedClaims) — esto indica posible alucinación
3. Lista artículos citados en la respuesta que NO aparecen en el contexto (fabricatedArticles)
4. Lista leyes o normas mencionadas sin fuente en el contexto (fabricatedLaws)
5. Explica brevemente tu evaluación (reasoning)`,
  });

  const total = object.supportedClaims + object.unsupportedClaims;

  return {
    supportedClaims: object.supportedClaims,
    unsupportedClaims: object.unsupportedClaims,
    faithfulnessScore: total > 0 ? object.supportedClaims / total : 1,
    fabricatedArticles: object.fabricatedArticles,
    fabricatedLaws: object.fabricatedLaws,
    reasoning: object.reasoning,
  };
}

/**
 * Quick heuristic check for hallucination indicators (no LLM needed).
 */
export function quickHallucinationCheck(
  answer: string,
  contextArticles: string[]
): { citedArticles: string[]; uncitedArticles: string[] } {
  // Extract all article references from the answer
  const articlePattern = /Art(?:ículo|\.)\s*(\d+(?:-\d+)?)/gi;
  const citedInAnswer = new Set<string>();

  let match;
  while ((match = articlePattern.exec(answer)) !== null) {
    citedInAnswer.add(`Art. ${match[1]}`);
  }

  const contextSet = new Set(contextArticles);
  const cited: string[] = [];
  const uncited: string[] = [];

  for (const art of citedInAnswer) {
    if (contextSet.has(art)) {
      cited.push(art);
    } else {
      uncited.push(art);
    }
  }

  return { citedArticles: cited, uncitedArticles: uncited };
}
