# CLAUDE.md — SuperApp Tributaria Colombia

## Identidad del Proyecto

**SuperApp Tributaria Colombia** es la plataforma tributaria más completa de Colombia. Combina 35 calculadoras fiscales, los 1,294 artículos del Estatuto Tributario (ET) indexados y navegables, un asistente IA con RAG sobre el ET, calendario fiscal 2026, doctrina DIAN, indicadores económicos, glosario tributario, guías interactivas y herramientas de productividad profesional.

- **URL producción:** https://superapp-tributaria-colombia.vercel.app
- **Repositorio:** https://github.com/Cespial/superapp-tributaria-colombia
- **Inspiración de diseño:** Harvey.ai (legal tech premium)

---

## Stack Técnico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.1.6 |
| UI | React | 19.2.3 |
| Estilos | Tailwind CSS v4 (CSS-first, `@theme inline`) | 4.x |
| Lenguaje | TypeScript (strict mode) | 5.x |
| IA — LLM | Anthropic Claude via Vercel AI SDK | Sonnet 4.5 (`claude-sonnet-4-5-20250929`) |
| IA — Query rewrite | Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) | |
| IA — Embeddings | Pinecone Inference (`multilingual-e5-large`, 1024d) | |
| Vector DB | Pinecone | SDK 7.x |
| Gráficas | Recharts | 3.7 |
| Grafos | react-force-graph-2d | 1.29 |
| Markdown | react-markdown + remark-gfm | |
| Sanitización | isomorphic-dompurify | |
| Matemáticas | decimal.js (precisión financiera) | |
| Validación | Zod v4 (importar desde `zod/v4` o `zod`) | |
| Iconos | lucide-react | |
| Temas | next-themes (dark mode) | |
| Deploy | Vercel | |
| PWA | Service Worker + manifest.json | |

---

## Arquitectura de Archivos

