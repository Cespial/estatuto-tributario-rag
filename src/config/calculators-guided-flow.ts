export interface GuidedChoice {
  id: string;
  label: string;
}

export interface GuidedStep {
  id: string;
  title: string;
  choices: GuidedChoice[];
}

export interface GuidedRecommendation {
  primary: string;
  secondary: string[];
}

export const GUIDED_STEPS: GuidedStep[] = [
  {
    id: "need",
    title: "Que necesitas calcular?",
    choices: [
      { id: "declaracion-renta", label: "Declaracion de renta" },
      { id: "retencion-pagos", label: "Retencion en pagos" },
      { id: "nomina-costos", label: "Nomina y costos laborales" },
      { id: "tipo-contrato", label: "Tipo de contratacion" },
      { id: "obligacion-declarar", label: "Si debo declarar" },
    ],
  },
  {
    id: "profile",
    title: "Quien realiza el calculo?",
    choices: [
      { id: "contador", label: "Contador" },
      { id: "empresario", label: "Empresario PyME" },
      { id: "persona-natural", label: "Persona natural" },
    ],
  },
  {
    id: "frequency",
    title: "Con que frecuencia lo necesitas?",
    choices: [
      { id: "diario", label: "Diario" },
      { id: "mensual", label: "Mensual" },
      { id: "anual", label: "Anual" },
    ],
  },
];

const GUIDED_MAP: Record<string, GuidedRecommendation> = {
  "declaracion-renta|contador|anual": {
    primary: "renta",
    secondary: ["debo-declarar", "anticipo"],
  },
  "declaracion-renta|persona-natural|anual": {
    primary: "debo-declarar",
    secondary: ["renta", "retencion"],
  },
  "retencion-pagos|contador|mensual": {
    primary: "retencion",
    secondary: ["retencion-salarios", "renta"],
  },
  "retencion-pagos|empresario|mensual": {
    primary: "retencion",
    secondary: ["nomina-completa", "comparador"],
  },
  "nomina-costos|empresario|mensual": {
    primary: "nomina-completa",
    secondary: ["comparador", "seguridad-social"],
  },
  "tipo-contrato|empresario|mensual": {
    primary: "comparador",
    secondary: ["nomina-completa", "retencion"],
  },
  "obligacion-declarar|persona-natural|anual": {
    primary: "debo-declarar",
    secondary: ["renta", "retencion"],
  },
};

export function getGuidedRecommendation(answers: {
  need?: string;
  profile?: string;
  frequency?: string;
}): GuidedRecommendation | null {
  if (!answers.need || !answers.profile || !answers.frequency) {
    return null;
  }

  const exactKey = `${answers.need}|${answers.profile}|${answers.frequency}`;
  if (GUIDED_MAP[exactKey]) {
    return GUIDED_MAP[exactKey];
  }

  const partialKeys = [
    `${answers.need}|${answers.profile}|mensual`,
    `${answers.need}|persona-natural|anual`,
    `${answers.need}|empresario|mensual`,
  ];

  for (const key of partialKeys) {
    if (GUIDED_MAP[key]) {
      return GUIDED_MAP[key];
    }
  }

  return null;
}
