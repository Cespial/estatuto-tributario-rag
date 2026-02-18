import { AssembledContext } from "@/types/rag";
import { buildContextString } from "./context-assembler";
import { ENHANCED_SYSTEM_PROMPT } from "../chat/system-prompt";

export function buildMessages(
  userQuery: string,
  context: AssembledContext,
  conversationHistory: string = ""
): { system: string; contextBlock: string } {
  const contextString = buildContextString(context);

  const contextBlock = contextString
    ? `<context>\n${contextString}\n</context>\n\nPregunta del usuario: ${userQuery}`
    : `No se encontraron artículos relevantes en el Estatuto Tributario para esta consulta.\n\nPregunta del usuario: ${userQuery}`;

  const enhancedSystem = conversationHistory 
    ? `${ENHANCED_SYSTEM_PROMPT}\n\n${conversationHistory}`
    : ENHANCED_SYSTEM_PROMPT;

  return {
    system: enhancedSystem,
    contextBlock,
  };
}