```
src/
├── app/                          # App Router — páginas y API
│   ├── page.tsx                  # Landing page (8 secciones)
│   ├── layout.tsx                # Root layout (fonts, providers, metadata)
│   ├── api/chat/route.ts         # Streaming RAG chat endpoint
│   ├── articulo/[slug]/          # 1,294 artículos SSG
│   ├── calculadoras/             # 35 calculadoras (client components)
│   ├── calendario/               # Calendario fiscal 2026
│   ├── comparar/                 # Comparador de artículos (diff)
│   ├── dashboard/                # Analytics del ET
│   ├── doctrina/                 # Doctrina DIAN
│   ├── explorador/               # Explorador de artículos + grafo
│   ├── favoritos/                # Bookmarks + notas + workspaces
│   ├── glosario/                 # Glosario tributario A-Z
│   ├── guias/                    # Guías interactivas (decision trees)
│   ├── indicadores/              # Indicadores económicos 2026
│   ├── novedades/                # Novedades normativas
│   ├── tablas/retencion/         # Tabla de retención con calculadora inline
│   └── asistente/                # Chat IA standalone
├── components/                   # ~113 componentes en 18 directorios
│   ├── article/                  # Contenido, header, sidebar, timeline, concordancias
│   ├── calculators/              # Cards, results, inputs, charts
│   ├── calendar/                 # AddToCalendar, filtros, status
│   ├── chat/                     # Container, input, bubbles, citations, suggestions
│   ├── comparison/               # Diff viewer, version selector
│   ├── dashboard/                # Stats, charts, tables
│   ├── explorer/                 # Cards, grid, filters, search, graph
│   ├── hero/                     # Video carousel (3 escenas, crossfade)
│   ├── indicators/               # Charts UVT
│   ├── landing/                  # Footer, metrics, ticker, social proof
│   ├── layout/                   # Header, ReferencePageLayout
│   ├── novedades/                # Cards, timeline, filters
│   ├── workspace/                # Workspaces de productividad
│   ├── pdf/                      # Export y print wrapper
│   ├── retention/                # QuickCalculator, tabla
│   └── ui/                       # reveal, skeleton, spinner, toast
├── config/                       # 21 archivos de datos estáticos
│   ├── tax-data*.ts              # Datos tributarios (UVT, tarifas, topes)
│   ├── calendario-data.ts        # Obligaciones fiscales 2026
│   ├── doctrina-data.ts          # Conceptos DIAN curados
│   ├── novedades-data.ts         # Novedades normativas
│   ├── glosario-data.ts          # Términos tributarios
│   ├── guias-data.ts             # Árboles de decisión
│   ├── indicadores-data.ts       # Indicadores económicos
│   ├── retencion-tabla-data.ts   # Conceptos de retención
│   ├── constants.ts              # RAG config, Pinecone host, embeddings
│   └── categories.ts             # Libros del ET, keywords
├── lib/
│   ├── rag/                      # Pipeline RAG completo
│   │   ├── pipeline.ts           # Orquestador: enhance → retrieve → rerank → assemble → build
│   │   ├── query-enhancer.ts     # Rewrite + HyDE + decomposition (via Haiku)
│   │   ├── retriever.ts          # Multi-query Pinecone search
│   │   ├── reranker.ts           # Heuristic boost scoring
│   │   ├── context-assembler.ts  # Sibling retrieval + token budget
│   │   └── prompt-builder.ts     # XML context formatting
│   ├── pinecone/
│   │   ├── client.ts             # Singleton Pinecone client
│   │   └── embedder.ts           # multilingual-e5-large embeddings
│   ├── chat/
│   │   ├── system-prompt.ts      # System prompt con constantes 2026
│   │   ├── session-memory.ts     # Context de conversación (5 turnos)
│   │   ├── calculator-context.ts # Sugerencias de calculadoras por keyword
│   │   ├── history-storage.ts    # localStorage (30 conv, 80 msgs)
│   │   └── contextual-questions.ts # Preguntas por ruta
│   ├── hooks/                    # useBookmarks, useNotes, useScrollReveal
│   ├── contexts/                 # ArticlePanelContext
│   ├── utils/                    # Normalización, parsing
│   ├── export/                   # JSON, CSV, PDF
│   ├── api/                      # Rate limiter, Zod validation
│   ├── calculators/              # Popularity, search, share, format, url-state
│   └── types/                    # articles.ts
├── types/                        # Type definitions globales
│   ├── rag.ts                    # EnhancedQuery, RetrievalResult, SourceCitation, RAGConfig
│   ├── pinecone.ts               # ChunkMetadata (14+ campos), ScoredChunk
│   ├── chat.ts                   # Chat types
│   ├── chat-history.ts           # ChatConversation, ChatMessageFeedback
│   ├── calendar.ts
│   ├── productivity.ts
│   └── knowledge.ts
public/
├── data/
│   ├── articles/                 # 1,294 JSON individuales
│   ├── articles-index.json       # Índice (443KB)
│   ├── articles-index.enriched.json  # Índice enriquecido (1.4MB)
│   ├── dashboard-stats.json      # Estadísticas del ET
│   ├── dashboard-timeseries.json # Series temporales
│   ├── explorer-facets.json      # Facetas para filtros
│   ├── featured-articles.json    # Artículos destacados
│   └── graph-data.json           # Datos del grafo de relaciones (136KB)
├── hero/                         # 3 videos MP4 (~6MB total)
scripts/
├── build-analytics-datasets.mjs  # Genera dashboard-stats.json, graph-data.json, etc.
└── verify-data-integrity.mjs     # Verificación de datos
eval/                             # Framework de evaluación RAG
├── dataset.json                  # Preguntas + respuestas esperadas
├── config-grid.ts                # Grid de configuraciones
├── prompt-variants.ts            # Variantes de prompts
└── metrics/                      # answer-quality, llm-judge, retrieval
```

---

## Sistema de Diseño

### Paleta (warm-gray premium, Harvey.ai)

