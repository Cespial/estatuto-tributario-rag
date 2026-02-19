# Prompts de Perfeccionamiento — SuperApp Tributaria Colombia

Cada prompt va en una terminal separada. Correr en paralelo con `claude` CLI.

---

## PROMPT 1: Landing Page — Conversión para el Mercado Colombiano

```
Eres un experto en UX copywriting para mercados latinoamericanos y conversion rate optimization (CRO). Tu tarea es crear un plan ultra-exhaustivo de perfeccionamiento de la landing page de "Tributaria Colombia", una superapp tributaria dirigida al mercado colombiano.

CONTEXTO DEL PROYECTO:
- Framework: Next.js 16.1.6, React 19, Tailwind CSS v4, TypeScript
- Diseño: Inspirado en Harvey.ai — warm-gray palette, Playfair Display headings, Geist sans body
- Producto: Superapp tributaria con 35 calculadoras, 1,294 artículos del ET, calendario fiscal 2026, asistente IA (Claude + Pinecone RAG), guías interactivas, glosario, indicadores económicos, doctrina DIAN, comparador de artículos, favoritos
- Mercado: Colombia — contadores públicos, abogados tributaristas, empresarios PyME, personas naturales declarantes, departamentos contables corporativos
- URL de producción: https://superapp-tributaria-colombia.vercel.app

ARCHIVO PRINCIPAL A MODIFICAR:
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/page.tsx (13,573 bytes — landing completa, 8 secciones)

COMPONENTES LANDING EXISTENTES:
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/landing/use-case-ticker.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/landing/metrics-section.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/landing/footer-links.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/hero/hero-video.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/chat/chat-container.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/ui/reveal.tsx

COMPONENTES DE LAYOUT:
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/layout/header.tsx

ESTRUCTURA ACTUAL DE LA LANDING (8 secciones):
1. HERO — Video cinematográfico fullscreen, header transparente, "Tributaria Colombia", 2 CTAs
2. PRODUCT SIZZLE — Declaración serif grande sobre fondo ivory
3. USE CASE TICKER — Lista auto-cíclica de casos de uso
4. FEATURES — 6 tarjetas de acceso rápido a calculadoras
5. METRICS — Contadores animados: 35 Calculadoras, 1,294 Artículos, 2026 Calendario, 24/7 IA
6. CHAT SHOWCASE — Sección oscura con chat IA embebido
7. CTA FINAL — "Domine la tributaria colombiana"
8. FOOTER — Grid de enlaces 4 columnas

SISTEMA DE DISEÑO:
- Colores light: background #fafaf9, foreground #0f0e0d, card #ffffff, muted #f2f1f0, border #e5e5e3
- Colores dark: background #0f0e0d, foreground #fafaf9, card #1f1d1a, border #33312c
- Tipografía serif: Playfair Display 400, letter-spacing -0.0175em, line-height 1.05
- Tipografía sans: Geist
- Animaciones: scroll-reveal con IntersectionObserver, CSS transitions 150ms
- Iconos: lucide-react

DEPENDENCIAS DISPONIBLES: recharts, react-force-graph-2d, lucide-react, clsx, tailwind-merge, react-markdown

PÚBLICO OBJETIVO COLOMBIANO (por prioridad):
1. Contadores públicos independientes (60% del tráfico esperado) — Necesitan eficiencia, precisión, referencias al ET
2. Empresarios PyME — No entienden tributaria, necesitan claridad y confianza
3. Abogados tributaristas — Necesitan profundidad técnica y actualización constante
4. Personas naturales — "¿Debo declarar renta?" es su pregunta #1
5. Departamentos contables corporativos — Necesitan herramientas de equipo

PAIN POINTS DEL MERCADO COLOMBIANO:
- La DIAN cambia normas constantemente (reformas tributarias frecuentes)
- El Estatuto Tributario es denso y difícil de navegar
- Los contadores pierden horas buscando artículos y calculando manualmente
- Miedo a sanciones por errores en declaraciones
- Software tributario existente (Siigo, World Office) es caro y complejo
- No existe una plataforma gratuita integral que combine calculadoras + ET + IA

OBJETIVO DEL PLAN:
Crear un plan ultra-exhaustivo que perfeccione la landing page para maximizar:
1. CONVERSIÓN — Que el visitante use al menos 1 calculadora o haga 1 pregunta al chat
2. RETENCIÓN — Que regrese y la use como herramienta diaria
3. CONFIANZA — Que perciba la plataforma como autoritativa y confiable
4. CLARIDAD — Que entienda en <5 segundos qué hace la plataforma y por qué le sirve

ÁREAS DE PERFECCIONAMIENTO A EVALUAR:
- Copy de cada sección: ¿habla el lenguaje del contador/empresario colombiano?
- Jerarquía visual: ¿el ojo va donde debe ir?
- CTAs: ¿son claros, urgentes, específicos?
- Social proof: ¿falta testimonios, logos, métricas de uso?
- Sección hero: ¿el título comunica valor o es genérico?
- Sección de features: ¿6 tarjetas son suficientes? ¿El orden es correcto?
- Sección de métricas: ¿los números correctos? ¿Falta contexto?
- Chat showcase: ¿se demuestra el valor del chat de forma convincente?
- CTA final: ¿es efectivo? ¿Falta urgencia?
- Microinteracciones y animaciones: ¿aportan o distraen?
- Mobile: ¿la experiencia móvil está optimizada?
- Velocidad percibida: ¿hay skeleton states, lazy loading, progressive enhancement?
- SEO: ¿metadata, structured data, heading hierarchy correctos?
- Accesibilidad: ¿ARIA labels, contraste, keyboard navigation?
- Secciones faltantes: ¿FAQ? ¿Comparativa con competencia? ¿Pricing? ¿Blog preview?

INSTRUCCIÓN: Construye un plan ultra-exhaustivo, sección por sección, con el copy exacto en español colombiano (no español de España), las clases de Tailwind, los componentes a crear/modificar, y el orden de implementación. El plan debe ser tan detallado que un desarrollador pueda implementarlo sin preguntar nada.
```

