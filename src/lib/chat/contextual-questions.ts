export const CONTEXTUAL_QUESTIONS: Record<string, string[]> = {
  "/": [
    "¿Cuál es la tarifa de renta para personas jurídicas en 2026?",
    "Explique diferencia entre renta líquida y renta gravable.",
    "¿Qué artículo regula la retención por servicios?",
    "¿Cuándo aplica IVA del 19%?",
  ],
  "/comparar": [
    "Resume los cambios clave entre estas dos versiones.",
    "¿Qué impacto práctico tendría este cambio en DIAN?",
    "¿Qué artículo vigente respalda la versión más reciente?",
  ],
  "/favoritos": [
    "Ayúdame a convertir estos favoritos en un plan de trabajo.",
    "¿Qué preguntas debo resolver primero para mi cliente?",
  ],
  "/tablas/retencion": [
    "¿Qué concepto de retención aplica para honorarios de no declarantes?",
    "Explícame cuándo la base mínima en UVT no aplica.",
    "¿Qué diferencia hay entre Art. 392 y 401 para retención?",
  ],
  "/calculadoras/renta": [
    "¿Cómo se aplica la tabla del Art. 241 en un caso real?",
    "¿Qué deducciones y rentas exentas puedo incluir?",
    "Explique el impacto de la Ley 2277 en renta PN.",
  ],
  "/calculadoras/retencion": [
    "¿Cómo calcular retención para honorarios y servicios?",
    "¿Cuándo cambia la tarifa por declarante/no declarante?",
    "¿Qué base mínima aplica en UVT para este caso?",
  ],
};

export function getContextualQuestions(pathname: string): string[] {
  if (CONTEXTUAL_QUESTIONS[pathname]) return CONTEXTUAL_QUESTIONS[pathname];

  if (pathname.startsWith("/calculadoras/renta")) {
    return CONTEXTUAL_QUESTIONS["/calculadoras/renta"];
  }
  if (pathname.startsWith("/calculadoras/retencion")) {
    return CONTEXTUAL_QUESTIONS["/calculadoras/retencion"];
  }
  if (pathname.startsWith("/calculadoras")) {
    return [
      "¿Cómo se interpreta este resultado frente al Estatuto Tributario?",
      "¿Qué artículo sustenta este cálculo?",
      "¿Qué validaciones debería hacer antes de declarar?",
    ];
  }
  if (pathname.startsWith("/articulo/")) {
    return [
      "Explique este artículo en lenguaje profesional pero claro.",
      "¿Qué cambios normativos recientes afectan este artículo?",
      "¿Qué artículos se relacionan para sustentar un concepto?",
    ];
  }
  return CONTEXTUAL_QUESTIONS["/"];
}

export function getPageModule(pathname: string):
  | "home"
  | "comparar"
  | "favoritos"
  | "tablas-retencion"
  | "calculadora"
  | "articulo"
  | "other" {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/comparar")) return "comparar";
  if (pathname.startsWith("/favoritos")) return "favoritos";
  if (pathname.startsWith("/tablas/retencion")) return "tablas-retencion";
  if (pathname.startsWith("/calculadoras")) return "calculadora";
  if (pathname.startsWith("/articulo/")) return "articulo";
  return "other";
}