| Token | Light | Dark |
|-------|-------|------|
| `--background` | `#fafaf9` (ivory cálido) | `#0f0e0d` (negro cálido) |
| `--foreground` | `#0f0e0d` | `#fafaf9` |
| `--card` | `#ffffff` | `#1f1d1a` |
| `--muted` | `#f2f1f0` | `#1f1d1a` |
| `--muted-foreground` | `#706d66` | `#8f8b85` |
| `--border` | `#e5e5e3` | `#33312c` |
| `--primary` | `#0f0e0d` | `#fafaf9` |
| `--destructive` | `#dc2626` | `#ef4444` |
| `--success` | `#16a34a` | `#22c55e` |

### Tipografía

- **Headings serif:** Playfair Display 400, `letter-spacing: -0.0175em`, `line-height: 1.05` → clase `.heading-serif`
- **Body sans:** Geist (variable de Next.js)
- **Monospace:** Geist Mono

### Clases CSS Utilitarias Propias

- `.heading-serif` — Headings con Playfair Display
- `.surface-card` — Card con bg, border, y hover-lift
- `.hover-lift` — Eleva card on hover
- `.prose-chat` — Markdown rendering en el chat
- `.callout-info` — Callout informativo
- `.section-dark` — Sección con fondo oscuro
- `.reveal-on-scroll` — Animación de entrada al scroll

### Patrones de UI

- Tailwind v4 CSS-first: `@import "tailwindcss"` + `@theme inline` en `globals.css`
- No hay `tailwind.config.js` — todo en CSS
- Transiciones globales: `* { transition: color, background-color, border-color, box-shadow, opacity 150ms }`
- Custom easing curves: `--ease-in`, `--ease-out`, `--ease-in-out`
- Scrollbars finos (6px)
- `prefers-reduced-motion` respetado
- Scroll-reveal con `IntersectionObserver` (hook `useScrollReveal`)
- Print styles para artículos y guías

---

## Convenciones de Código

### General

- TypeScript strict. No `any` sin justificación.
- Path alias: `@/*` → `./src/*`
- Imports ordenados: React → next → third-party → locales → types
- Componentes: PascalCase. Hooks: camelCase con `use` prefix. Utilidades: camelCase.
- Archivos de componentes: kebab-case (`article-card.tsx`, `filter-panel.tsx`)
- Un componente exportado por archivo (excepto sub-componentes internos)

### React

- Server Components por defecto. `"use client"` solo cuando se necesita interactividad.
- Artículos: SSG con `generateStaticParams` (1,294 páginas estáticas)
- Calculadoras: Client Components (formularios interactivos)
- Referencias de páginas (explorador, calendario, etc.): Client Components con estado de filtros
- Hooks personalizados en `src/lib/hooks/`
- Contextos en `src/lib/contexts/`

### Estilos

- Tailwind utility-first. Sin CSS modules.
- Responsive: mobile-first (`sm:`, `md:`, `lg:`)
- Dark mode: via `.dark` class (next-themes)
- Composición de clases: `clsx()` + `tailwind-merge` (función `cn()` si existe, o inline)
- Colores siempre via tokens CSS (`text-foreground`, `bg-card`, `border-border`)
- Nunca colores hardcodeados excepto en gradientes del hero

### Datos

- Datos estáticos en `src/config/*.ts` (exportan arrays/objetos tipados)
- Artículos como JSON individuales en `public/data/articles/[slug].json`
- Índice de artículos en `public/data/articles-index.json`
- Scripts de generación de datos: `npm run data:build`, `npm run data:verify`

---

## Pipeline RAG — Arquitectura Completa

### Flujo