---

## PROMPT 2: Hub de Calculadoras + Top 5 Calculadoras Individuales

```
Eres un experto en product design y data visualization para aplicaciones financieras. Tu tarea es crear un plan ultra-exhaustivo de perfeccionamiento del hub de calculadoras y las 5 calculadoras más importantes de "Tributaria Colombia".

CONTEXTO DEL PROYECTO:
- Framework: Next.js 16.1.6, React 19, Tailwind CSS v4, TypeScript
- Diseño: Harvey.ai inspired — warm-gray, Playfair Display headings, Geist sans body
- Producto: Superapp tributaria colombiana con 35 calculadoras tributarias
- Dependencias disponibles: recharts (gráficas), lucide-react (iconos), decimal.js (precisión), clsx, tailwind-merge, zod (validación)

ARCHIVOS PRINCIPALES:
- Hub: /Users/cristianespinal/superapp-tributaria-colombia/src/app/calculadoras/page.tsx (10,088 bytes)
- Layout: /Users/cristianespinal/superapp-tributaria-colombia/src/app/calculadoras/layout.tsx (362 bytes)

TOP 5 CALCULADORAS A PERFECCIONAR (por impacto al usuario colombiano):
1. /Users/cristianespinal/superapp-tributaria-colombia/src/app/calculadoras/renta/page.tsx (8,838 bytes) — Renta personas naturales (Art. 241 ET)
2. /Users/cristianespinal/superapp-tributaria-colombia/src/app/calculadoras/retencion/page.tsx (5,636 bytes) — Retención en la fuente
3. /Users/cristianespinal/superapp-tributaria-colombia/src/app/calculadoras/debo-declarar/page.tsx (8,339 bytes) — ¿Debo declarar renta?
4. /Users/cristianespinal/superapp-tributaria-colombia/src/app/calculadoras/nomina-completa/page.tsx (10,509 bytes) — Nómina completa
5. /Users/cristianespinal/superapp-tributaria-colombia/src/app/calculadoras/comparador/page.tsx (39,786 bytes) — Comparador contratación

COMPONENTES COMPARTIDOS:
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/calculators/calculator-card.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/calculators/calculator-result.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/calculators/calculator-sources.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/calculators/shared-inputs.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/calculators/date-input.tsx

DATOS TRIBUTARIOS:
- /Users/cristianespinal/superapp-tributaria-colombia/src/config/tax-data.ts — UVT 2026, tarifas, topes
- /Users/cristianespinal/superapp-tributaria-colombia/src/config/tax-data-laboral.ts — Datos laborales
- /Users/cristianespinal/superapp-tributaria-colombia/src/config/tax-data-laboral-sprint2.ts — Datos laborales adicionales

LAS 35 CALCULADORAS DISPONIBLES:
renta, retencion, debo-declarar, nomina-completa, comparador, simple, iva, gmf, dividendos, dividendos-juridicas, ganancias-ocasionales, ganancias-loterias, patrimonio, anticipo, beneficio-auditoria, comparacion-patrimonial, comparador-regimenes, consumo, depreciacion, descuentos-tributarios, herencias, horas-extras, ica, intereses-mora, licencia-maternidad, liquidacion-laboral, pension, renta-juridicas, retencion-salarios, sanciones, sanciones-ampliadas, seguridad-social, timbre, uvt, zonas-francas

SISTEMA DE DISEÑO:
- Light: bg #fafaf9, fg #0f0e0d, card #fff, muted #f2f1f0, border #e5e5e3
- Dark: bg #0f0e0d, fg #fafaf9, card #1f1d1a, border #33312c
- Serif: Playfair Display | Sans: Geist | Icons: lucide-react
- Layout componente compartido: /Users/cristianespinal/superapp-tributaria-colombia/src/components/layout/ReferencePageLayout.tsx

PÚBLICO OBJETIVO:
1. Contadores que calculan renta, retención y nómina a diario
2. Empresarios PyME decidiendo tipo de contratación
3. Personas naturales verificando si deben declarar

PAIN POINTS ESPECÍFICOS DE CALCULADORAS:
- Los usuarios no saben qué calculadora necesitan
- Los resultados numéricos sin contexto no generan confianza
- Falta visualización gráfica de cómo se llega al resultado (breakdown)
- No hay forma de guardar/compartir/exportar resultados
- No hay explicación pedagógica de los conceptos tributarios
- No se muestran escenarios comparativos ("qué pasa si...")

OBJETIVO DEL PLAN — perfeccionar para:

A) HUB DE CALCULADORAS (/calculadoras):
- Sistema de búsqueda inteligente ("necesito calcular cuánto pago de renta")
- Categorización visual (Renta, IVA, Laboral, Patrimonio, Sanciones, Otros)
- "Calculadoras más usadas" / "Populares esta semana"
- Flujo guiado: "¿Qué necesitas calcular?" → recomendación inteligente
- Breadcrumbs y navegación entre calculadoras relacionadas
- Badges: "Actualizado 2026", "Incluye reforma", "Nuevo"

B) CADA CALCULADORA TOP 5 — agregar:
- Gráfica de desglose del resultado (pie chart o stacked bar con recharts)
- Tabla detallada paso a paso del cálculo
- Toggle "Ver explicación" por cada línea del cálculo
- Escenarios: "¿Qué pasa si gano $X más?" (slider interactivo)
- Botón "Compartir resultado" (URL con parámetros o imagen generada)
- Botón "Exportar PDF" del resultado
- Sección "Artículos del ET relacionados" con links a /articulo/[slug]
- Disclaimer legal con referencia normativa exacta
- Breadcrumb: Calculadoras > Renta Personas Naturales

INSTRUCCIÓN: Lee cada archivo mencionado. Construye un plan ultra-exhaustivo con los cambios exactos por archivo, componentes nuevos a crear, gráficas a implementar con recharts, y el copy en español colombiano. El plan debe ser implementable sin preguntas adicionales.
```

