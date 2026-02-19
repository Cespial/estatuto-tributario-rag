import type { TipoObligacionFiscal } from "@/config/relaciones-tributarias";
import type { DeadlineStatus } from "@/lib/calendar/status";

export interface CalendarDeadlineItem {
  id: string;
  obligacion: string;
  descripcion: string;
  periodo: string;
  ultimoDigito: string;
  fecha: string;
  tipoContribuyente: "grandes" | "juridicas" | "naturales" | "todos";
  tipoObligacion: TipoObligacionFiscal;
  etiquetaTipo: string;
  tipoBadgeClassName: string;
  tipoPuntoClassName: string;
  calculadoraHref: string;
  relatedIndicatorIds: string[];
  relatedNovedadIds: string[];
  status: DeadlineStatus;
  daysToDeadline: number;
}

