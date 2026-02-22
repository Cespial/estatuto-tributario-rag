import { AssembledContext } from "@/types/rag";
import { buildContextString } from "./context-assembler";
import { ENHANCED_SYSTEM_PROMPT } from "../chat/system-prompt";
import { ChatPageContext } from "@/types/chat-history";

const CITATION_INSTRUCTIONS = `

Reglas de citación — Cita SIEMPRE las fuentes con el formato correcto según su tipo:
- Artículos del ET: "Art. 240 ET"
- Doctrina DIAN: "Concepto DIAN No. 012345 de 2024"
- Jurisprudencia CC: "Sentencia C-032 de 2019, M.P. [Nombre]"
- Jurisprudencia CE: "Sentencia CE Sección Cuarta, Exp. 12345 de 2020"
- Decretos: "Art. 1.2.1.5.1, Decreto 1625 de 2016"
- Resoluciones: "Resolución DIAN No. 000042 de 2023"

Cuando el contexto incluya fuentes externas (<doctrina>, <jurisprudencia>, <decreto>, <resolucion>), integra esa información en tu respuesta y cítala correctamente. Prioriza doctrina vigente sobre revocada, y sentencias de unificación (SU-) sobre sentencias de tutela (T-).`;

export function buildMessages(
  userQuery: string,
  context: AssembledContext,
  conversationHistory: string = "",
  pageContext?: ChatPageContext
): { system: string; contextBlock: string } {
  const contextString = buildContextString(context);
  const pageContextBlock = pageContext
    ? `<page_context>\n${JSON.stringify(pageContext, null, 2)}\n</page_context>\n\n`
    : "";

  const hasExternalSources =
    context.externalSources && context.externalSources.length > 0;

  const contextBlock = contextString
    ? `${pageContextBlock}<context>\n${contextString}\n</context>\n\nPregunta del usuario: ${userQuery}`
    : `${pageContextBlock}No se encontraron artículos relevantes en las fuentes consultadas para esta consulta.\n\nPregunta del usuario: ${userQuery}`;

  // Add citation instructions when external sources are present
  const citationBlock = hasExternalSources ? CITATION_INSTRUCTIONS : "";

  const enhancedSystem = conversationHistory
    ? `${ENHANCED_SYSTEM_PROMPT}${citationBlock}\n\n${conversationHistory}`
    : `${ENHANCED_SYSTEM_PROMPT}${citationBlock}`;

  return {
    system: enhancedSystem,
    contextBlock,
  };
}