```
Query del usuario
    ↓
[1] Query Enhancement (Haiku 4.5)
    ├── Rewrite: reformula con terminología legal colombiana
    ├── HyDE: genera respuesta hipotética para embedding
    └── Decomposition: descompone queries complejas en sub-queries
    ↓
[2] Retrieval (Pinecone)
    ├── Parallel embedding (multilingual-e5-large, 1024d)
    ├── Multi-query search (original + rewritten + HyDE + sub-queries)
    ├── topK: 15 por query
    ├── Similarity threshold: 0.35
    └── Metadata filters: libro, id_articulo
    ↓
[3] Heuristic Reranking
    ├── chunk_type boost: contenido +0.15, modificaciones +0.10
    ├── Direct article mention: +0.30
    ├── Title overlap: +0.05/word (max 0.15)
    ├── Derogated penalty: -0.15 (salvo queries históricas: +0.20)
    ├── Vigente boost: +0.05
    ├── Ley match: +0.15
    └── maxRerankedResults: 8
    ↓
[4] Context Assembly
    ├── Sibling retrieval: busca todos los chunks del mismo artículo
    ├── Dedup por chunk ID
    ├── Agrupación por artículo: contenido, modificaciones, textoAnterior
    └── Token budget: 6,000 tokens max
    ↓
[5] Prompt Building
    ├── System prompt con constantes 2026 (UVT, SMLMV, tarifas)
    ├── 35 sugerencias de calculadoras
    ├── Contexto RAG en XML: <context><article>...</article></context>
    ├── <page_context> si aplica
    └── <conversation_history> (últimos 5 turnos, 200 chars cada uno)
    ↓
[6] Streaming Response (Sonnet 4.5)
    └── Metadata on finish: sources, suggestedCalculators, ragMetadata
```

### Configuración RAG (`src/config/constants.ts`)

```typescript
RAG_CONFIG = {
  topK: 15,
  similarityThreshold: 0.35,
  maxContextTokens: 6000,
  maxRerankedResults: 8,
  useHyDE: true,
  useLLMRerank: false,
  useQueryExpansion: true,
  useSiblingRetrieval: true,
}
```

### Pinecone Index

- **Nombre:** `estatuto-tributario`
- **Host:** `https://estatuto-tributario-vrkkwsx.svc.aped-4627-b74a.pinecone.io`
- **Modelo de embedding:** `multilingual-e5-large` (1024 dimensiones)
- **Chunk metadata:** id_articulo, titulo, libro, estado, chunk_type (contenido|modificaciones|texto_anterior), chunk_index, total_chunks, complexity_score, total_mods, has_normas, vigente

### Esquema de Artículo (`public/data/articles/[slug].json`)

```typescript
{
  id_articulo: string;           // "Art. 240"
  titulo: string;
  titulo_corto: string;
  slug: string;
  url_origen: string;
  libro: string;                 // "Libro I - Renta"
  libro_full: string;
  estado: "vigente" | "modificado" | "derogado";
  complexity_score: number;      // 0-10
  contenido_texto: string;
  contenido_html: string;
  modificaciones_raw: string;
  modificaciones_parsed: ModificacionParsed[];
  total_modificaciones: number;
  ultima_modificacion_year: number;
  leyes_modificatorias: string[];
  texto_derogado: string[];
  texto_derogado_parsed: TextoDerogadoParsed[];
  normas_parsed: {
    jurisprudencia: string[];
    decretos: string[];
    doctrina_dian: string[];
    notas: string[];
    otros: string[];
  };
  total_normas: number;
  cross_references: string[];
  referenced_by: string[];
  concordancias: string;
  doctrina_dian_scrape: string;
  notas_editoriales: string;
}
```

---

## Variables de Entorno

```
ANTHROPIC_API_KEY=sk-ant-...        # Requerido — API key de Anthropic
PINECONE_API_KEY=pcsk_...           # Requerido — API key de Pinecone
PINECONE_INDEX_NAME=estatuto-tributario  # Nombre del índice
CHAT_MODEL=claude-sonnet-4-5-20250929   # Opcional — modelo del chat (default: Sonnet 4.5)
```

---