---

## PROMPT 3: Explorador del ET + Artículo Individual + Dashboard

```
Eres un experto en information architecture y data-dense UI design. Tu tarea es crear un plan ultra-exhaustivo de perfeccionamiento del explorador de artículos, la página de artículo individual y el dashboard analítico de "Tributaria Colombia".

CONTEXTO DEL PROYECTO:
- Framework: Next.js 16.1.6, React 19, Tailwind CSS v4, TypeScript
- Diseño: Harvey.ai inspired — warm-gray, Playfair Display headings, Geist sans body
- Producto: 1,294 artículos del Estatuto Tributario colombiano, indexados y navegables
- Dependencias: recharts, react-force-graph-2d, lucide-react, react-markdown, isomorphic-dompurify

ARCHIVOS PRINCIPALES:

Explorador:
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/explorador/page.tsx (7,985 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/explorer/article-card.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/explorer/article-grid.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/explorer/filter-panel.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/explorer/relationship-graph.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/explorer/search-bar.tsx

Artículo Individual:
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/articulo/[slug]/page.tsx (5,622 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/articulo/[slug]/loading.tsx (1,318 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/article/article-content.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/article/article-header.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/article/article-sidebar.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/article/concordancias.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/article/cross-references.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/article/modification-timeline.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/article/normas-section.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/article/slide-out-panel.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/article/texto-derogado.tsx

Dashboard:
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/dashboard/page.tsx (4,072 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/dashboard/loading.tsx (544 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/dashboard/stats-cards.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/dashboard/reform-timeline-chart.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/dashboard/libro-distribution-chart.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/dashboard/top-modified-table.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/dashboard/top-referenced-table.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/dashboard/dashboard-skeleton.tsx

Datos:
- /Users/cristianespinal/superapp-tributaria-colombia/public/data/articles-index.json
- /Users/cristianespinal/superapp-tributaria-colombia/public/data/dashboard-stats.json
- /Users/cristianespinal/superapp-tributaria-colombia/public/data/graph-data.json
- /Users/cristianespinal/superapp-tributaria-colombia/public/data/articles/ (1,294 JSON files)

Contextos y Hooks:
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/contexts/ArticlePanelContext.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/hooks/useBookmarks.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/hooks/useNotes.ts

Utilidades:
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/comparison/diff-utils.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/pdf/pdf-export-button.tsx

CATEGORÍAS DE ARTÍCULOS (Libros del ET):
- Libro Primero: Impuesto sobre la Renta y Complementarios
- Libro Segundo: Retención en la Fuente
- Libro Tercero: Impuesto sobre las Ventas (IVA)
- Libro Cuarto: Impuesto de Timbre Nacional
- Libro Quinto: Procedimiento Tributario, Sanciones y Estructura de la DIAN
- Libro Sexto: Gravamen a los Movimientos Financieros (GMF)

SISTEMA DE DISEÑO:
- Light: bg #fafaf9, fg #0f0e0d, card #fff, muted #f2f1f0, border #e5e5e3
- Dark: bg #0f0e0d, fg #fafaf9, card #1f1d1a, border #33312c
- Serif: Playfair Display | Sans: Geist | Icons: lucide-react
- ReferencePageLayout compartido para headers de páginas de referencia

PÚBLICO OBJETIVO:
1. Abogados tributaristas buscando artículos específicos con sus modificaciones históricas
2. Contadores necesitando la versión vigente con concordancias y doctrina
3. Estudiantes de derecho tributario explorando relaciones entre artículos

PAIN POINTS:
- El ET tiene 1,294 artículos — la navegación puede ser abrumadora
- Los contadores necesitan saber rápidamente si un artículo fue modificado por la última reforma
- El grafo de relaciones es poderoso pero puede ser confuso sin guía
- El dashboard tiene datos interesantes pero no es accionable
- Falta search-as-you-type con preview del artículo
- No hay "artículos relacionados" inteligentes en la página de artículo

OBJETIVO DEL PLAN:

A) EXPLORADOR (/explorador):
- Búsqueda con autocompletado y preview en dropdown
- Filtros mejorados: chips removibles, contadores por categoría, filtro "Modificado por Ley XXXX"
- Vista dual: Grid (actual) + Lista compacta (nueva) con toggle
- Grafo de relaciones: leyenda de colores, zoom controls, click para navegar, tooltips informativos
- "Artículos Destacados" — curados editorialmente (los más consultados, los más modificados)
- Paginación mejorada o infinite scroll con virtualization
- Indicadores visuales: badge "Modificado 2024", "Derogado", "Nuevo"

B) ARTÍCULO INDIVIDUAL (/articulo/[slug]):
- Tabla de contenido lateral sticky (si el artículo es largo)
- "Artículos relacionados" al final basado en cross-references
- Highlight de texto con anotaciones personales (integrar useNotes)
- Botón "Consultar al asistente IA sobre este artículo"
- Breadcrumb: Explorador > Libro Primero > Art. 241
- Mejora de la timeline de modificaciones con más detalle visual
- Vista de "Texto original vs Texto vigente" inline
- Share button con URL y preview
- Print/PDF optimizado del artículo con formato legal

C) DASHBOARD (/dashboard):
- KPIs más accionables: "Artículos modificados en los últimos 6 meses"
- Gráfica interactiva de reformas con drill-down por ley
- Treemap de distribución por libro (en vez de o además de pie chart)
- Tabla de artículos más referenciados con sparklines de tendencia
- Filtros temporales: "Últimos 12 meses", "Última reforma", "Histórico completo"
- Exportar datos del dashboard

INSTRUCCIÓN: Lee cada archivo mencionado. Construye un plan ultra-exhaustivo sección por sección con componentes exactos, gráficas recharts con configuración, y cambios de UI. Copy en español colombiano. El plan debe ser implementable directamente.
```

