import { GLOSARIO } from "@/config/glosario-data";
import { GUIAS_EDUCATIVAS } from "@/config/guias-data";
import { DOCTRINA } from "@/config/doctrina-data";
import type {
  CategoriaConocimiento,
  DoctrinaEnriched,
  EstadoVigenciaDoctrina,
  GlosarioTermEnriched,
  GuiaEducativaEnriched,
  PerfilContribuyente,
  ResultadoBusquedaDoctrina,
  ResultadoBusquedaGlosario,
} from "@/types/knowledge";

const UPDATED_AT = "2026-02-19";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string): string {
  return normalizeText(value).replace(/\s+/g, "-");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: b.length + 1 }, (_, row) =>
    Array.from({ length: a.length + 1 }, (_, col) => (row === 0 ? col : col === 0 ? row : 0))
  );

  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
}

function parseArticleFromHref(href: string): string[] {
  const byArticlePath = href.match(/\/articulo\/([^/?#]+)/i);
  if (byArticlePath?.[1]) {
    return [byArticlePath[1]];
  }

  const byExplorer = href.match(/[?&]art=([^&]+)/i);
  if (byExplorer?.[1]) {
    return [byExplorer[1]];
  }

  return [];
}

function toUnique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

const TERM_ENRICHMENT: Record<
  string,
  Partial<Omit<GlosarioTermEnriched, "id" | "termino" | "definicion" | "articulos" | "relacionados">>
> = {
  "UVT": {
    categoria: "general",
    nivel: "basico",
    aliases: ["unidad de valor tributario"],
    explicacionSimple:
      "La UVT es la unidad con la que la DIAN expresa topes, sanciones y valores para que no dependan directamente de la inflación.",
    ejemploPractico: {
      titulo: "Tope para declarar renta",
      contexto:
        "Si una persona natural supera 1.400 UVT en ingresos brutos, normalmente queda obligada a declarar renta.",
      solucion:
        "Convierta primero UVT a pesos del año gravable y compare sus ingresos certificados.",
      errorComun: "Comparar topes con la UVT de un año diferente al que se declara.",
    },
    formula: {
      expresion: "Valor en pesos = UVT del año x número de UVT",
      lectura: "Multiplique la UVT vigente por la cantidad de UVT exigida en la norma.",
      variables: [
        { simbolo: "UVT del año", significado: "Valor oficial en pesos para ese año gravable" },
        { simbolo: "número de UVT", significado: "Tope o tarifa que señala el ET" },
      ],
    },
    frecuenteScore: 98,
    relacionadasCalculadoras: ["/calculadoras/uvt", "/calculadoras/debo-declarar"],
  },
  "Base gravable": {
    categoria: "renta",
    nivel: "basico",
    aliases: ["base", "depuracion"],
    explicacionSimple:
      "Es el valor final sobre el cual se aplica la tarifa del impuesto después de restar lo permitido por la ley.",
    ejemploPractico: {
      titulo: "Declaración de renta de un independiente",
      contexto:
        "Un profesional recibe ingresos, resta costos deducibles, aportes y beneficios autorizados para llegar a la base gravable.",
      solucion:
        "Documente cada costo/deducción y valide límites del 40% cuando aplique para personas naturales.",
      errorComun: "Restar gastos personales sin relación de causalidad.",
    },
    formula: {
      expresion: "Base gravable = Ingresos - Costos - Deducciones - Rentas exentas permitidas",
      lectura: "Parta de los ingresos y depure solo conceptos autorizados por el Estatuto Tributario.",
      variables: [
        { simbolo: "Ingresos", significado: "Total ingresos fiscales del periodo" },
        { simbolo: "Costos", significado: "Costos fiscalmente aceptados" },
        { simbolo: "Deducciones", significado: "Gastos deducibles con soporte" },
      ],
    },
    diagrama: {
      tipo: "flujo",
      nodos: [
        { id: "n1", etiqueta: "Ingresos" },
        { id: "n2", etiqueta: "(-) Costos" },
        { id: "n3", etiqueta: "(-) Deducciones" },
        { id: "n4", etiqueta: "Base gravable" },
      ],
      conexiones: [
        { desde: "n1", hacia: "n2" },
        { desde: "n2", hacia: "n3" },
        { desde: "n3", hacia: "n4" },
      ],
    },
    frecuenteScore: 96,
    relacionadasCalculadoras: ["/calculadoras/renta", "/calculadoras/renta-juridicas"],
  },
  "Retencion en la fuente": {
    categoria: "retencion",
    nivel: "intermedio",
    aliases: ["retencion", "retefuente"],
    explicacionSimple:
      "Es un anticipo del impuesto que se descuenta al momento del pago para adelantar recaudo a la DIAN.",
    ejemploPractico: {
      titulo: "Pago de honorarios",
      contexto:
        "Una empresa paga honorarios y debe practicar retención según base y tarifa vigente.",
      solucion:
        "Verifique concepto, calidad del tercero (declarante/no declarante) y base mínima antes de pagar.",
      errorComun: "Aplicar tarifa sin revisar si existe base mínima o excepción.",
    },
    frecuenteScore: 95,
    relacionadasCalculadoras: ["/calculadoras/retencion", "/calculadoras/retencion-salarios"],
  },
  "IVA": {
    categoria: "iva",
    nivel: "basico",
    aliases: ["impuesto al valor agregado"],
    explicacionSimple:
      "Es un impuesto indirecto que se cobra en ventas de bienes y servicios gravados; lo paga el consumidor final.",
    ejemploPractico: {
      titulo: "Factura de servicio gravado",
      contexto:
        "Una pyme factura un servicio gravado y debe discriminar IVA en la factura electrónica.",
      solucion:
        "Determine tarifa aplicable, registre IVA generado y reste IVA descontable con soporte válido.",
      errorComun: "Tomar IVA descontable sin factura electrónica validada.",
    },
    formula: {
      expresion: "IVA por pagar = IVA generado - IVA descontable",
      lectura: "Reste el IVA de compras autorizadas al IVA cobrado en ventas.",
      variables: [
        { simbolo: "IVA generado", significado: "Impuesto cobrado en ventas" },
        { simbolo: "IVA descontable", significado: "Impuesto pagado en compras con derecho a descuento" },
      ],
    },
    frecuenteScore: 99,
    relacionadasCalculadoras: ["/calculadoras/iva"],
  },
  "SIMPLE": {
    categoria: "general",
    nivel: "intermedio",
    aliases: ["regimen simple", "rst"],
    explicacionSimple:
      "El SIMPLE unifica varios impuestos y puede simplificar el cumplimiento para ciertos contribuyentes.",
    ejemploPractico: {
      titulo: "Comparar régimen SIMPLE vs ordinario",
      contexto:
        "Un comerciante pyme evalúa carga tributaria efectiva en ambos regímenes.",
      solucion:
        "Compare margen, costos, nómina y actividad económica antes de migrar.",
      errorComun: "Migrar al SIMPLE sin calcular impacto de costos no deducibles.",
    },
    frecuenteScore: 93,
    relacionadasCalculadoras: ["/calculadoras/simple", "/calculadoras/comparador-regimenes"],
  },
  "Sancion por extemporaneidad": {
    categoria: "sanciones",
    nivel: "intermedio",
    aliases: ["sancion extemporaneidad"],
    explicacionSimple:
      "Es la sanción por presentar tarde una declaración tributaria.",
    ejemploPractico: {
      titulo: "Declaración presentada un mes después",
      contexto:
        "Un contribuyente presenta la declaración de renta fuera del vencimiento.",
      solucion:
        "Liquide sanción con base en impuesto/ingresos y evalúe reducción por favorabilidad del art. 640.",
      errorComun: "Pagar la declaración sin incluir la sanción e intereses de mora.",
    },
    frecuenteScore: 88,
    relacionadasCalculadoras: ["/calculadoras/sanciones", "/calculadoras/intereses-mora"],
  },
};

const GUIDE_METADATA: Record<
  string,
  Pick<GuiaEducativaEnriched, "tiempoEstimadoMin" | "perfilesObjetivo" | "tags" | "guiasRelacionadas" | "actualizadoEn">
> = {
  "declarar-renta": {
    tiempoEstimadoMin: 3,
    perfilesObjetivo: ["persona-natural", "independiente", "pyme"],
    tags: ["renta", "topes", "obligacion", "residencia"],
    guiasRelacionadas: ["retencion-salarios", "sanciones-dian", "impuesto-patrimonio"],
    actualizadoEn: UPDATED_AT,
  },
  "simple-vs-ordinario": {
    tiempoEstimadoMin: 4,
    perfilesObjetivo: ["persona-natural", "persona-juridica", "pyme"],
    tags: ["simple", "ordinario", "planeacion", "tarifa"],
    guiasRelacionadas: ["regimen-iva", "responsable-iva", "impuesto-patrimonio"],
    actualizadoEn: UPDATED_AT,
  },
  "responsable-iva": {
    tiempoEstimadoMin: 3,
    perfilesObjetivo: ["persona-natural", "persona-juridica", "pyme", "independiente"],
    tags: ["iva", "responsable", "rut", "facturacion"],
    guiasRelacionadas: ["regimen-iva", "simple-vs-ordinario"],
    actualizadoEn: UPDATED_AT,
  },
  "sanciones-dian": {
    tiempoEstimadoMin: 2,
    perfilesObjetivo: ["persona-natural", "persona-juridica", "pyme"],
    tags: ["sanciones", "extemporaneidad", "correccion"],
    guiasRelacionadas: ["declarar-renta", "retencion-salarios"],
    actualizadoEn: UPDATED_AT,
  },
  "retencion-salarios": {
    tiempoEstimadoMin: 5,
    perfilesObjetivo: ["persona-natural", "independiente", "pyme"],
    tags: ["retencion", "salarios", "procedimiento 1", "procedimiento 2"],
    guiasRelacionadas: ["declarar-renta", "sanciones-dian"],
    actualizadoEn: UPDATED_AT,
  },
  "regimen-iva": {
    tiempoEstimadoMin: 4,
    perfilesObjetivo: ["persona-natural", "persona-juridica", "pyme"],
    tags: ["iva", "regimen", "simple", "responsable"],
    guiasRelacionadas: ["responsable-iva", "simple-vs-ordinario"],
    actualizadoEn: UPDATED_AT,
  },
  "impuesto-patrimonio": {
    tiempoEstimadoMin: 3,
    perfilesObjetivo: ["persona-natural", "gran-contribuyente", "pyme"],
    tags: ["patrimonio", "renta", "residencia", "tarifa"],
    guiasRelacionadas: ["declarar-renta", "simple-vs-ordinario"],
    actualizadoEn: UPDATED_AT,
  },
};

const NODE_ACTIONS: Record<string, string[]> = {
  "resultado-declara": [
    "Reúna certificados de ingresos, retenciones y extractos del año gravable.",
    "Defina si declara directamente o con apoyo de contador.",
    "Corrobore calendario de vencimientos según sus últimos dígitos de NIT o cédula.",
  ],
  "resultado-no-declara": [
    "Conserve soportes por si la DIAN solicita validación.",
    "Evalúe declaración voluntaria si tiene retenciones a favor.",
  ],
  "simple-ideal": [
    "Valide actividad económica y topes antes de inscripción.",
    "Calcule impacto de anticipos bimestrales frente a flujo de caja.",
    "Actualice RUT oportunamente con responsabilidades del SIMPLE.",
  ],
  "sancion-correccion": [
    "Liquide sanción antes de presentar la corrección.",
    "Revise si aplica reducción por favorabilidad (art. 640 ET).",
  ],
  "extemporaneidad-con-pago": [
    "Calcule sanción por mes o fracción y limite máximo.",
    "Incluya intereses de mora en el pago final.",
  ],
  "resultado-si-iva": [
    "Actualice RUT como responsable de IVA.",
    "Asegure facturación electrónica con validación previa.",
    "Defina periodicidad de declaración y calendario.",
  ],
};

const DOCTRINA_OVERRIDES: Record<
  string,
  Partial<
    Pick<
      DoctrinaEnriched,
      | "vigencia"
      | "revocadoPor"
      | "reemplazaA"
      | "perfilesImpactados"
      | "impactoPractico"
      | "esDoctrinaClave"
      | "guiasRelacionadas"
      | "calculadorasRelacionadas"
    >
  >
> = {
  "doc-016": {
    vigencia: "revocado",
    revocadoPor: "doc-014",
    impactoPractico: "medio",
  },
  "doc-045": {
    vigencia: "suspendido",
    impactoPractico: "alto",
    perfilesImpactados: ["persona-juridica", "pyme"],
  },
  "doc-001": {
    esDoctrinaClave: true,
    impactoPractico: "alto",
    perfilesImpactados: ["persona-juridica", "gran-contribuyente"],
    guiasRelacionadas: ["simple-vs-ordinario"],
  },
  "doc-003": {
    esDoctrinaClave: true,
    impactoPractico: "alto",
    perfilesImpactados: ["persona-natural", "independiente"],
    guiasRelacionadas: ["declarar-renta"],
  },
  "doc-021": {
    esDoctrinaClave: true,
    impactoPractico: "alto",
    guiasRelacionadas: ["sanciones-dian"],
    calculadorasRelacionadas: ["/calculadoras/sanciones", "/calculadoras/intereses-mora"],
  },
  "doc-022": {
    esDoctrinaClave: true,
    impactoPractico: "alto",
    guiasRelacionadas: ["declarar-renta", "sanciones-dian"],
  },
  "doc-023": {
    esDoctrinaClave: true,
    impactoPractico: "alto",
    guiasRelacionadas: ["declarar-renta"],
    calculadorasRelacionadas: ["/calculadoras/beneficio-auditoria"],
  },
  "doc-024": {
    esDoctrinaClave: true,
    impactoPractico: "alto",
    guiasRelacionadas: ["impuesto-patrimonio"],
    calculadorasRelacionadas: ["/calculadoras/patrimonio"],
  },
  "doc-046": {
    esDoctrinaClave: true,
    impactoPractico: "alto",
    perfilesImpactados: ["persona-juridica", "gran-contribuyente", "pyme"],
  },
};

function inferCategory(term: string, definition: string): CategoriaConocimiento {
  const corpus = normalizeText(`${term} ${definition}`);

  if (/(iva|descontable|exento|excluido)/.test(corpus)) return "iva";
  if (/(retencion|retefuente|agente retenedor|procedimiento 1|procedimiento 2)/.test(corpus)) return "retencion";
  if (/(sancion|extemporaneidad|firmeza|beneficio de auditoria|correccion)/.test(corpus)) return "sanciones";
  if (/(nomina|smlmv|ibc|parafiscales|seguridad social)/.test(corpus)) return "laboral";
  if (/(renta|ganancia ocasional|deduccion|depuracion|incrngo|base gravable|patrimonio)/.test(corpus)) return "renta";
  if (/(rut|declarante|contribuyente|sujeto pasivo)/.test(corpus)) return "procedimiento";
  return "general";
}

function inferNivel(term: string): "basico" | "intermedio" | "avanzado" {
  const corpus = normalizeText(term);
  if (/(incrngo|normalizacion|comparacion patrimonial|procedimiento 2)/.test(corpus)) return "avanzado";
  if (/(retencion|firmeza|simple|anticipo|beneficio)/.test(corpus)) return "intermedio";
  return "basico";
}

function inferGuideProfiles(guideText: string): PerfilContribuyente[] {
  const text = normalizeText(guideText);
  const profiles = new Set<PerfilContribuyente>();

  if (/(persona natural|asalariado|independiente|salarios|renta persona natural)/.test(text)) {
    profiles.add("persona-natural");
    profiles.add("independiente");
  }
  if (/(persona juridica|sociedad|empresa|pyme|comercio)/.test(text)) {
    profiles.add("persona-juridica");
    profiles.add("pyme");
  }
  if (/(gran contribuyente|precios de transferencia)/.test(text)) {
    profiles.add("gran-contribuyente");
  }
  if (/(esal|sin animo de lucro)/.test(text)) {
    profiles.add("esal");
  }

  if (profiles.size === 0) {
    profiles.add("persona-natural");
    profiles.add("pyme");
  }

  return [...profiles];
}

function inferDoctrinaProfiles(docText: string): PerfilContribuyente[] {
  const text = normalizeText(docText);
  const profiles = new Set<PerfilContribuyente>();

  if (/(persona natural|residente|no residente|dividendos|salarios)/.test(text)) {
    profiles.add("persona-natural");
    profiles.add("independiente");
  }
  if (/(persona juridica|sociedad|empresa|tarifa de renta|facturacion electronica)/.test(text)) {
    profiles.add("persona-juridica");
    profiles.add("pyme");
  }
  if (/(gran contribuyente|documentacion comprobatoria|ece|precios de transferencia)/.test(text)) {
    profiles.add("gran-contribuyente");
  }
  if (/(esal|regimen especial|sin animo de lucro)/.test(text)) {
    profiles.add("esal");
  }

  if (profiles.size === 0) {
    profiles.add("persona-natural");
    profiles.add("persona-juridica");
  }

  return [...profiles];
}

function inferImpacto(docText: string, articleCount: number): "alto" | "medio" | "bajo" {
  const text = normalizeText(docText);

  if (
    articleCount >= 4 ||
    /(sancion|firmeza|renta|iva|simple|retencion|facturacion|patrimonio|tasa minima|exogena)/.test(text)
  ) {
    return "alto";
  }
  if (/(procedimiento|requisito|doctrina|beneficio|descuento)/.test(text)) {
    return "medio";
  }
  return "bajo";
}

function getGuideCorpus(guide: (typeof GUIAS_EDUCATIVAS)[number]): string {
  return normalizeText(
    [
      guide.titulo,
      guide.descripcion,
      ...guide.nodos.flatMap((node) => [
        node.texto,
        node.recomendacion ?? "",
        ...(node.opciones?.map((option) => option.label) ?? []),
      ]),
    ].join(" ")
  );
}

function getDoctrinaCorpus(doc: {
  tema: string;
  pregunta: string;
  sintesis: string;
  conclusionClave: string;
  descriptores: string[];
}): string {
  return normalizeText(
    [doc.tema, doc.pregunta, doc.sintesis, doc.conclusionClave, doc.descriptores.join(" ")].join(" ")
  );
}

const GLOSARIO_BASE: GlosarioTermEnriched[] = GLOSARIO.map((term) => {
  const override = TERM_ENRICHMENT[term.termino];
  const categoria = override?.categoria ?? inferCategory(term.termino, term.definicion);
  const nivel = override?.nivel ?? inferNivel(term.termino);

  return {
    ...term,
    id: slugify(term.termino),
    categoria,
    nivel,
    aliases: override?.aliases ?? [],
    explicacionSimple:
      override?.explicacionSimple ??
      `En términos simples: ${term.definicion.charAt(0).toLowerCase()}${term.definicion.slice(1)}`,
    ejemploPractico: override?.ejemploPractico,
    formula: override?.formula,
    diagrama: override?.diagrama,
    frecuenteScore: override?.frecuenteScore ?? 40,
    relacionadosGuias: [],
    relacionadosDoctrina: [],
    relacionadasCalculadoras: override?.relacionadasCalculadoras ?? [],
    actualizadoEn: UPDATED_AT,
  };
});

const TERM_BY_NORMALIZED = new Map<string, GlosarioTermEnriched>(
  GLOSARIO_BASE.map((term) => [normalizeText(term.termino), term])
);

const DOCTRINA_ENRICHED: DoctrinaEnriched[] = DOCTRINA.map((doc) => {
  const override = DOCTRINA_OVERRIDES[doc.id] ?? {};
  const defaultVigencia: EstadoVigenciaDoctrina = doc.vigente ? "vigente" : "revocado";
  const vigencia = override.vigencia ?? defaultVigencia;
  const corpus = getDoctrinaCorpus(doc);

  const terminosClave = GLOSARIO_BASE.filter((term) => {
    const normalizedTerm = normalizeText(term.termino);
    return (
      corpus.includes(normalizedTerm) ||
      term.aliases.some((alias) => corpus.includes(normalizeText(alias)))
    );
  })
    .slice(0, 8)
    .map((term) => term.termino);

  const contextoClaro = `La DIAN precisó en ${doc.numero} (${doc.fecha}) que ${doc.conclusionClave
    .replace(/\.$/, "")
    .toLowerCase()}.`;

  const profiles = override.perfilesImpactados ?? inferDoctrinaProfiles(corpus);
  const impacto = override.impactoPractico ?? inferImpacto(corpus, doc.articulosET.length);

  return {
    ...doc,
    vigencia,
    revocadoPor: override.revocadoPor,
    reemplazaA: override.reemplazaA,
    perfilesImpactados: profiles,
    terminosClave,
    guiasRelacionadas: override.guiasRelacionadas ?? [],
    calculadorasRelacionadas: override.calculadorasRelacionadas ?? [],
    impactoPractico: impacto,
    esDoctrinaClave: override.esDoctrinaClave ?? (impacto === "alto" && vigencia === "vigente"),
    contextoClaro,
  };
});

const GUIDE_ENRICHED: GuiaEducativaEnriched[] = GUIAS_EDUCATIVAS.map((guide) => {
  const metadata = GUIDE_METADATA[guide.id];
  const corpus = getGuideCorpus(guide);
  const questionCount = guide.nodos.filter((node) => node.tipo === "pregunta").length;
  const timeEstimate = metadata?.tiempoEstimadoMin ?? Math.max(2, Math.round(questionCount * 0.7));

  const parsedArticles = toUnique(
    guide.nodos.flatMap((node) =>
      (node.enlaces ?? []).flatMap((link) => parseArticleFromHref(link.href))
    )
  );

  const enrichedNodes = guide.nodos.map((node) => {
    const textCorpus = normalizeText(`${node.texto} ${node.recomendacion ?? ""}`);
    const terminosClave = GLOSARIO_BASE.filter((term) => textCorpus.includes(normalizeText(term.termino)))
      .slice(0, 6)
      .map((term) => term.termino);

    const localArticles = toUnique([
      ...parsedArticles,
      ...(node.enlaces ?? []).flatMap((link) => parseArticleFromHref(link.href)),
    ]);

    const doctrinaRelacionada = DOCTRINA_ENRICHED.filter((doc) =>
      doc.articulosET.some((article) => localArticles.includes(article))
    )
      .slice(0, 6)
      .map((doc) => doc.id);

    const calculadora =
      node.enlaces?.find((link) => link.href.startsWith("/calculadoras/")) ??
      undefined;

    const accionesSugeridas = node.tipo === "resultado" ? NODE_ACTIONS[node.id] ?? [] : [];

    return {
      ...node,
      ayudaRapida:
        node.tipo === "pregunta"
          ? "Responde según tu situación real del año gravable consultado."
          : undefined,
      accionesSugeridas,
      articulosET: localArticles,
      terminosClave,
      doctrinaRelacionada,
      calculadoraRecomendada: calculadora
        ? { label: calculadora.label, href: calculadora.href }
        : undefined,
    };
  });

  const relatedByCategory = GUIAS_EDUCATIVAS.filter(
    (candidate) => candidate.id !== guide.id && candidate.categoria === guide.categoria
  )
    .slice(0, 3)
    .map((candidate) => candidate.id);

  return {
    ...guide,
    tiempoEstimadoMin: timeEstimate,
    perfilesObjetivo: metadata?.perfilesObjetivo ?? inferGuideProfiles(corpus),
    tags: metadata?.tags ?? [guide.categoria, guide.complejidad],
    guiasRelacionadas: metadata?.guiasRelacionadas ?? relatedByCategory,
    actualizadoEn: metadata?.actualizadoEn ?? UPDATED_AT,
    nodos: enrichedNodes,
  };
});

function findRelatedGuidesForTerm(term: GlosarioTermEnriched): string[] {
  const termNorm = normalizeText(term.termino);
  return GUIDE_ENRICHED.filter((guide) => {
    const corpus = getGuideCorpus(guide);
    return (
      corpus.includes(termNorm) ||
      term.aliases.some((alias) => corpus.includes(normalizeText(alias)))
    );
  })
    .slice(0, 6)
    .map((guide) => guide.id);
}

function findRelatedDoctrineForTerm(term: GlosarioTermEnriched): string[] {
  const termNorm = normalizeText(term.termino);
  return DOCTRINA_ENRICHED.filter((doc) => {
    const corpus = getDoctrinaCorpus(doc);
    return (
      corpus.includes(termNorm) ||
      term.aliases.some((alias) => corpus.includes(normalizeText(alias)))
    );
  })
    .slice(0, 8)
    .map((doc) => doc.id);
}

export const ENRICHED_GLOSARIO: GlosarioTermEnriched[] = GLOSARIO_BASE.map((term) => ({
  ...term,
  relacionadosGuias: term.relacionadosGuias.length
    ? term.relacionadosGuias
    : findRelatedGuidesForTerm(term),
  relacionadosDoctrina: term.relacionadosDoctrina.length
    ? term.relacionadosDoctrina
    : findRelatedDoctrineForTerm(term),
  relacionadasCalculadoras: toUnique(term.relacionadasCalculadoras),
}));

export const ENRICHED_GUIAS: GuiaEducativaEnriched[] = GUIDE_ENRICHED.map((guide) => {
  if (guide.guiasRelacionadas.length > 0) return guide;
  const related = GUIDE_ENRICHED.filter((candidate) => candidate.id !== guide.id)
    .slice(0, 3)
    .map((candidate) => candidate.id);
  return { ...guide, guiasRelacionadas: related };
});

export const ENRICHED_DOCTRINA: DoctrinaEnriched[] = DOCTRINA_ENRICHED.map((doc) => {
  if (doc.guiasRelacionadas.length > 0 && doc.calculadorasRelacionadas.length > 0) {
    return doc;
  }

  const relatedGuides = doc.guiasRelacionadas.length
    ? doc.guiasRelacionadas
    : ENRICHED_GUIAS.filter((guide) =>
        guide.nodos.some((node) =>
          (node.articulosET ?? []).some((article) => doc.articulosET.includes(article))
        )
      )
        .slice(0, 4)
        .map((guide) => guide.id);

  const relatedCalculators = doc.calculadorasRelacionadas.length
    ? doc.calculadorasRelacionadas
    : toUnique(
        ENRICHED_GUIAS.filter((guide) => relatedGuides.includes(guide.id)).flatMap((guide) =>
          guide.nodos
            .flatMap((node) =>
              node.calculadoraRecomendada ? [node.calculadoraRecomendada.href] : []
            )
            .filter(Boolean)
        )
      ).slice(0, 5);

  return {
    ...doc,
    guiasRelacionadas: relatedGuides,
    calculadorasRelacionadas: relatedCalculators,
  };
});

export const DOCTRINA_POR_ARTICULO = ENRICHED_DOCTRINA.reduce<Record<string, DoctrinaEnriched[]>>(
  (acc, doc) => {
    doc.articulosET.forEach((article) => {
      if (!acc[article]) acc[article] = [];
      acc[article].push(doc);
    });
    return acc;
  },
  {}
);

export function getTermById(termId: string): GlosarioTermEnriched | undefined {
  return ENRICHED_GLOSARIO.find((term) => term.id === termId);
}

export function getTermByName(termName: string): GlosarioTermEnriched | undefined {
  const normalized = normalizeText(termName);
  return (
    TERM_BY_NORMALIZED.get(normalized) ??
    ENRICHED_GLOSARIO.find((term) => normalizeText(term.termino) === normalized)
  );
}

export function getGuideById(guideId: string): GuiaEducativaEnriched | undefined {
  return ENRICHED_GUIAS.find((guide) => guide.id === guideId);
}

export function getDoctrineById(docId: string): DoctrinaEnriched | undefined {
  return ENRICHED_DOCTRINA.find((doc) => doc.id === docId);
}

export function getDoctrineByArticle(article: string): DoctrinaEnriched[] {
  const normalized = article.replace(/^art\.?\s*/i, "").trim();
  return DOCTRINA_POR_ARTICULO[normalized] ?? [];
}

export function getFrequentGlossaryTerms(limit = 8): GlosarioTermEnriched[] {
  return [...ENRICHED_GLOSARIO]
    .sort((a, b) => b.frecuenteScore - a.frecuenteScore)
    .slice(0, limit);
}

export function getTermOfTheDay(referenceDate = new Date()): GlosarioTermEnriched {
  const dayIndex = Math.floor(referenceDate.getTime() / 86_400_000);
  const terms = [...ENRICHED_GLOSARIO].sort((a, b) => a.termino.localeCompare(b.termino));
  return terms[dayIndex % terms.length];
}

export function searchGlossaryTerms(query: string): ResultadoBusquedaGlosario[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return getFrequentGlossaryTerms(12).map((term, index) => ({
      term,
      score: 100 - index,
      motivos: ["frecuente"],
    }));
  }

  const queryTokens = normalizedQuery.split(" ").filter(Boolean);

  const scored = ENRICHED_GLOSARIO.map((term) => {
    const motivos: string[] = [];
    const termNorm = normalizeText(term.termino);
    const aliasNorm = term.aliases.map(normalizeText);
    const defNorm = normalizeText(term.definicion);
    const simpleNorm = normalizeText(term.explicacionSimple);

    let score = 0;

    if (termNorm.includes(normalizedQuery)) {
      score += 130 - termNorm.indexOf(normalizedQuery);
      motivos.push("término");
    }

    if (aliasNorm.some((alias) => alias.includes(normalizedQuery))) {
      score += 95;
      motivos.push("alias");
    }

    if (defNorm.includes(normalizedQuery)) {
      score += 70;
      motivos.push("definición");
    }

    if (simpleNorm.includes(normalizedQuery)) {
      score += 60;
      motivos.push("explicación");
    }

    const tokenCoverage = queryTokens.filter(
      (token) =>
        termNorm.includes(token) ||
        aliasNorm.some((alias) => alias.includes(token)) ||
        defNorm.includes(token)
    ).length;

    if (tokenCoverage > 0) {
      score += tokenCoverage * 18;
      motivos.push("coincidencia parcial");
    }

    const distance = levenshtein(normalizedQuery, termNorm);
    if (distance <= 3) {
      score += 45 - distance * 10;
      motivos.push("fuzzy");
    }

    score += Math.round(term.frecuenteScore / 10);

    return { term, score, motivos: toUnique(motivos) };
  })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.term.termino.localeCompare(b.term.termino));

  return scored.slice(0, 24);
}

export interface DoctrineSearchOptions {
  perfiles?: PerfilContribuyente[];
  estado?: EstadoVigenciaDoctrina | "todos";
  tipo?: "concepto" | "oficio" | "doctrina-general" | "circular" | "todos";
}

export function semanticDoctrineSearch(
  query: string,
  options: DoctrineSearchOptions = {}
): ResultadoBusquedaDoctrina[] {
  const normalizedQuery = normalizeText(query);
  const tokens = normalizedQuery.split(" ").filter(Boolean);

  return ENRICHED_DOCTRINA.map((doc) => {
    const motivos: string[] = [];
    const tema = normalizeText(doc.tema);
    const pregunta = normalizeText(doc.pregunta);
    const sintesis = normalizeText(doc.sintesis);
    const conclusion = normalizeText(doc.conclusionClave);
    const descriptores = doc.descriptores.map(normalizeText);

    let score = 0;

    if (!normalizedQuery) {
      score += doc.esDoctrinaClave ? 50 : 20;
      score += doc.impactoPractico === "alto" ? 20 : doc.impactoPractico === "medio" ? 10 : 0;
    } else {
      const lowerQuery = normalizedQuery.toLowerCase();
      
      if (tema.includes(lowerQuery)) {
        score += 150;
        motivos.push("tema");
        if (tema.startsWith(lowerQuery)) score += 30; // Exact start bonus
      }
      
      if (pregunta.includes(lowerQuery)) {
        score += 100;
        motivos.push("pregunta");
      }
      
      if (conclusion.includes(lowerQuery)) {
        score += 90;
        motivos.push("conclusión");
      }
      
      if (sintesis.includes(lowerQuery)) {
        score += 70;
        motivos.push("síntesis");
      }
      
      if (descriptores.some((descriptor) => descriptor.includes(lowerQuery))) {
        score += 85;
        motivos.push("descriptor");
      }

      // TF-IDF inspired multi-token coverage
      const tokenCoverage = tokens.filter(
        (token) =>
          tema.includes(token) ||
          pregunta.includes(token) ||
          conclusion.includes(token) ||
          descriptores.some((descriptor) => descriptor.includes(token))
      ).length;
      
      const coveragePercent = tokenCoverage / tokens.length;
      score += (coveragePercent * 100); // Massive bonus for covered tokens

      // Bonus for articles matching directly in query
      const artMatch = query.match(/(\d+)/);
      if (artMatch && doc.articulosET.includes(artMatch[1])) {
        score += 200;
        motivos.push("artículo directo");
      }

      const distance = levenshtein(normalizedQuery, tema);
      if (distance <= 4) {
        score += Math.max(0, 40 - distance * 8);
        motivos.push("fuzzy");
      }
    }

    if (doc.esDoctrinaClave) score += 18;
    if (doc.vigencia === "vigente") score += 12;
    if (doc.impactoPractico === "alto") score += 10;

    return { doc, score, motivos: toUnique(motivos) };
  })
    .filter((result) => {
      if (result.score <= 0) return false;

      if (options.estado && options.estado !== "todos" && result.doc.vigencia !== options.estado) {
        return false;
      }

      if (options.tipo && options.tipo !== "todos" && result.doc.tipoDocumento !== options.tipo) {
        return false;
      }

      if (options.perfiles && options.perfiles.length > 0) {
        const overlap = result.doc.perfilesImpactados.some((profile) =>
          options.perfiles?.includes(profile)
        );
        if (!overlap) return false;
      }

      return true;
    })
    .sort((a, b) => b.score - a.score || b.doc.fecha.localeCompare(a.doc.fecha));
}

export function buildSemanticDoctrineAnswer(query: string, results: ResultadoBusquedaDoctrina[]): string {
  if (!query.trim() || results.length === 0) {
    return "No encontramos doctrina con suficiente relevancia para esa consulta. Pruebe con términos más específicos como artículo ET, impuesto o tipo de operación.";
  }

  const top = results.slice(0, 3).map((item) => item.doc);
  const intro = `Para la consulta \"${query.trim()}\", los documentos más útiles son:`;
  const bullets = top
    .map(
      (doc) =>
        `• ${doc.numero}: ${doc.conclusionClave} (Estado: ${doc.vigencia}, Artículos: ${doc.articulosET.join(", ") || "N/A"})`
    )
    .join("\n");

  return `${intro}\n${bullets}\n\nRevise cada documento completo antes de tomar decisiones formales.`;
}

export function getRelatedResourcesForTerm(termId: string) {
  const term = getTermById(termId);
  if (!term) return null;

  const guides = term.relacionadosGuias
    .map((guideId) => ENRICHED_GUIAS.find((guide) => guide.id === guideId))
    .filter((guide): guide is GuiaEducativaEnriched => Boolean(guide));

  const doctrine = term.relacionadosDoctrina
    .map((docId) => ENRICHED_DOCTRINA.find((doc) => doc.id === docId))
    .filter((doc): doc is DoctrinaEnriched => Boolean(doc));

  return {
    term,
    guides,
    doctrine,
    calculators: term.relacionadasCalculadoras,
    articles: term.articulos ?? [],
  };
}

export const PROFILE_LABELS: Record<PerfilContribuyente, string> = {
  "persona-natural": "Persona natural",
  "persona-juridica": "Persona jurídica",
  "gran-contribuyente": "Gran contribuyente",
  independiente: "Independiente",
  pyme: "PyME",
  esal: "ESAL",
};

export const DOCTRINA_STATUS_LABELS: Record<EstadoVigenciaDoctrina, string> = {
  vigente: "Vigente",
  revocado: "Revocado",
  suspendido: "Suspendido",
};

export function getGuideQuestionCount(guide: GuiaEducativaEnriched): number {
  return guide.nodos.filter((node) => node.tipo === "pregunta").length;
}

export function getGuideResultCount(guide: GuiaEducativaEnriched): number {
  return guide.nodos.filter((node) => node.tipo === "resultado").length;
}

export function getKnownGlossaryTerms(): string[] {
  return ENRICHED_GLOSARIO.map((term) => term.termino);
}

export function getUniqueArticlesET(): string[] {
  const articles = new Set<string>();
  
  ENRICHED_GLOSARIO.forEach(term => term.articulos?.forEach(a => articles.add(a)));
  ENRICHED_DOCTRINA.forEach(doc => doc.articulosET.forEach(a => articles.add(a)));
  ENRICHED_GUIAS.forEach(guide => 
    guide.nodos.forEach(node => node.articulosET?.forEach(a => articles.add(a)))
  );

  return Array.from(articles).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ""), 10);
    const numB = parseInt(b.replace(/\D/g, ""), 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });
}
