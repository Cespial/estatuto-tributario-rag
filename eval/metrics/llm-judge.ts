import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const judgeSchema = z.object({
  faithfulness: z
    .number()
    .min(1)
    .max(5)
    .describe("How faithful is the answer to the provided context?"),
  completeness: z
    .number()
    .min(1)
    .max(5)
    .describe("How complete is the answer?"),
  relevance: z
    .number()
    .min(1)
    .max(5)
    .describe("How relevant is the answer to the question?"),
  citation_quality: z
    .number()
    .min(1)
    .max(5)
    .describe("How well does the answer cite articles?"),
  clarity: z
    .number()
    .min(1)
    .max(5)
    .describe("How clear and well-structured is the answer?"),
  reasoning: z.string().describe("Brief explanation of scores"),
});

export type JudgeResult = z.infer<typeof judgeSchema>;

export async function llmJudge(
  question: string,
  answer: string,
  context: string,
  expectedArticles: string[]
): Promise<JudgeResult> {
  const { object } = await generateObject({
    model: anthropic("claude-haiku-4-5-20251001"),
    schema: judgeSchema,
    prompt: `Evalúa la siguiente respuesta sobre el Estatuto Tributario colombiano.

Pregunta: ${question}

Respuesta: ${answer}

Contexto proporcionado: ${context}

Artículos esperados: ${expectedArticles.join(", ")}

Evalúa en escala 1-5 cada dimensión:
1. Faithfulness: ¿La respuesta es fiel al contexto proporcionado?
2. Completeness: ¿La respuesta cubre todos los aspectos de la pregunta?
3. Relevance: ¿La respuesta es relevante a la pregunta?
4. Citation quality: ¿Cita correctamente los artículos del ET?
5. Clarity: ¿La respuesta es clara y bien estructurada?`,
  });

  return object;
}

export function compositeScore(judge: JudgeResult): number {
  return (
    (judge.faithfulness +
      judge.completeness +
      judge.relevance +
      judge.citation_quality +
      judge.clarity) /
    5
  );
}