---

## PROMPT 4: Calendario Fiscal + Indicadores Económicos + Novedades

```
Eres un experto en product design para herramientas financieras con enfoque en urgencia y utilidad diaria. Tu tarea es crear un plan ultra-exhaustivo de perfeccionamiento de las páginas de Calendario Fiscal, Indicadores Económicos y Novedades Normativas de "Tributaria Colombia".

CONTEXTO DEL PROYECTO:
- Framework: Next.js 16.1.6, React 19, Tailwind CSS v4, TypeScript
- Diseño: Harvey.ai inspired — warm-gray, Playfair Display headings, Geist sans body
- Producto: Superapp tributaria colombiana
- Dependencias: recharts, lucide-react, clsx, tailwind-merge

ARCHIVOS PRINCIPALES:

Calendario:
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/calendario/page.tsx (8,532 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/config/calendario-data.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/calendar/AddToCalendarButton.tsx

Indicadores:
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/indicadores/page.tsx (7,461 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/config/indicadores-data.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/indicators/TaxCharts.tsx

Novedades:
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/novedades/page.tsx (10,240 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/novedades/layout.tsx (320 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/config/novedades-data.ts

Layout compartido:
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/layout/ReferencePageLayout.tsx

SISTEMA DE DISEÑO:
- Light: bg #fafaf9, fg #0f0e0d, card #fff, muted #f2f1f0, border #e5e5e3
- Dark: bg #0f0e0d, fg #fafaf9, card #1f1d1a, border #33312c
- Serif: Playfair Display | Sans: Geist | Icons: lucide-react

PÚBLICO OBJETIVO COLOMBIANO:
1. Contadores con múltiples clientes — necesitan vista consolidada de obligaciones por NIT
2. Empresarios PyME — necesitan saber "qué debo pagar este mes"
3. Analistas tributarios — necesitan indicadores actualizados para cálculos

CONTEXTO DEL MERCADO COLOMBIANO:
- El calendario fiscal DIAN tiene decenas de obligaciones con fechas según último dígito del NIT
- Los contadores manejan 10-50 clientes simultáneamente, cada uno con diferentes NITs
- Las reformas tributarias cambian indicadores y obligaciones frecuentemente
- La UVT (Unidad de Valor Tributario) es la base de casi todo cálculo tributario — en 2026 vale $49,799
- Indicadores clave: UVT, SMLMV ($1,423,500), TRM, IPC, DTF, tasa de usura
- Novedades normativas (leyes, decretos, resoluciones, circulares DIAN) impactan directamente el trabajo diario

PAIN POINTS:
- Calendario: Difícil filtrar por "mis fechas" — el contador necesita ver solo las de sus clientes
- Calendario: No hay vista mensual visual (solo tabla)
- Calendario: No hay alertas ni recordatorios exportables masivos
- Indicadores: Los valores se muestran pero sin contexto histórico ni tendencia
- Indicadores: Falta calculadora rápida de conversión UVT ↔ pesos
- Novedades: No hay indicador de impacto práctico ("esto te afecta si...")
- Novedades: No hay timeline visual de cambios normativos
- Las 3 páginas no están conectadas entre sí (calendario no enlaza a novedades relevantes)

OBJETIVO DEL PLAN:

A) CALENDARIO FISCAL (/calendario):
- Vista mensual visual tipo calendario (grid) además de la tabla actual
- Código de colores por tipo de obligación (Renta, IVA, Retención, ICA, etc.)
- Filtro por último dígito del NIT con highlight visual
- "Próximos vencimientos" — panel superior con countdown a las próximas 3 fechas
- "Exportar mis fechas" — generar ICS con todas las obligaciones filtradas
- Status badges mejorados: Vencido (rojo), Próximo <7 días (naranja pulsante), Vigente (verde)
- Vista "Este mes" vs "Este trimestre" vs "Todo 2026"
- Integración: link a la calculadora relevante desde cada obligación
- Responsive: en mobile, vista de lista con swipe entre meses

B) INDICADORES ECONÓMICOS (/indicadores):
- Panel hero con los 4 indicadores clave en grande: UVT, SMLMV, TRM hoy, Tasa de Usura
- Gráfica de línea temporal para cada indicador (histórico 5-10 años con recharts)
- Calculadora inline UVT ↔ Pesos: input "Ingrese valor en UVT" → resultado en pesos y viceversa
- Tabla comparativa año a año: UVT 2024 vs 2025 vs 2026 con % de variación
- Categorización mejorada: Tributarios, Laborales, Financieros, Monetarios
- Copy-to-clipboard mejorado con toast de confirmación
- "¿Para qué sirve este indicador?" — tooltip educativo en cada card
- Conexión: desde cada indicador, link a calculadoras que lo usan

C) NOVEDADES NORMATIVAS (/novedades):
- Timeline visual vertical con nodos por fecha
- Badge de impacto: Alto (rojo), Medio (amarillo), Informativo (azul)
- Sección "Qué significa para ti" en cada novedad — explicación en lenguaje simple
- Filtro por "¿Quién se ve afectado?": Personas naturales, Jurídicas, Grandes contribuyentes, etc.
- Card expandible con resumen + detalle completo
- Links a artículos del ET modificados/creados por cada norma
- "Lo más relevante esta semana" — sección curada al top
- Newsletter-style layout para escaneo rápido
- Conexión con Calendario: si una novedad cambia una fecha, link al calendario

INSTRUCCIÓN: Lee cada archivo mencionado exhaustivamente. Construye un plan ultra-exhaustivo con las gráficas recharts (configuración exacta), componentes nuevos, copy en español colombiano orientado a urgencia y utilidad, y orden de implementación. Debe ser implementable directamente.
```