## Comandos de Desarrollo

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Build de producción (verifica TypeScript + genera 1,347 páginas)
npm run lint         # ESLint
npm run data:build   # Regenera datasets analíticos desde los JSONs de artículos
npm run data:verify  # Verifica integridad de datos
npx tsc --noEmit     # Type check sin emitir
```

---

## Mercado Objetivo — Colombia

### Audiencia (por prioridad)

1. **Contadores públicos independientes** (~60% del tráfico) — ~300,000 activos en Colombia (JCC). Necesitan eficiencia, precisión, referencias al ET. Manejan 10-50 clientes simultáneamente.
2. **Empresarios PyME** — No dominan tributaria. Necesitan claridad, confianza, respuestas simples.
3. **Abogados tributaristas** — Profundidad técnica, doctrina DIAN actualizada, argumentación legal.
4. **Personas naturales declarantes** — Pregunta #1: "¿Debo declarar renta?"
5. **Departamentos contables corporativos** — Herramientas de equipo, exportación, workflows.

### Pain Points del Mercado

- La DIAN cambia normas constantemente (reformas tributarias frecuentes)
- El Estatuto Tributario tiene 1,294 artículos densos y difíciles de navegar
- Contadores pierden horas buscando artículos y calculando manualmente
- Miedo a sanciones por errores en declaraciones
- Software existente (Siigo, World Office) es caro y complejo
- No existe plataforma gratuita integral: calculadoras + ET + IA + calendario

### Constantes Tributarias 2026

```
UVT 2026:    $52,374
SMLMV 2026:  $1,750,905
Auxilio transporte: $227,618
```

---

## Próxima Fase: Scraping Exhaustivo para Agente IA Robusto

### Objetivo

Construir la base de conocimiento tributario más completa de Colombia para alimentar el agente RAG. Actualmente tenemos los 1,294 artículos del ET. Falta: jurisprudencia, doctrina DIAN completa, decretos reglamentarios, resoluciones, y conceptos.

### Fuentes a Scrapear

#### 1. Estatuto Tributario — Artículos (COMPLETADO)
- **Fuente:** https://estatuto.co
- **Estado:** 1,294 artículos scrapeados, parseados y embebidos en Pinecone
- **Esquema:** Ver sección "Esquema de Artículo" arriba

#### 2. Doctrina DIAN (PENDIENTE — Prioridad Alta)
- **Fuente primaria:** https://www.dian.gov.co/normatividad/doctrina
- **Fuente secundaria:** https://cijuf.org.co (Centro Interamericano Jurídico Financiero)
- **Tipos:** Conceptos unificados, conceptos generales, oficios, circulares
- **Volumen estimado:** ~15,000-25,000 documentos
- **Campos a extraer:** número, fecha, tema, descriptor, texto completo, artículos del ET interpretados, vigencia, si fue revocado/modificado por otro concepto
- **Esquema actual** (parcial en `doctrina-data.ts`):
  ```typescript
  {
    id, numero, fecha, tema, pregunta, sintesis,
    conclusionClave, articulosET[], tipoDocumento,
    descriptores[], vigente
  }
  ```
- **Objetivo:** Scraping completo → chunking → embedding → Pinecone (namespace `doctrina`)

#### 3. Jurisprudencia Tributaria (PENDIENTE — Prioridad Alta)
- **Fuentes:**
  - Corte Constitucional: https://www.corteconstitucional.gov.co/relatoria/
  - Consejo de Estado (Sección Cuarta — tributaria): https://www.consejodeestado.gov.co
  - DIAN — Sentencias citadas en conceptos
- **Tipos:** Sentencias C- (constitucionalidad), SU- (unificación), T- (tutela relevante), Sentencias Consejo de Estado Sección Cuarta
- **Volumen estimado:** ~5,000-10,000 sentencias relevantes
- **Campos a extraer:** tipo, número, año, magistrado ponente, tema, ratio decidendi, obiter dicta, artículos del ET analizados, normas demandadas, decisión (exequible/inexequible/condicionada), salvamentos de voto
- **Objetivo:** Scraping → parsing → chunking → embedding → Pinecone (namespace `jurisprudencia`)

#### 4. Decretos Reglamentarios (PENDIENTE — Prioridad Media)
- **Fuente:** https://www.suin-juriscol.gov.co
- **Tipos:** Decreto Único Reglamentario 1625/2016 (DUR Tributario) y sus modificaciones
- **Volumen estimado:** ~2,000-5,000 artículos del DUR
- **Campos:** número decreto, artículo, texto, artículo del ET reglamentado, vigencia
- **Objetivo:** Conectar cada artículo del ET con su reglamentación

#### 5. Resoluciones DIAN (PENDIENTE — Prioridad Media)
- **Fuente:** https://www.dian.gov.co/normatividad/resoluciones
- **Tipos:** Resoluciones de procedimiento, formatos, fechas de vencimiento
- **Volumen estimado:** ~500-1,000 resoluciones vigentes
- **Campos:** número, fecha, tema, texto, artículos del ET relacionados

#### 6. Leyes Tributarias Completas (PENDIENTE — Prioridad Baja)
- **Fuente:** https://www.suin-juriscol.gov.co, https://www.secretariasenado.gov.co
- **Leyes clave:** 2277/2022 (Reforma Tributaria), 2010/2019, 1943/2018, 1819/2016, 1739/2014, 1607/2012
- **Objetivo:** Texto completo de cada ley para contexto de modificaciones

### Arquitectura de Scraping

```
scripts/scraping/
├── scrapers/
│   ├── dian-doctrina.ts          # Scraper de doctrina DIAN
│   ├── corte-constitucional.ts   # Scraper de sentencias CC
│   ├── consejo-estado.ts         # Scraper de sentencias CE Sección 4a
│   ├── suin-decretos.ts          # Scraper del DUR tributario
│   └── dian-resoluciones.ts      # Scraper de resoluciones
├── parsers/
│   ├── doctrina-parser.ts        # Extrae estructura de conceptos DIAN
│   ├── sentencia-parser.ts       # Extrae ratio decidendi, obiter, decisión
│   ├── decreto-parser.ts         # Extrae articulado del DUR
│   └── resolucion-parser.ts      # Extrae contenido de resoluciones
├── chunkers/
│   ├── legal-chunker.ts          # Chunking inteligente para texto legal
│   └── metadata-enricher.ts      # Enriquece chunks con metadata
├── embedders/
│   ├── batch-embedder.ts         # Embedding masivo con rate limiting
│   └── upsert-pinecone.ts        # Upsert a Pinecone con namespaces
├── validators/
│   ├── schema-validator.ts       # Valida esquema de datos scrapeados
│   └── completeness-checker.ts   # Verifica cobertura vs fuentes
└── orchestrator.ts               # Pipeline completo: scrape → parse → chunk → embed → upsert
```

### Consideraciones Críticas de Scraping

1. **Rate limiting:** Respetar robots.txt y aplicar delays (1-3s entre requests). DIAN y cortes tienen servidores lentos.
2. **Encoding:** Fuentes gubernamentales colombianas usan mezcla de UTF-8 y Latin-1. Normalizar siempre a UTF-8 NFC.
3. **Formatos:** PDF (sentencias), HTML (doctrina DIAN), DOC (decretos antiguos). Necesitar parsers específicos por formato.
4. **Deduplicación:** La misma sentencia puede aparecer en múltiples fuentes. Deduplicar por número+año.
5. **Vigencia:** Marcar cada documento como vigente/revocado/derogado. Los conceptos DIAN se revocan entre sí.
6. **Relaciones bidireccionales:** Un concepto DIAN interpreta artículos del ET → el artículo del ET debe enlazar de vuelta al concepto.
7. **Chunks legales:** El texto legal no se puede chunker arbitrariamente. Respetar límites de párrafo, numeral, literal. Chunk size ideal: 500-800 tokens con 100 tokens de overlap.
8. **Namespaces Pinecone:** Usar namespaces separados (`articulos`, `doctrina`, `jurisprudencia`, `decretos`, `resoluciones`) para filtrado eficiente.
9. **Metadata enrichment:** Cada chunk debe llevar: fuente, tipo_documento, numero, fecha, articulos_et[], tema, vigente, relevancia_score.
10. **Idempotencia:** Scripts deben ser re-ejecutables sin duplicar datos. Usar IDs determinísticos.

### Pinecone — Estrategia de Namespaces

```
estatuto-tributario (index)
├── namespace: "" (default)          # Artículos del ET (actual, 1,294 arts)
├── namespace: "doctrina"            # Conceptos y oficios DIAN
├── namespace: "jurisprudencia"      # Sentencias CC y CE
├── namespace: "decretos"            # DUR 1625/2016 y modificaciones
└── namespace: "resoluciones"        # Resoluciones DIAN
```

### Adaptación del RAG Pipeline

Una vez scrapeados los datos adicionales, el pipeline RAG necesita:

1. **Retriever multi-namespace:** Consultar múltiples namespaces en paralelo según la query
2. **Reranker ampliado:** Nuevas señales de boost para doctrina (tipo_documento, vigencia, relevancia al tema)
3. **Context assembler:** Agrupar por tipo de fuente (artículo + doctrina + jurisprudencia)
4. **Prompt builder:** Secciones XML diferenciadas: `<articulo>`, `<doctrina>`, `<jurisprudencia>`
5. **System prompt:** Instrucciones de cómo citar cada tipo de fuente (Art. X ET, Concepto DIAN No. X, Sentencia C-XXX/YYYY)

---

## Estándares de Calidad

### Antes de cada commit

```bash
npm run build        # 0 errores, todas las páginas generadas
npm run lint         # Sin warnings
npx tsc --noEmit     # Type check limpio
```

### Copy y Lenguaje

- Español colombiano (no de España): "computador" no "ordenador", "tasa" no "tipo impositivo"
- Tono: profesional pero accesible. Autoritativo sin ser académico.
- Citar siempre artículos del ET con formato: "Art. 241 ET", "Arts. 592-594 ET"
- Citar doctrina DIAN con formato: "Concepto DIAN No. 012345 de 2024"
- Citar jurisprudencia: "Sentencia C-XXX de YYYY, M.P. Nombre Apellido"
- UVT siempre con valor en pesos al lado: "1,090 UVT ($57,087,660)"

### Performance

- First Contentful Paint < 1.5s
- Videos del hero: preload="auto" para scene 1, preload="metadata" para 2 y 3
- Artículos: SSG (build-time), 0 JS para lectura
- Calculadoras: Client-side only, sin API calls
- Chat: Streaming response, no blocking

### Accesibilidad

- `aria-hidden="true"` en elementos decorativos (hero video)
- Labels en todos los inputs de formulario
- Contraste WCAG AA mínimo
- Keyboard navigation funcional
- `prefers-reduced-motion` desactiva animaciones

---

## Evaluación RAG (`eval/`)

El proyecto incluye un framework de evaluación para medir calidad del RAG:

```bash
# Ejecutar evaluación
npx tsx eval/run_eval.ts
```

- **Dataset:** `eval/dataset.json` — preguntas tributarias con respuestas esperadas
- **Métricas:** retrieval precision/recall, answer quality (LLM judge), latencia
- **Config grid:** `eval/config-grid.ts` — prueba diferentes combinaciones de topK, threshold, etc.
- **Prompt variants:** `eval/prompt-variants.ts` — A/B test de system prompts

---

## Permisos Pre-configurados (`.claude/settings.json`)

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run build)",
      "Bash(npx tsc --noEmit)",
      "Bash(git *)",
      "Bash(ls *)",
      "Bash(wc *)",
      "Bash(npm run lint *)",
      "Bash(npm run build *)",
      "Bash(npx *)"
    ]
  }
}
```
