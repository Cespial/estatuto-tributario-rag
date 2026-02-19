import { AssembledContext } from "@/types/rag";
import { buildContextString } from "./context-assembler";
import { ENHANCED_SYSTEM_PROMPT } from "../chat/system-prompt";
import { ChatPageContext } from "@/types/chat-history";

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

  const contextBlock = contextString
    ? `${pageContextBlock}<context>\n${contextString}\n</context>\n\nPregunta del usuario: ${userQuery}`
    : `${pageContextBlock}No se encontraron artículos relevantes en el Estatuto Tributario para esta consulta.\n\nPregunta del usuario: ${userQuery}`;

  const enhancedSystem = conversationHistory 
    ? `${ENHANCED_SYSTEM_PROMPT}\n\n${conversationHistory}`
    : ENHANCED_SYSTEM_PROMPT;

  return {
    system: enhancedSystem,
    contextBlock,
  };
}