---

## PROMPT 5: Glosario + Guías Interactivas + Doctrina DIAN

```
Eres un experto en diseño de herramientas educativas y sistemas de knowledge management. Tu tarea es crear un plan ultra-exhaustivo de perfeccionamiento del Glosario Tributario, las Guías Interactivas y la sección de Doctrina DIAN de "Tributaria Colombia".

CONTEXTO DEL PROYECTO:
- Framework: Next.js 16.1.6, React 19, Tailwind CSS v4, TypeScript
- Diseño: Harvey.ai inspired — warm-gray, Playfair Display headings, Geist sans body
- Producto: Superapp tributaria colombiana para contadores, abogados y empresarios
- Dependencias: recharts, lucide-react, react-markdown, remark-gfm, clsx, tailwind-merge

ARCHIVOS PRINCIPALES:

Glosario:
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/glosario/page.tsx (8,573 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/config/glosario-data.ts

Guías Interactivas:
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/guias/page.tsx (6,119 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/guias/[guiaId]/page.tsx (6,483 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/config/guias-data.ts

Doctrina DIAN:
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/doctrina/page.tsx (12,926 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/doctrina/layout.tsx (319 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/config/doctrina-data.ts

Layout compartido:
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/layout/ReferencePageLayout.tsx

SISTEMA DE DISEÑO:
- Light: bg #fafaf9, fg #0f0e0d, card #fff, muted #f2f1f0, border #e5e5e3
- Dark: bg #0f0e0d, fg #fafaf9, card #1f1d1a, border #33312c
- Serif: Playfair Display | Sans: Geist | Icons: lucide-react
- Animaciones: scroll-reveal con IntersectionObserver

PÚBLICO OBJETIVO:
1. Contadores junior y estudiantes de contaduría — necesitan aprender conceptos rápido
2. Empresarios PyME — no entienden jerga tributaria, necesitan explicaciones simples
3. Abogados tributaristas — necesitan doctrina DIAN actualizada para argumentar casos
4. Contadores senior — usan guías como checklist para procedimientos complejos

CONTEXTO EDUCATIVO COLOMBIANO:
- Colombia tiene ~300,000 contadores públicos activos (Junta Central de Contadores)
- Las facultades de contaduría enseñan teoría pero no herramientas prácticas
- La doctrina DIAN (conceptos, oficios, circulares) es tan importante como la ley misma
- Los contadores junior cometen errores por desconocimiento de conceptos específicos
- No existe un "Wikipedia tributario colombiano" — esta app puede serlo

ESTRUCTURA ACTUAL:

Glosario: Navegación A-Z con sticky sidebar, búsqueda con highlighting, términos con definición + términos relacionados + artículos del ET
Guías: Cards por categoría (renta/iva/retencion/laboral/general), cada guía es un decision tree con nodos pregunta y nodos resultado, wizard step-by-step
Doctrina: Feed de conceptos DIAN con búsqueda, filtros por tipo/vigencia/artículo, síntesis expandible, conclusiones clave

PAIN POINTS:
- Glosario: definiciones correctas pero planas — faltan ejemplos prácticos colombianos
- Glosario: no hay visual aids (diagramas, fórmulas renderizadas)
- Glosario: no hay "término del día" o gamificación
- Guías: los árboles de decisión son funcionales pero visualmente básicos
- Guías: falta indicador de progreso claro y estimación de tiempo
- Guías: no se puede retomar una guía donde se dejó
- Guías: falta "print/export" del resultado de la guía
- Doctrina: mucho texto, poco visual — difícil escanear rápidamente
- Doctrina: no hay distinción clara entre doctrina vigente y revocada
- Doctrina: falta conexión con artículos del ET (link bidireccional)
- Las 3 secciones no están conectadas: un término del glosario debería linkar a guías y doctrina relevante

OBJETIVO DEL PLAN:

A) GLOSARIO (/glosario):
- Definiciones enriquecidas: agregar "Ejemplo práctico" con caso colombiano real
- Fórmulas renderizadas (si aplica): ej. "Base gravable = Ingresos - Costos - Deducciones"
- Diagrama visual por concepto (cuando aplique): flujo de un proceso, relación entre conceptos
- "Términos frecuentes" — sección curada en el top para nuevos usuarios
- Tooltip hover: al pasar sobre cualquier término en cualquier parte de la app, mostrar definición
- Cards mejoradas con iconos representativos por categoría
- Conexión bidireccional: desde cada término → guías relacionadas, doctrina relevante, calculadoras que lo usan
- Búsqueda mejorada: search-as-you-type con fuzzy matching
- "¿No encontraste el término?" → sugerencia de preguntarle al asistente IA

B) GUÍAS INTERACTIVAS (/guias y /guias/[guiaId]):
- Rediseño visual del wizard: progress bar horizontal, indicador de pasos restantes
- Estimación de tiempo: "~3 minutos" en cada guía
- Animación de transición entre pasos (slide left/right)
- Nodos de resultado enriquecidos: resumen + acciones sugeridas + calculadora relevante + artículos ET
- "Guardar progreso" — localStorage para retomar donde se dejó
- "Compartir resultado" — URL con parámetros que reproduce el resultado
- "Exportar como PDF" — resumen de la guía completada con fecha y datos
- Nuevas guías sugeridas al final: "También te puede interesar..."
- Categorías con iconos y colores distintivos
- Responsive: swipe entre pasos en mobile

C) DOCTRINA DIAN (/doctrina):
- Rediseño del card: headline + tipo + fecha prominentes, síntesis como primer párrafo visible
- Badge visual de vigencia: Vigente (verde), Revocado (rojo con strikethrough), Suspendido (amarillo)
- Timeline cronológica visual (vertical) como vista alternativa
- "Doctrina clave" — sección curada con las doctrinas de mayor impacto práctico
- Filtro "Relevante para mí": checkboxes de perfil (persona natural, jurídica, gran contribuyente, etc.)
- Conexión bilateral: cada doctrina muestra los artículos ET interpretados, y desde cada artículo se ven las doctrinas
- Excerpt highlighting: las conclusiones clave resaltadas con fondo amarillo tenue
- Copy de contexto: "La DIAN precisó en Concepto No. XXXX que..." — lenguaje claro
- Buscador semántico: integración con el chat IA para preguntas sobre doctrina

INSTRUCCIÓN: Lee cada archivo mencionado exhaustivamente. Construye un plan ultra-exhaustivo con componentes, UI exact, copy educativo en español colombiano claro y accesible, integraciones entre secciones. El plan debe ser implementable sin preguntar nada.
```

