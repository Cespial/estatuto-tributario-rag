export interface DecisionNode {
  id: string;
  tipo: "pregunta" | "resultado";
  texto: string;
  opciones?: Array<{ label: string; nextNodeId: string }>;
  recomendacion?: string;
  enlaces?: Array<{ label: string; href: string }>;
}

export interface GuiaEducativa {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: "renta" | "iva" | "retencion" | "laboral" | "general";
  complejidad: "basica" | "intermedia" | "avanzada";
  nodos: DecisionNode[];
  nodoInicial: string;
}

export const GUIAS_EDUCATIVAS: GuiaEducativa[] = [
  {
    id: "declarar-renta",
    titulo: "¿Debo declarar renta?",
    descripcion: "Verifica si cumples los topes para declarar renta como persona natural en el año gravable 2025.",
    categoria: "renta",
    complejidad: "basica",
    nodoInicial: "residencia",
    nodos: [
      {
        id: "residencia",
        tipo: "pregunta",
        texto: "¿Eres residente fiscal en Colombia? (Permanencia > 183 días o familia/bienes en el país)",
        opciones: [
          { label: "Sí", nextNodeId: "patrimonio" },
          { label: "No", nextNodeId: "no-residente" },
        ],
      },
      {
        id: "patrimonio",
        tipo: "pregunta",
        texto: "¿Tu patrimonio bruto al 31 de dic de 2025 fue superior a 4.500 UVT ($224.095.500)?",
        opciones: [
          { label: "Sí", nextNodeId: "resultado-declara" },
          { label: "No", nextNodeId: "ingresos" },
        ],
      },
      {
        id: "ingresos",
        tipo: "pregunta",
        texto: "¿Tus ingresos brutos en 2025 fueron superiores a 1.400 UVT ($69.718.600)?",
        opciones: [
          { label: "Sí", nextNodeId: "resultado-declara" },
          { label: "No", nextNodeId: "tarjetas" },
        ],
      },
      {
        id: "tarjetas",
        tipo: "pregunta",
        texto: "¿Tus consumos con tarjeta de crédito superaron los 1.400 UVT ($69.718.600)?",
        opciones: [
          { label: "Sí", nextNodeId: "resultado-declara" },
          { label: "No", nextNodeId: "consignaciones" },
        ],
      },
      {
        id: "consignaciones",
        tipo: "pregunta",
        texto: "¿El valor total de tus consignaciones o inversiones superó los 1.400 UVT ($69.718.600)?",
        opciones: [
          { label: "Sí", nextNodeId: "resultado-declara" },
          { label: "No", nextNodeId: "resultado-no-declara" },
        ],
      },
      {
        id: "no-residente",
        tipo: "resultado",
        texto: "Situación de No Residente",
        recomendacion: "Los no residentes solo declaran si su patrimonio en Colombia o sus ingresos de fuente nacional no fueron objeto de retención en la fuente (Art. 407 a 411 ET).",
        enlaces: [{ label: "Ver Estatuto Art. 9", href: "/explorador?art=9" }],
      },
      {
        id: "resultado-declara",
        tipo: "resultado",
        texto: "¡DEBES DECLARAR RENTA!",
        recomendacion: "Cumples con al menos uno de los topes legales. Recuerda que declarar no siempre significa pagar.",
        enlaces: [{ label: "Calendario Tributario", href: "/calendario" }],
      },
      {
        id: "resultado-no-declara",
        tipo: "resultado",
        texto: "No estás obligado a declarar",
        recomendacion: "No superas ninguno de los topes para el año gravable 2025. Sin embargo, puedes declarar voluntariamente si te practicaron retenciones.",
      },
    ],
  },
  {
    id: "simple-vs-ordinario",
    titulo: "SIMPLE vs Ordinario: ¿Cuál me conviene?",
    descripcion: "Analiza si te conviene migrar al Régimen Simple de Tributación o quedarte en Renta Ordinaria.",
    categoria: "general",
    complejidad: "intermedia",
    nodoInicial: "ingresos-tope",
    nodos: [
      {
        id: "ingresos-tope",
        tipo: "pregunta",
        texto: "¿Tus ingresos brutos anuales son inferiores a 100.000 UVT ($5.237.400.000)?",
        opciones: [
          { label: "Sí", nextNodeId: "tipo-actividad" },
          { label: "No", nextNodeId: "ordinario-obligatorio" },
        ],
      },
      {
        id: "tipo-actividad",
        tipo: "pregunta",
        texto: "¿Tu actividad es de servicios profesionales (consultoría, profesiones liberales)?",
        opciones: [
          { label: "Sí", nextNodeId: "tope-profesionales" },
          { label: "No", nextNodeId: "costos-altos" },
        ],
      },
      {
        id: "tope-profesionales",
        tipo: "pregunta",
        texto: "¿Tus ingresos como profesional son inferiores a 12.000 UVT ($628.488.000)?",
        opciones: [
          { label: "Sí", nextNodeId: "costos-altos" },
          { label: "No", nextNodeId: "ordinario-mejor-prof" },
        ],
      },
      {
        id: "costos-altos",
        tipo: "pregunta",
        texto: "¿Tus costos y gastos reales superan el 70% de tus ingresos?",
        opciones: [
          { label: "Sí", nextNodeId: "ordinario-mejor-costos" },
          { label: "No", nextNodeId: "nomina-empleados" },
        ],
      },
      {
        id: "nomina-empleados",
        tipo: "pregunta",
        texto: "¿Tienes empleados por nómina con aportes a pensión?",
        opciones: [
          { label: "Sí", nextNodeId: "simple-ideal" },
          { label: "No", nextNodeId: "simple-conveniente" },
        ],
      },
      {
        id: "ordinario-obligatorio",
        tipo: "resultado",
        texto: "Régimen Ordinario Obligatorio",
        recomendacion: "Superas el tope máximo para el SIMPLE. Debes declarar bajo el régimen ordinario.",
      },
      {
        id: "ordinario-mejor-prof",
        tipo: "resultado",
        texto: "Se recomienda Ordinario",
        recomendacion: "Los profesionales con ingresos > 12.000 UVT suelen tener una carga mayor en el SIMPLE tras la Sentencia C-540 de 2023.",
      },
      {
        id: "ordinario-mejor-costos",
        tipo: "resultado",
        texto: "Mejor Ordinario (por costos)",
        recomendacion: "Dado que el SIMPLE grava ingresos brutos y no permite restar costos, con gastos > 70% es probable que la renta ordinaria sea más barata.",
        enlaces: [{ label: "Calculadora SIMPLE", href: "/calculadoras/simple" }],
      },
      {
        id: "simple-ideal",
        tipo: "resultado",
        texto: "¡El SIMPLE es ideal para ti!",
        recomendacion: "Puedes descontar los aportes a pensión de tus empleados y simplificar 7 impuestos en uno. Tu ahorro será significativo.",
        enlaces: [{ label: "Calculadora SIMPLE", href: "/calculadoras/simple" }],
      },
      {
        id: "simple-conveniente",
        tipo: "resultado",
        texto: "SIMPLE es conveniente",
        recomendacion: "Aunque no tengas nómina, las tarifas bajas del SIMPLE sobre ingresos brutos suelen ser menores que la tarifa del ordinario sobre utilidad.",
      },
    ],
  },
  {
    id: "responsable-iva",
    titulo: "¿Soy responsable de IVA?",
    descripcion: "Determina si debes inscribirte como responsable de IVA o puedes operar como no responsable.",
    categoria: "iva",
    complejidad: "basica",
    nodoInicial: "ingresos-3500",
    nodos: [
      {
        id: "ingresos-3500",
        tipo: "pregunta",
        texto: "¿Tus ingresos brutos por actividades gravadas en 2024 o 2025 superaron los 3.500 UVT ($174.296.500)?",
        opciones: [
          { label: "Sí", nextNodeId: "resultado-si-iva" },
          { label: "No", nextNodeId: "establecimientos" },
        ],
      },
      {
        id: "establecimientos",
        tipo: "pregunta",
        texto: "¿Tienes más de un establecimiento de comercio, oficina o local?",
        opciones: [
          { label: "Sí", nextNodeId: "resultado-si-iva" },
          { label: "No", nextNodeId: "franquicias" },
        ],
      },
      {
        id: "franquicias",
        tipo: "pregunta",
        texto: "¿Desarrollas actividades bajo franquicia, marca o concesión?",
        opciones: [
          { label: "Sí", nextNodeId: "resultado-si-iva" },
          { label: "No", nextNodeId: "aduana" },
        ],
      },
      {
        id: "aduana",
        tipo: "pregunta",
        texto: "¿Eres usuario aduanero?",
        opciones: [
          { label: "Sí", nextNodeId: "resultado-si-iva" },
          { label: "No", nextNodeId: "consignaciones-iva" },
        ],
      },
      {
        id: "consignaciones-iva",
        tipo: "pregunta",
        texto: "¿Tus consignaciones bancarias en el año superaron los 3.500 UVT?",
        opciones: [
          { label: "Sí", nextNodeId: "resultado-si-iva" },
          { label: "No", nextNodeId: "resultado-no-iva" },
        ],
      },
      {
        id: "resultado-si-iva",
        tipo: "resultado",
        texto: "Eres RESPONSABLE de IVA",
        recomendacion: "Debes inscribirte en el RUT como responsable de IVA, facturar electrónicamente y presentar declaraciones bimestrales o cuatrimestrales.",
        enlaces: [{ label: "Ver Art. 437 ET", href: "/explorador?art=437" }],
      },
      {
        id: "resultado-no-iva",
        tipo: "resultado",
        texto: "No eres responsable de IVA",
        recomendacion: "Puedes operar como no responsable. Asegúrate de no superar los topes en el transcurso del año.",
      },
    ],
  },
  {
    id: "sanciones-dian",
    titulo: "¿Qué sanciones aplican a mi caso?",
    descripcion: "Evalúa las posibles sanciones por extemporaneidad o corrección.",
    categoria: "general",
    complejidad: "basica",
    nodoInicial: "tipo-falta",
    nodos: [
      {
        id: "tipo-falta",
        tipo: "pregunta",
        texto: "¿Cuál es tu situación actual?",
        opciones: [
          { label: "No presenté la declaración a tiempo", nextNodeId: "pago-previo" },
          { label: "Debo corregir una declaración ya presentada", nextNodeId: "aumenta-impuesto" },
        ],
      },
      {
        id: "pago-previo",
        tipo: "pregunta",
        texto: "¿La declaración arroja un impuesto a pagar?",
        opciones: [
          { label: "Sí", nextNodeId: "extemporaneidad-con-pago" },
          { label: "No", nextNodeId: "extemporaneidad-sin-pago" },
        ],
      },
      {
        id: "aumenta-impuesto",
        tipo: "pregunta",
        texto: "¿La corrección aumenta el impuesto o disminuye el saldo a favor?",
        opciones: [
          { label: "Sí", nextNodeId: "sancion-correccion" },
          { label: "No", nextNodeId: "sin-sancion-correccion" },
        ],
      },
      {
        id: "extemporaneidad-con-pago",
        tipo: "resultado",
        texto: "Sanción por Extemporaneidad",
        recomendacion: "5% del impuesto por cada mes o fracción de retraso, sin exceder el 100%. Mínimo $47.000 (10 UVT).",
        enlaces: [{ label: "Calculadora de Intereses", href: "/calculadoras/intereses-mora" }],
      },
      {
        id: "extemporaneidad-sin-pago",
        tipo: "resultado",
        texto: "Sanción sobre Ingresos o Patrimonio",
        recomendacion: "0.5% de los ingresos brutos por cada mes de retraso. Si no hay ingresos, 1% del patrimonio líquido.",
      },
      {
        id: "sancion-correccion",
        tipo: "resultado",
        texto: "Sanción por Corrección",
        recomendacion: "10% del mayor valor a pagar o del menor saldo a favor, antes del emplazamiento para corregir.",
      },
      {
        id: "sin-sancion-correccion",
        tipo: "resultado",
        texto: "Corrección sin sanción",
        recomendacion: "Si la corrección no varía el impuesto o es para aumentar el saldo a favor, no hay sanción (salvo casos específicos de procesos de fiscalización).",
      },
    ],
  },
  {
    id: "retencion-salarios",
    titulo: "¿Cómo calculo mi retención por salarios?",
    descripcion: "Entiende paso a paso cómo se calcula la retención en la fuente sobre tus ingresos laborales.",
    categoria: "retencion",
    complejidad: "intermedia",
    nodoInicial: "tipo-vinculacion",
    nodos: [
      {
        id: "tipo-vinculacion",
        tipo: "pregunta",
        texto: "¿Recibes tus ingresos como asalariado o como trabajador independiente?",
        opciones: [
          { label: "Asalariado (contrato laboral)", nextNodeId: "procedimiento" },
          { label: "Independiente (prestación de servicios)", nextNodeId: "resultado-independiente" },
        ],
      },
      {
        id: "resultado-independiente",
        tipo: "resultado",
        texto: "Retención para independientes",
        recomendacion: "Como independiente, si tus ingresos del año anterior superaron 3.300 UVT te aplica la tabla del Art. 383 ET. De lo contrario, retención ordinaria del 10% u 11%.",
        enlaces: [
          { label: "Calculadora de Retención", href: "/calculadoras/retencion" },
          { label: "Tablas de Retención", href: "/tablas/retencion" },
        ],
      },
      {
        id: "procedimiento",
        tipo: "pregunta",
        texto: "¿Tu empleador aplica el Procedimiento 1 o el Procedimiento 2?",
        opciones: [
          { label: "Procedimiento 1 (depuración mensual)", nextNodeId: "dependientes" },
          { label: "Procedimiento 2 (porcentaje fijo semestral)", nextNodeId: "resultado-p2" },
          { label: "No sé cuál me aplica", nextNodeId: "dependientes" },
        ],
      },
      {
        id: "dependientes",
        tipo: "pregunta",
        texto: "¿Tienes personas a cargo (dependientes económicos)?",
        opciones: [
          { label: "Sí, tengo dependientes", nextNodeId: "aportes-voluntarios" },
          { label: "No tengo dependientes", nextNodeId: "resultado-p1-basico" },
        ],
      },
      {
        id: "aportes-voluntarios",
        tipo: "pregunta",
        texto: "¿Realizas aportes voluntarios a pensión o cuentas AFC?",
        opciones: [
          { label: "Sí, hago aportes voluntarios", nextNodeId: "resultado-p1-completo" },
          { label: "No realizo aportes voluntarios", nextNodeId: "resultado-p1-basico" },
        ],
      },
      {
        id: "resultado-p1-basico",
        tipo: "resultado",
        texto: "Retención por Procedimiento 1",
        recomendacion: "Tu empleador calcula la retención mensualmente: toma tu ingreso laboral, resta aportes obligatorios a salud y pensión, aplica deducciones y la renta exenta del 25%, y aplica la tabla del Art. 383 ET.",
        enlaces: [
          { label: "Calculadora Retención Salarios", href: "/calculadoras/retencion-salarios" },
          { label: "Calculadora de Retención General", href: "/calculadoras/retencion" },
        ],
      },
      {
        id: "resultado-p1-completo",
        tipo: "resultado",
        texto: "Retención P1 con beneficios tributarios",
        recomendacion: "Tienes varios beneficios que reducen tu retención: deducción por dependientes (hasta 72 UVT), aportes voluntarios a pensión/AFC (renta exenta hasta 30%) y la renta exenta general del 25%. Recuerda que rentas exentas + deducciones no pueden superar el 40% del ingreso neto.",
        enlaces: [
          { label: "Calculadora Retención Salarios", href: "/calculadoras/retencion-salarios" },
          { label: "Tablas de Retención", href: "/tablas/retencion" },
        ],
      },
      {
        id: "resultado-p2",
        tipo: "resultado",
        texto: "Retención por Procedimiento 2",
        recomendacion: "Se aplica un porcentaje fijo calculado semestralmente. El porcentaje se determina dividiendo la retención teórica de los 12 meses anteriores entre los pagos gravables del mismo período. Consulta con tu empleador el porcentaje vigente.",
        enlaces: [
          { label: "Calculadora Retención Salarios", href: "/calculadoras/retencion-salarios" },
          { label: "Calculadora de Retención General", href: "/calculadoras/retencion" },
        ],
      },
    ],
  },
  {
    id: "regimen-iva",
    titulo: "¿Qué régimen de IVA me aplica?",
    descripcion: "Determina si eres responsable de IVA, no responsable, o si te aplica el SIMPLE con IVA integrado.",
    categoria: "iva",
    complejidad: "intermedia",
    nodoInicial: "actividad-gravada",
    nodos: [
      {
        id: "actividad-gravada",
        tipo: "pregunta",
        texto: "¿Vendes bienes o prestas servicios gravados con IVA?",
        opciones: [
          { label: "Sí, vendo bienes/servicios gravados", nextNodeId: "tipo-persona" },
          { label: "No, solo excluidos o exentos", nextNodeId: "resultado-no-responsable" },
        ],
      },
      {
        id: "resultado-no-responsable",
        tipo: "resultado",
        texto: "No eres responsable de IVA",
        recomendacion: "Si únicamente vendes bienes excluidos o exentos de IVA, no eres responsable de este impuesto.",
        enlaces: [{ label: "Calculadora de IVA", href: "/calculadoras/iva" }],
      },
      {
        id: "tipo-persona",
        tipo: "pregunta",
        texto: "¿Eres persona natural o persona jurídica?",
        opciones: [
          { label: "Persona natural", nextNodeId: "ingresos-iva" },
          { label: "Persona jurídica", nextNodeId: "resultado-responsable-pj" },
        ],
      },
      {
        id: "resultado-responsable-pj",
        tipo: "resultado",
        texto: "Eres responsable de IVA",
        recomendacion: "Todas las personas jurídicas que vendan bienes o presten servicios gravados son responsables de IVA. Debes facturar con IVA y presentar declaración bimestral o cuatrimestral.",
        enlaces: [{ label: "Calculadora de IVA", href: "/calculadoras/iva" }],
      },
      {
        id: "ingresos-iva",
        tipo: "pregunta",
        texto: "¿Tus ingresos brutos del año anterior superaron 3.500 UVT ($174.296.500)?",
        opciones: [
          { label: "Sí, los superaron", nextNodeId: "resultado-responsable-ingresos" },
          { label: "No, fueron menores", nextNodeId: "varios-locales" },
        ],
      },
      {
        id: "resultado-responsable-ingresos",
        tipo: "resultado",
        texto: "Eres responsable de IVA por ingresos",
        recomendacion: "Al superar los 3.500 UVT de ingresos debes inscribirte como responsable de IVA.",
        enlaces: [{ label: "Calculadora de IVA", href: "/calculadoras/iva" }],
      },
      {
        id: "varios-locales",
        tipo: "pregunta",
        texto: "¿Tienes más de un establecimiento de comercio u oficina?",
        opciones: [
          { label: "Sí, tengo más de uno", nextNodeId: "resultado-responsable-locales" },
          { label: "No, solo uno o ninguno", nextNodeId: "en-simple" },
        ],
      },
      {
        id: "resultado-responsable-locales",
        tipo: "resultado",
        texto: "Eres responsable de IVA por establecimientos",
        recomendacion: "Al tener más de un establecimiento de comercio estás obligado como responsable de IVA.",
        enlaces: [{ label: "Calculadora de IVA", href: "/calculadoras/iva" }],
      },
      {
        id: "en-simple",
        tipo: "pregunta",
        texto: "¿Estás inscrito en el Régimen SIMPLE de Tributación?",
        opciones: [
          { label: "Sí, estoy en el SIMPLE", nextNodeId: "resultado-simple-iva" },
          { label: "No", nextNodeId: "resultado-no-responsable-cumple" },
        ],
      },
      {
        id: "resultado-simple-iva",
        tipo: "resultado",
        texto: "Régimen SIMPLE con IVA incluido",
        recomendacion: "En el SIMPLE, el IVA se integra en la tarifa unificada. No presentas declaración de IVA por separado.",
        enlaces: [
          { label: "Calculadora SIMPLE", href: "/calculadoras/simple" },
          { label: "Comparador de Regímenes", href: "/calculadoras/comparador-regimenes" },
        ],
      },
      {
        id: "resultado-no-responsable-cumple",
        tipo: "resultado",
        texto: "No eres responsable de IVA",
        recomendacion: "Cumples los requisitos del Art. 437 par. 3 ET para NO ser responsable. No debes cobrar IVA en tus ventas.",
        enlaces: [{ label: "Calculadora de IVA", href: "/calculadoras/iva" }],
      },
    ],
  },
  {
    id: "impuesto-patrimonio",
    titulo: "¿Debo pagar impuesto al patrimonio?",
    descripcion: "Determina si estás sujeto al impuesto al patrimonio según tu patrimonio líquido y residencia fiscal.",
    categoria: "renta",
    complejidad: "basica",
    nodoInicial: "es-persona-natural",
    nodos: [
      {
        id: "es-persona-natural",
        tipo: "pregunta",
        texto: "¿Eres persona natural?",
        opciones: [
          { label: "Sí, soy persona natural", nextNodeId: "patrimonio-72k" },
          { label: "No, soy persona jurídica", nextNodeId: "resultado-no-aplica-pj" },
        ],
      },
      {
        id: "resultado-no-aplica-pj",
        tipo: "resultado",
        texto: "No aplica impuesto al patrimonio",
        recomendacion: "Las personas jurídicas nacionales no son sujetas del impuesto al patrimonio. Si eres entidad extranjera con bienes en Colombia, consulta con un profesional.",
        enlaces: [{ label: "Calculadora de Patrimonio", href: "/calculadoras/patrimonio" }],
      },
      {
        id: "patrimonio-72k",
        tipo: "pregunta",
        texto: "¿Tu patrimonio líquido al 1 de enero supera las 72.000 UVT ($3.771 millones)?",
        opciones: [
          { label: "Sí, supera 72.000 UVT", nextNodeId: "residencia-fiscal" },
          { label: "No, es menor", nextNodeId: "resultado-no-aplica-tope" },
        ],
      },
      {
        id: "resultado-no-aplica-tope",
        tipo: "resultado",
        texto: "No debes pagar impuesto al patrimonio",
        recomendacion: "Si tu patrimonio líquido no supera las 72.000 UVT, no estás sujeto al impuesto al patrimonio.",
        enlaces: [
          { label: "Calculadora de Patrimonio", href: "/calculadoras/patrimonio" },
          { label: "Conversor de UVT", href: "/calculadoras/uvt" },
        ],
      },
      {
        id: "residencia-fiscal",
        tipo: "pregunta",
        texto: "¿Eres residente fiscal colombiano?",
        opciones: [
          { label: "Sí, soy residente fiscal", nextNodeId: "resultado-debe-pagar-residente" },
          { label: "No, soy no residente", nextNodeId: "resultado-debe-pagar-no-residente" },
        ],
      },
      {
        id: "resultado-debe-pagar-residente",
        tipo: "resultado",
        texto: "Sí, debes pagar impuesto al patrimonio",
        recomendacion: "Como residente fiscal con patrimonio líquido superior a 72.000 UVT, debes pagar sobre tu patrimonio mundial. Tarifa progresiva: 0.5% (72K-122K UVT), 1% (122K-239K UVT) y 1.5% (exceso de 239K UVT).",
        enlaces: [{ label: "Calculadora de Patrimonio", href: "/calculadoras/patrimonio" }],
      },
      {
        id: "resultado-debe-pagar-no-residente",
        tipo: "resultado",
        texto: "Debes pagar sobre patrimonio en Colombia",
        recomendacion: "Como no residente con patrimonio en Colombia superior a 72.000 UVT, debes pagar solo sobre los bienes que poseas en Colombia. Las tarifas son las mismas que para residentes.",
        enlaces: [{ label: "Calculadora de Patrimonio", href: "/calculadoras/patrimonio" }],
      },
    ],
  },
];
