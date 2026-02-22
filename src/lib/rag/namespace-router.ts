import { PineconeNamespace } from "@/types/rag";
import { RAG_CONFIG } from "@/config/constants";

/**
 * Prioritize namespaces based on query intent detection.
 * Returns namespaces in order of priority for the given query.
 */
export function prioritizeNamespaces(query: string): PineconeNamespace[] {
  const lower = query.toLowerCase();

  // Doctrina/conceptos DIAN
  if (/concepto|dian|doctrina|interpreta|oficio|circular/i.test(lower)) {
    return ["doctrina", "", "resoluciones"];
  }

  // Jurisprudencia
  if (/sentencia|corte|constitucional|exequib|inexequib|magistrad|tutela/i.test(lower)) {
    return ["jurisprudencia", ""];
  }

  // Decretos reglamentarios
  if (/decreto|reglament|dur\s|1625/i.test(lower)) {
    return ["decretos", ""];
  }

  // Resoluciones DIAN
  if (/resoluc|procedimiento|plazo|formato|formulario|declaraci[oó]n/i.test(lower)) {
    return ["resoluciones", ""];
  }

  // Leyes tributarias
  if (/ley\s+\d|reforma|tributaria\s+\d{4}/i.test(lower)) {
    return ["leyes", ""];
  }

  // Default: artículos first, then all additional namespaces
  return ["", ...RAG_CONFIG.additionalNamespaces];
}