---

## PROMPT 6: Comparador de Artículos + Favoritos/Notas + Tablas de Retención + Asistente IA Chat

```
Eres un experto en diseño de herramientas de productividad profesional y sistemas de chat con IA. Tu tarea es crear un plan ultra-exhaustivo de perfeccionamiento del Comparador de Artículos, el sistema de Favoritos/Notas, las Tablas de Retención y el Asistente IA de "Tributaria Colombia".

CONTEXTO DEL PROYECTO:
- Framework: Next.js 16.1.6, React 19, Tailwind CSS v4, TypeScript
- Diseño: Harvey.ai inspired — warm-gray, Playfair Display headings, Geist sans body
- AI: Anthropic Claude (Sonnet 4.5) via Vercel AI SDK + Pinecone RAG
- Dependencias: @ai-sdk/anthropic, @ai-sdk/react, ai, @pinecone-database/pinecone, recharts, lucide-react, react-markdown, remark-gfm, isomorphic-dompurify, clsx, tailwind-merge

ARCHIVOS PRINCIPALES:

Comparador:
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/comparar/page.tsx (9,865 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/comparar/layout.tsx (638 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/comparison/article-diff-viewer.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/comparison/article-version-selector.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/comparison/diff-utils.ts

Favoritos/Notas:
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/favoritos/page.tsx (10,752 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/hooks/useBookmarks.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/hooks/useNotes.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/bookmarks/BookmarkButton.tsx

Tablas de Retención:
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/tablas/retencion/page.tsx (6,166 bytes)
- /Users/cristianespinal/superapp-tributaria-colombia/src/config/retencion-tabla-data.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/retention/QuickCalculator.tsx

Asistente IA (Chat):
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/chat/chat-container.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/chat/chat-input.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/chat/message-bubble.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/chat/message-list.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/chat/source-citation.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/chat/suggested-questions.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/chat/filter-chips.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/chat/calculator-suggestions.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/app/api/chat/route.ts (3,842 bytes)

RAG Pipeline:
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/rag/pipeline.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/rag/retriever.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/rag/reranker.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/rag/query-enhancer.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/rag/context-assembler.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/rag/prompt-builder.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/pinecone/client.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/pinecone/embedder.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/chat/system-prompt.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/chat/session-memory.ts
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/chat/calculator-context.ts

Slide-out Panel (previsualización de artículos):
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/article/slide-out-panel.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/lib/contexts/ArticlePanelContext.tsx

PDF:
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/pdf/pdf-export-button.tsx
- /Users/cristianespinal/superapp-tributaria-colombia/src/components/pdf/print-wrapper.tsx

SISTEMA DE DISEÑO:
- Light: bg #fafaf9, fg #0f0e0d, card #fff, muted #f2f1f0, border #e5e5e3
- Dark: bg #0f0e0d, fg #fafaf9, card #1f1d1a, border #33312c
- Serif: Playfair Display | Sans: Geist | Icons: lucide-react

PÚBLICO OBJETIVO:
1. Abogados tributaristas — usan comparador para argumentar cambios normativos ante la DIAN
2. Contadores con múltiples clientes — usan favoritos como workspace personalizado
3. Todos los usuarios — el chat IA es la feature #1 de adquisición y retención

PAIN POINTS:
- Comparador: solo compara versiones del mismo artículo, no artículos diferentes entre sí
- Comparador: el diff es word-level pero no tiene highlight por tipo (adición=verde, eliminación=rojo, cambio=amarillo)
- Favoritos: funcional pero visualmente plano — parece lista genérica
- Favoritos: las notas son texto plano — falta markdown, tags, o categorización
- Favoritos: no hay workspace por cliente/proyecto
- Tablas: la tabla de retención es correcta pero no explica los conceptos
- Tablas: el QuickCalculator inline es útil pero limitado
- Chat: la UI es funcional pero no diferenciadora
- Chat: las suggested questions son genéricas
- Chat: las source citations se muestran pero no se puede navegar directamente al artículo
- Chat: no hay historial de conversaciones
- Chat: no se puede compartir una respuesta del chat

OBJETIVO DEL PLAN:

A) COMPARADOR (/comparar):
- Diff visual mejorado: verde (adiciones), rojo (eliminaciones), amarillo (modificaciones)
- Side-by-side vs Inline toggle
- Selector de artículo mejorado con search y autocompletado
- Comparación cross-article: comparar artículo A con artículo B (no solo versiones)
- Mini-mapa lateral mostrando dónde hay cambios en documentos largos
- Export diff como PDF con formato legal
- "Resumen de cambios" generado automáticamente al top

B) FAVORITOS/NOTAS (/favoritos):
- Rediseño visual: cards con preview del contenido favorito
- Workspaces/Carpetas: "Cliente ABC", "Declaración 2026", "Investigación IVA"
- Notas enriquecidas: markdown con preview, tags (#renta, #iva, #urgente)
- Quick-add desde cualquier parte de la app (hotkey o floating button)
- Drag-and-drop para reordenar
- Búsqueda dentro de favoritos y notas
- Export workspace completo como PDF o JSON
- Contador de items por workspace
- "Recientes" — últimos artículos visitados como sección quick-access

C) TABLAS DE RETENCIÓN (/tablas/retencion):
- Tabla mejorada: sticky header, sort por columna, highlight de fila hover
- QuickCalculator expandido: más campos, resultado detallado con desglose
- Tooltips explicativos en cada concepto de retención
- "¿Qué concepto aplica?" — mini flujo guiado basado en tipo de pago
- Link a la calculadora completa de retención desde cada fila
- Export tabla como Excel/CSV
- Responsive: horizontal scroll con columna fija en mobile

D) ASISTENTE IA CHAT (componentes chat/*):
- UI premium: typing indicator animado, message timestamps, avatar del asistente
- Suggested questions contextuales basadas en la página actual del usuario
- Source citations clickeables que abren el slide-out panel del artículo
- "Copiar respuesta" button en cada mensaje del asistente
- "Preguntar de nuevo" / "Profundizar" buttons después de cada respuesta
- Historial de conversaciones en localStorage con lista lateral
- Feedback por respuesta: thumbs up/down para quality tracking
- Onboarding: primer mensaje del chat explica qué puede hacer el asistente
- Integración contextual: si el usuario está en /calculadoras/renta, el chat sabe y sugiere preguntas de renta
- Markdown rendering mejorado: tablas, listas, código, headers
- Mobile: chat como bottom sheet con handle de arrastre

INSTRUCCIÓN: Lee cada archivo mencionado exhaustivamente. Construye un plan ultra-exhaustivo con componentes exactos, UI/UX detallada, integraciones entre secciones, y copy en español colombiano profesional. El plan debe ser implementable directamente sin preguntas.
```

