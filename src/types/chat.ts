import { SourceCitation } from "./rag";

export interface ChatSource extends SourceCitation {
  snippet?: string;
}

export interface ChatFilters {
  libro?: string;
}

export interface ChatRequestBody {
  messages: Array<{ role: string; content: string }>;
  filters?: ChatFilters;
}
