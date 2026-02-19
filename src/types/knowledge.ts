import type { GlosarioTerm } from "@/config/glosario-data";
import type { GuiaEducativa, DecisionNode } from "@/config/guias-data";
import type { DoctrinaDIAN } from "@/config/doctrina-data";

export type CategoriaConocimiento =
  | "renta"
  | "iva"
  | "retencion"
  | "procedimiento"
  | "laboral"
  | "sanciones"
  | "general";

export type NivelContenido = "basico" | "intermedio" | "avanzado";

export type PerfilContribuyente =
  | "persona-natural"
  | "persona-juridica"
  | "gran-contribuyente"
  | "independiente"
  | "pyme"
  | "esal";

export type EstadoVigenciaDoctrina = "vigente" | "revocado" | "suspendido";

export interface FormulaVisual {
  expresion: string;
  lectura: string;
  variables: Array<{ simbolo: string; significado: string }>;
}

export interface DiagramaVisual {
  tipo: "flujo" | "relacion";
  nodos: Array<{ id: string; etiqueta: string }>;
  conexiones: Array<{ desde: string; hacia: string; etiqueta?: string }>;
}

export interface EjemploPractico {
  titulo: string;
  contexto: string;
  solucion: string;
  errorComun?: string;
}

export interface GlosarioTermEnriched extends GlosarioTerm {
  id: string;
  categoria: CategoriaConocimiento;
  nivel: NivelContenido;
  aliases: string[];
  explicacionSimple: string;
  ejemploPractico?: EjemploPractico;
  formula?: FormulaVisual;
  diagrama?: DiagramaVisual;
  frecuenteScore: number;
  relacionadosGuias: string[];
  relacionadosDoctrina: string[];
  relacionadasCalculadoras: string[];
  actualizadoEn: string;
}

export interface DecisionNodeEnriched extends DecisionNode {
  ayudaRapida?: string;
  accionesSugeridas?: string[];
  articulosET?: string[];
  terminosClave?: string[];
  doctrinaRelacionada?: string[];
  calculadoraRecomendada?: {
    label: string;
    href: string;
  };
}

export interface GuiaEducativaEnriched extends Omit<GuiaEducativa, "nodos"> {
  tiempoEstimadoMin: number;
  perfilesObjetivo: PerfilContribuyente[];
  tags: string[];
  guiasRelacionadas: string[];
  actualizadoEn: string;
  nodos: DecisionNodeEnriched[];
}

export interface DoctrinaEnriched extends Omit<DoctrinaDIAN, "vigente"> {
  vigencia: EstadoVigenciaDoctrina;
  revocadoPor?: string;
  reemplazaA?: string[];
  perfilesImpactados: PerfilContribuyente[];
  terminosClave: string[];
  guiasRelacionadas: string[];
  calculadorasRelacionadas: string[];
  impactoPractico: "alto" | "medio" | "bajo";
  esDoctrinaClave: boolean;
  contextoClaro: string;
}

export interface ResultadoBusquedaGlosario {
  term: GlosarioTermEnriched;
  score: number;
  motivos: string[];
}

export interface ResultadoBusquedaDoctrina {
  doc: DoctrinaEnriched;
  score: number;
  motivos: string[];
}

export interface GuiaProgressSnapshot {
  guiaId: string;
  currentNodeId: string;
  history: string[];
  selectedOptions: Array<{
    nodeId: string;
    label: string;
    nextNodeId: string;
  }>;
  startedAt: string;
  updatedAt: string;
  completed: boolean;
}