---

## INSTRUCCIONES DE USO

En 6 terminales diferentes, ejecutar:

```bash
# Terminal 1 — Landing Page
cd /Users/cristianespinal/superapp-tributaria-colombia
claude --allowedTools "Read,Glob,Grep,Write,Edit,Bash(npm run build),Bash(npm run dev)" -p "[PROMPT 1 AQUÍ]"

# Terminal 2 — Calculadoras
cd /Users/cristianespinal/superapp-tributaria-colombia
claude --allowedTools "Read,Glob,Grep,Write,Edit,Bash(npm run build)" -p "[PROMPT 2 AQUÍ]"

# Terminal 3 — Explorador + Artículos + Dashboard
cd /Users/cristianespinal/superapp-tributaria-colombia
claude --allowedTools "Read,Glob,Grep,Write,Edit,Bash(npm run build)" -p "[PROMPT 3 AQUÍ]"

# Terminal 4 — Calendario + Indicadores + Novedades
cd /Users/cristianespinal/superapp-tributaria-colombia
claude --allowedTools "Read,Glob,Grep,Write,Edit,Bash(npm run build)" -p "[PROMPT 4 AQUÍ]"

# Terminal 5 — Glosario + Guías + Doctrina
cd /Users/cristianespinal/superapp-tributaria-colombia
claude --allowedTools "Read,Glob,Grep,Write,Edit,Bash(npm run build)" -p "[PROMPT 5 AQUÍ]"

# Terminal 6 — Comparador + Favoritos + Tablas + Chat IA
cd /Users/cristianespinal/superapp-tributaria-colombia
claude --allowedTools "Read,Glob,Grep,Write,Edit,Bash(npm run build)" -p "[PROMPT 6 AQUÍ]"
```

IMPORTANTE: Los prompts 2-6 generan PLANES, no código. Después de revisar cada plan, aprobar e implementar uno por uno para evitar conflictos de merge entre terminales que modifican archivos diferentes.
