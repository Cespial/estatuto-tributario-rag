# PROMPTS — Perfeccionamiento Paralelo con Gemini CLI

> **Instrucciones:** Cada prompt es autocontenido. Copiar y pegar en un CLI de Gemini independiente.
> Todos los prompts pueden ejecutarse en simultaneo sin conflictos de archivos.
> Directorio de trabajo: `/Users/cristianespinal/superapp-tributaria-colombia`

---

## PROMPT 1 de 6: Landing Page, Hero, Header y Footer

```
Eres un ingeniero frontend senior especializado en landing pages de conversion para SaaS legal-tech. Tu tarea es perfeccionar la landing page de SuperApp Tributaria Colombia, una plataforma tributaria premium inspirada en Harvey.ai.

## CONTEXTO DEL PROYECTO

- Framework: Next.js 16.1.6, React 19, Tailwind CSS v4 (CSS-first con @theme inline)
- Diseño: Harvey.ai warm-gray premium. Paleta monocromatica calida (#fafaf9/#0f0e0d). Headings serif con .heading-serif (Playfair Display, weight 400, tracking -0.0175em). Ver STYLE-GUIDE.md para referencia completa.
- Audiencia principal: Contadores publicos colombianos (~60%), PyMEs, abogados tributaristas
- URL produccion: https://superapp-tributaria-colombia.vercel.app

## PERMISOS

Tienes permiso para:
- Leer cualquier archivo del proyecto
- Editar archivos dentro de src/components/landing/, src/components/hero/, src/components/layout/, src/app/page.tsx, src/app/globals.css
- Ejecutar `npm run build` y `npm run lint` para verificar
- NO tocar archivos fuera de los directorios listados arriba
- NO instalar dependencias nuevas

## ARCHIVOS A DIAGNOSTICAR (lee TODOS antes de hacer cambios)

### Pagina principal:
- src/app/page.tsx (landing page completa — 8 secciones + JSON-LD + metadata)
- src/app/layout.tsx (root layout, providers, fonts)
- src/app/globals.css (tokens CSS, utilidades, animaciones)

### Componentes landing:
- src/components/landing/trust-strip.tsx (3 trust signals)
- src/components/landing/persona-switcher.tsx (5 tabs de personas — cliente)
- src/components/landing/workflow-steps.tsx (3 pasos: Identifique→Calcule→Sustente)
- src/components/landing/metrics-section.tsx (4 contadores animados — cliente)
- src/components/landing/comparison-section.tsx (tabla comparativa)
- src/components/landing/faq-section.tsx (6 preguntas accordion)
- src/components/landing/footer-links.tsx (4 columnas + disclaimer)
- src/components/landing/mobile-sticky-cta.tsx (barra fija mobile)
- src/components/landing/lazy-chat-container.tsx (chat lazy-loaded)
- src/components/landing/chat-skeleton.tsx (skeleton de carga)
- src/components/landing/use-case-ticker.tsx (NO USADO actualmente — evaluar)

### Header y Hero:
- src/components/layout/header.tsx (navegacion principal, variant transparent/solid)
- src/components/hero/hero-video.tsx (3 videos con crossfade)

### Referencia de estilo:
- STYLE-GUIDE.md (guia de estilo completa)
- CLAUDE.md (arquitectura y convenciones)

## DIAGNOSTICO PREVIO (problemas identificados)

### CRITICOS:
1. Comparison table (comparison-section.tsx): grid-cols-3 colapsa en mobile <375px. Los textos se truncan y la tabla es ilegible.
2. Persona switcher tabs: 5 tabs con overflow-x-auto pero sin indicador visual de scroll horizontal. En mobile solo se ven 2-3 tabs.
3. Example questions en seccion Asistente IA: NO son clickeables. El usuario debe scrollear al chat y escribir manualmente.

### ALTOS:
4. Spacing inconsistente entre secciones: algunas usan py-16 md:py-24, otras py-10 md:py-16. No hay ritmo visual.
5. CTAs del hero usan texto infinitivo ("Calcular") pero el heading usa imperativo ("Resuelva"). Inconsistencia de tono.
6. FAQ accordion: sin icono de flecha/chevron que indique expandir. El usuario no sabe que es interactivo.
7. Footer: no tiene enlaces de redes sociales, contacto, ni newsletter.
8. Metrica "2026" en metrics-section.tsx mezclada con contadores (35, 1,294) — incoherente.
9. Dark section (Asistente IA y CTA final): en dark mode se invierte (claro sobre oscuro sobre oscuro) — visualmente jarring.
10. Copyright year hardcodeado "2026".

### MEDIOS:
11. Trust strip: "Normativa tributaria colombiana centralizada" es vago. Deberia ser especifico: "1,294 articulos del ET indexados".
12. Workflow steps: sin flechas/conectores visuales entre los 3 pasos.
13. No hay seccion de testimoniales o social proof con numeros reales.
14. Chat height en mobile (420px) ocupa toda la pantalla.
15. Mobile sticky CTA: no se puede cerrar/ocultar.
16. use-case-ticker.tsx existe pero no se usa — evaluar integracion o eliminar.
17. Hover states en cards de calculadoras: solo cambia borde. Falta feedback tactil.
18. Final CTA section: enlace #asistente scrollea hacia ARRIBA (awkward UX).

## PLAN DE ACCION

Para cada problema:
1. Lee los archivos relevantes
2. Diagnostica el problema exacto con lineas de codigo
3. Implementa la solucion minima y elegante
4. Verifica que no rompe dark mode, mobile, ni accesibilidad

### Prioridad de ejecucion:
1. Fix comparison table mobile (responsive stack)
2. Fix persona switcher scroll indicator (gradient fade + dots)
3. Make example questions clickable (auto-fill chat)
4. Standardize section spacing (py-16 md:py-24 everywhere)
5. Add chevron to FAQ accordion
6. Fix dark section in dark mode (use absolute colors)
7. Fix CTA copy consistency (imperativo everywhere)
8. Improve metrics section (replace "2026" with useful metric)
9. Add social links to footer
10. Add connectors to workflow steps
11. Improve trust strip copy
12. Fix mobile chat height (360px)
13. Dynamic copyright year
14. Evaluate use-case-ticker integration

### Al terminar:
- Ejecuta `npm run build` — debe compilar con 0 errores
- Ejecuta `npm run lint` — sin warnings
- Verifica visualmente en mobile (375px) y desktop (1440px)
- Verifica dark mode en todas las secciones modificadas
```

---

## PROMPT 2 de 6: Las 35 Calculadoras + Hub + Shared Components

```
Eres un ingeniero frontend senior especializado en herramientas financieras interactivas. Tu tarea es perfeccionar las 35 calculadoras tributarias de SuperApp Tributaria Colombia.

## CONTEXTO DEL PROYECTO

- Framework: Next.js 16.1.6, React 19, Tailwind CSS v4 (CSS-first con @theme inline)
- Diseño: Harvey.ai warm-gray premium. Ver STYLE-GUIDE.md.
- Audiencia: Contadores publicos colombianos, PyMEs, abogados tributaristas
- Las calculadoras son 100% client-side (sin API calls). Usan useMemo para calculos reactivos.
- URL state sync: los parametros se guardan en la URL para compartir resultados.

## PERMISOS

Tienes permiso para:
- Leer cualquier archivo del proyecto
- Editar archivos dentro de: src/app/calculadoras/, src/components/calculators/, src/lib/calculators/, src/config/tax-data*.ts, src/config/calculators-catalog.ts, src/config/calculators-guided-flow.ts, src/config/ica-data.ts, src/config/retencion-tabla-data.ts, src/app/tablas/retencion/
- Ejecutar `npm run build` y `npm run lint`
- NO instalar dependencias nuevas
- NO tocar archivos fuera de los directorios listados

## ARCHIVOS A DIAGNOSTICAR (lee TODOS antes de hacer cambios)

### Hub principal:
- src/app/calculadoras/page.tsx (hub con busqueda + categorias + guided flow)
- src/app/calculadoras/layout.tsx

### Componentes compartidos (leer TODOS):
- src/components/calculators/calculadoras-hub-client.tsx
- src/components/calculators/calculator-card.tsx
- src/components/calculators/calculator-breadcrumb.tsx
- src/components/calculators/calculator-actions.tsx (share/export)
- src/components/calculators/calculator-result.tsx
- src/components/calculators/calculator-sources.tsx
- src/components/calculators/calculator-disclaimer.tsx
- src/components/calculators/calculation-steps-table.tsx
- src/components/calculators/scenario-slider.tsx
- src/components/calculators/shared-inputs.tsx (CurrencyInput, NumberInput, ToggleInput, SelectInput)
- src/components/calculators/related-calculators.tsx
- src/components/calculators/date-input.tsx
- src/components/calculators/calculator-icon-map.ts

### Charts:
- src/components/calculators/charts/renta-breakdown-chart.tsx
- src/components/calculators/charts/nomina-cost-chart.tsx
- src/components/calculators/charts/debo-declarar-threshold-chart.tsx
- src/components/calculators/charts/comparador-modes-chart.tsx
- src/components/calculators/charts/retencion-breakdown-chart.tsx

### Las 35 calculadoras (leer TODAS):
- src/app/calculadoras/renta/page.tsx
- src/app/calculadoras/retencion/page.tsx
- src/app/calculadoras/debo-declarar/page.tsx
- src/app/calculadoras/comparador/page.tsx (1,008 lineas — la mas compleja)
- src/app/calculadoras/nomina-completa/page.tsx
- src/app/calculadoras/iva/page.tsx
- src/app/calculadoras/uvt/page.tsx
- src/app/calculadoras/simple/page.tsx
- src/app/calculadoras/sanciones/page.tsx
- src/app/calculadoras/sanciones-ampliadas/page.tsx
- src/app/calculadoras/patrimonio/page.tsx
- src/app/calculadoras/seguridad-social/page.tsx
- src/app/calculadoras/retencion-salarios/page.tsx
- src/app/calculadoras/dividendos/page.tsx
- src/app/calculadoras/dividendos-juridicas/page.tsx
- src/app/calculadoras/renta-juridicas/page.tsx
- src/app/calculadoras/anticipo/page.tsx
- src/app/calculadoras/beneficio-auditoria/page.tsx
- src/app/calculadoras/comparador-regimenes/page.tsx
- src/app/calculadoras/ganancias-ocasionales/page.tsx
- src/app/calculadoras/ganancias-loterias/page.tsx
- src/app/calculadoras/herencias/page.tsx
- src/app/calculadoras/comparacion-patrimonial/page.tsx
- src/app/calculadoras/gmf/page.tsx
- src/app/calculadoras/timbre/page.tsx
- src/app/calculadoras/consumo/page.tsx
- src/app/calculadoras/depreciacion/page.tsx
- src/app/calculadoras/intereses-mora/page.tsx
- src/app/calculadoras/descuentos-tributarios/page.tsx
- src/app/calculadoras/zonas-francas/page.tsx
- src/app/calculadoras/ica/page.tsx
- src/app/calculadoras/liquidacion-laboral/page.tsx
- src/app/calculadoras/horas-extras/page.tsx
- src/app/calculadoras/pension/page.tsx
- src/app/calculadoras/licencia-maternidad/page.tsx

### Tabla de retencion:
- src/app/tablas/retencion/page.tsx
- src/components/retention/retention-table.tsx
- src/components/retention/retention-concept-wizard.tsx
- src/components/retention/retention-concept-tooltip.tsx
- src/components/retention/QuickCalculator.tsx

### Config data (leer TODOS):
- src/config/tax-data.ts (UVT, brackets, rates, SMLMV)
- src/config/tax-data-laboral.ts (recargos, jornada, depuracion)
- src/config/tax-data-laboral-sprint2.ts
- src/config/tax-data-corporativo.ts
- src/config/tax-data-ganancias.ts
- src/config/tax-data-wave4.ts
- src/config/tax-data-sprint2.ts
- src/config/ica-data.ts
- src/config/retencion-tabla-data.ts
- src/config/calculators-catalog.ts
- src/config/calculators-guided-flow.ts

### Utilidades:
- src/lib/calculators/format.ts
- src/lib/calculators/search.ts
- src/lib/calculators/url-state.ts
- src/lib/calculators/popularity.ts
- src/lib/calculators/share.ts

## DIAGNOSTICO PREVIO (problemas identificados)

### CRITICOS:
1. INCONSISTENCIA DE COMPONENTES: Las calculadoras mas antiguas (iva, uvt, sanciones, simple, patrimonio, gmf, timbre, consumo, depreciacion, ganancias-loterias, zonas-francas) NO usan los componentes compartidos modernos. Falta: CalculatorBreadcrumb, CalculatorActions (share/export), RelatedCalculators, CalculatorDisclaimer estandar, PrintWrapper/usePrintExport.
2. DATOS: Verificar que tax-data.ts tenga UVT 2026 correcto ($52,374) en TODOS los mapas. El valor UVT_VALUES[2026] puede estar en 49,799 (valor de 2025). Auditar TODOS los archivos tax-data*.ts.

### ALTOS:
3. Empty state: cuando todos los inputs son 0, las calculadoras muestran cards vacias con "$0". Deberian mostrar placeholder "Ingresa valores para comenzar".
4. Inputs: placeholder "0" en campos de moneda. Deberia ser "Ej: 50.000.000" con ejemplo realista.
5. Sin tooltips informativos: campos como "Rentas exentas", "IBC", "Base gravable" no tienen icono (i) con tooltip explicativo.
6. Sin aria-live en resultados: screen readers no anuncian cuando los resultados cambian.
7. Comparador (1,008 lineas): el useMemo de calculo tiene ~400 lineas. Debe refactorizarse en funciones separadas: calcLaboral(), calcIntegral(), calcIndependiente().

### MEDIOS:
8. Hub: el guided flow de 3 preguntas es util pero no tiene indicador de progreso (paso 1/3, 2/3, 3/3).
9. Calculator cards en el hub: no muestran badge de categoria.
10. Cross-field validation ausente: en patrimonio, si deudas > patrimonioBruto no hay warning. En comparador, si presupuesto < SMLMV no hay warning.
11. ScenarioSlider: solo presente en ~5 calculadoras. Deberia estar en TODAS las que tengan un input principal de monto.
12. Charts: solo 5 calculadoras tienen charts visuales. Agregar bar/pie charts a las que tengan desglose (seguridad-social, liquidacion-laboral, horas-extras).
13. Tablas/retencion: la tabla es excelente pero falta highlight de la fila seleccionada al usar el wizard.

## PLAN DE ACCION

### Fase 1: Homogeneizar componentes (TODAS las calculadoras)
Para CADA calculadora que NO tenga estos componentes, agregarlos:
- CalculatorBreadcrumb (reemplazar Link manual con ArrowLeft)
- CalculatorActions (share + export)
- CalculatorDisclaimer (estandar)
- RelatedCalculators (usando campo `related` del catalog)
- PrintWrapper + usePrintExport (para PDF)

### Fase 2: UX improvements globales
- Empty state placeholder en CalculatorResult cuando todos los valores son 0
- Input placeholders con ejemplos realistas
- Tooltips con icono (i) en inputs complejos
- aria-live="polite" en contenedores de resultado
- Guided flow progress indicator (1/3, 2/3, 3/3)

### Fase 3: Refactoring comparador
- Extraer calcLaboral(), calcIntegral(), calcIndependiente() como funciones puras
- Mover a un archivo separado: src/lib/calculators/comparador-engine.ts

### Fase 4: Validaciones cruzadas
- Agregar warnings visuales cuando combinaciones de inputs son ilógicas
- Patrimonio: deudas > patrimonioBruto
- Comparador: presupuesto < SMLMV
- Renta: deducciones > ingresos

### Fase 5: Verificacion de datos
- Auditar TODOS los tax-data*.ts: UVT 2026 = $52,374, SMLMV 2026 = $1,750,905
- Verificar brackets y tarifas contra Estatuto Tributario vigente

### Al terminar:
- Ejecuta `npm run build` — 0 errores
- Ejecuta `npm run lint` — sin warnings
- Verifica que TODAS las 35 calculadoras cargan correctamente
- Verifica que share URLs funcionan (copiar URL con params → abrir en incognito)
```

---

## PROMPT 3 de 6: Explorador, Dashboard y Comparador

```
Eres un ingeniero frontend senior especializado en data visualization y exploracion de datos. Tu tarea es perfeccionar el Explorador de Articulos (1,294 articulos del ET), el Dashboard analitico, y el Comparador de versiones de SuperApp Tributaria Colombia.

## CONTEXTO DEL PROYECTO

- Framework: Next.js 16.1.6, React 19, Tailwind CSS v4, Recharts 3.7, react-force-graph-2d 1.29
- Diseño: Harvey.ai warm-gray premium. Ver STYLE-GUIDE.md.
- Data: 1,294 articulos del Estatuto Tributario como JSON individuales en public/data/articles/
- Indices: articles-index.enriched.json (1.4MB), dashboard-stats.json, graph-data.json (136KB)

## PERMISOS

Tienes permiso para:
- Leer cualquier archivo del proyecto
- Editar archivos dentro de: src/app/explorador/, src/app/dashboard/, src/app/comparar/, src/components/explorer/, src/components/dashboard/, src/components/comparison/, src/components/pdf/, src/lib/export/
- Ejecutar `npm run build` y `npm run lint`
- NO instalar dependencias nuevas
- NO tocar archivos fuera de los directorios listados

## ARCHIVOS A DIAGNOSTICAR

### Explorador:
- src/app/explorador/page.tsx (cliente — busqueda, filtros, 3 vistas: grid/list/graph)
- src/components/explorer/search-bar.tsx (autocomplete con debounce 250ms)
- src/components/explorer/filter-panel.tsx (libro, estado, hasMods, hasNormas, ley, year)
- src/components/explorer/article-card.tsx (card en vista grid)
- src/components/explorer/article-grid.tsx (grid container)
- src/components/explorer/article-list.tsx (vista tabla)
- src/components/explorer/featured-articles.tsx (articulos destacados: mas_consultados, mas_modificados, esenciales)
- src/components/explorer/relationship-graph.tsx (grafo force-directed, max 260 nodos)

### Dashboard:
- src/app/dashboard/page.tsx (server component — fetch JSON)
- src/components/dashboard/dashboard-client.tsx (orquestador cliente)
- src/components/dashboard/stats-cards.tsx (KPIs basicos)
- src/components/dashboard/action-kpi-cards.tsx (KPIs interactivos)
- src/components/dashboard/time-range-filter.tsx (historico/ultima_reforma/12_meses)
- src/components/dashboard/reform-timeline-chart.tsx (timeline de reformas)
- src/components/dashboard/reform-drilldown-chart.tsx (drilldown por ano)
- src/components/dashboard/libro-distribution-chart.tsx (distribucion por libro)
- src/components/dashboard/libro-treemap-chart.tsx (treemap)
- src/components/dashboard/top-modified-table.tsx (top 20 mas modificados)
- src/components/dashboard/top-referenced-table.tsx (top referenciados)
- src/components/dashboard/top-referenced-trend-table.tsx (trends con sparklines)
- src/components/dashboard/dashboard-export-actions.tsx (export JSON/CSV)
- src/components/dashboard/dashboard-skeleton.tsx (loading state)

### Comparador:
- src/app/comparar/page.tsx (cliente — seleccion de articulos, diff viewer)
- src/app/comparar/layout.tsx
- src/components/comparison/article-version-selector.tsx (autocomplete de articulos)
- src/components/comparison/article-diff-viewer.tsx (diff inline word-level)
- src/components/comparison/change-summary-card.tsx (stats + AI summary)
- src/components/comparison/comparison-mode-toggle.tsx (historical vs cross-article)
- src/components/comparison/diff-view-toggle.tsx (inline vs side-by-side)
- src/components/comparison/diff-minimap.tsx (overview sidebar)
- src/components/comparison/diff-utils.ts (computeWordDiff)

### Compartidos:
- src/components/pdf/pdf-export-button.tsx
- src/components/pdf/print-wrapper.tsx
- src/lib/export/toJson.ts
- src/lib/export/toCsv.ts
- src/lib/export/toLegalPdf.ts

### Data:
- public/data/articles-index.enriched.json
- public/data/dashboard-stats.json
- public/data/dashboard-timeseries.json
- public/data/explorer-facets.json
- public/data/featured-articles.json
- public/data/graph-data.json

## DIAGNOSTICO PREVIO

### CRITICOS:
1. Comparador: diff-view-toggle tiene opcion "side-by-side" pero el ArticleDiffViewer solo implementa inline. El toggle side-by-side no hace nada.
2. Comparador: diff-minimap existe pero click-to-scroll NO esta conectado. Es decorativo.
3. Comparador: AI summary API puede fallar sin error handling visible al usuario.

### ALTOS:
4. Explorador: no hay skeleton loaders para grid/list individual. Solo spinner de pagina completa al cargar 1.4MB de JSON.
5. Explorador: busqueda es solo local (no usa backend). Para 1,294 articulos esta bien, pero podria beneficiarse de search indexing.
6. Explorador: vista Graph limitada a 260 nodos. No hay indicador de cuantos nodos se omitieron.
7. Dashboard: charts no son interactivos. No hay click-to-filter desde charts a tabla.
8. Dashboard: no hay insight cards (analisis automatico tipo "El 45% de los articulos del Libro I han sido modificados desde 2019").
9. Dashboard: sparklines en top-referenced-trend-table son pequenas y dificiles de leer en mobile.

### MEDIOS:
10. Explorador: FilterPanel tiene muchos filtros pero no muestra cuantos filtros activos hay (badge count).
11. Explorador: featured articles section no tiene animacion de entrada.
12. Dashboard: no muestra fecha de ultima actualizacion de datos.
13. Comparador: no hay atajos desde pagina de articulo a comparador (ej. boton "Comparar con...").
14. Export: solo JSON y CSV. Falta PDF para dashboard.
15. Article cards en grid: no muestran preview del contenido (solo titulo + stats).
16. Graph: no hay leyenda de colores (nodos por libro o por estado).

## PLAN DE ACCION

### Explorador:
1. Agregar skeleton loaders (grid: 12 cards skeleton, list: 20 rows skeleton)
2. Agregar badge de filtros activos en FilterPanel header
3. Agregar indicador en Graph mode: "Mostrando 260 de {total} nodos"
4. Agregar leyenda de colores al grafo
5. Agregar snippet preview (primeros 100 chars de contenido_texto) en article-card
6. Mejorar featured articles con scroll reveal animation

### Dashboard:
7. Agregar click-to-filter: click en barra de chart → filtra tabla
8. Agregar 3-4 insight cards con analisis automatico de los datos
9. Mejorar sparklines responsividad en mobile
10. Agregar fecha de ultima actualizacion
11. Agregar export PDF para dashboard

### Comparador:
12. IMPLEMENTAR vista side-by-side (2 columnas con scroll sincronizado)
13. CONECTAR diff-minimap click-to-scroll
14. Agregar error handling visible para AI summary (toast de error)
15. Agregar boton "Enviar al asistente IA" con contexto del diff

### Al terminar:
- Ejecuta `npm run build` — 0 errores
- Ejecuta `npm run lint` — sin warnings
- Verifica el explorador con busqueda "Art. 240", filtro Libro I, vista graph
- Verifica el comparador con Art. 240 (historical mode, 2+ versiones)
- Verifica el dashboard en mobile (charts responsive)
```

---

## PROMPT 4 de 6: Calendario, Indicadores y Novedades

```
Eres un ingeniero frontend senior especializado en herramientas de referencia profesional. Tu tarea es perfeccionar el Calendario Fiscal 2026, la pagina de Indicadores Economicos, y la seccion de Novedades Normativas de SuperApp Tributaria Colombia.

## CONTEXTO DEL PROYECTO

- Framework: Next.js 16.1.6, React 19, Tailwind CSS v4
- Diseño: Harvey.ai warm-gray premium. Ver STYLE-GUIDE.md.
- Audiencia: Contadores publicos que necesitan fechas exactas de vencimiento, indicadores actualizados, y novedades normativas para asesorar clientes.

## PERMISOS

Tienes permiso para:
- Leer cualquier archivo del proyecto
- Editar archivos dentro de: src/app/calendario/, src/app/indicadores/, src/app/novedades/, src/components/calendar/, src/components/indicators/, src/components/novedades/, src/config/calendario-data.ts, src/config/indicadores-data.ts, src/config/novedades-data.ts, src/lib/calendar/
- Ejecutar `npm run build` y `npm run lint`
- NO instalar dependencias nuevas
- NO tocar archivos fuera de los directorios listados

## ARCHIVOS A DIAGNOSTICAR

### Calendario:
- src/app/calendario/page.tsx (cliente — tabla + grid + filtros NIT)
- src/components/calendar/UpcomingDeadlinesPanel.tsx (proximas 3 fechas)
- src/components/calendar/NitProfileFilter.tsx (input NIT + perfiles guardados)
- src/components/calendar/CalendarRangeTabs.tsx (mes/trimestre/ano)
- src/components/calendar/CalendarMonthGrid.tsx (vista calendario mensual)
- src/components/calendar/MobileMonthSwipe.tsx (swipe mobile)
- src/components/calendar/DeadlineStatusBadge.tsx (vencido/esta_semana/proximo)
- src/components/calendar/AddToCalendarButton.tsx (generar .ics individual)
- src/components/calendar/ExportFilteredIcsButton.tsx (exportar todas como .ics)
- src/config/calendario-data.ts (datos de obligaciones 2026)
- src/lib/calendar/status.ts (calculo de estado)
- src/lib/calendar/nit.ts (parsing de NIT)
- src/lib/calendar/ics.ts (generacion de archivos .ics)

### Indicadores:
- src/app/indicadores/page.tsx (cliente — hero + cards + tabla UVT + calculadora inline)
- src/components/indicators/IndicatorsHero.tsx (4 indicadores destacados con sparklines)
- src/components/indicators/IndicatorCard.tsx (card individual con copy)
- src/components/indicators/IndicatorTrendChart.tsx (line chart historico)
- src/components/indicators/UvtCopInlineCalculator.tsx (conversor UVT bidireccional)
- src/components/indicators/UvtYoyTable.tsx (tabla YoY con cambio absoluto/porcentual)
- src/components/indicators/TaxCharts.tsx (charts genericos — evaluar uso)
- src/config/indicadores-data.ts (mapa de indicadores + historicos)

### Novedades:
- src/app/novedades/page.tsx (cliente — timeline + cards expandibles + filtros)
- src/app/novedades/layout.tsx
- src/components/novedades/NovedadesWeeklyDigest.tsx (resumen semanal top 3)
- src/components/novedades/NovedadTimeline.tsx (timeline cronologica sidebar)
- src/components/novedades/NovedadExpandableCard.tsx (card con expand/collapse)
- src/components/novedades/NovedadImpactBadge.tsx (alto/medio/informativo)
- src/components/novedades/NovedadAudienceFilter.tsx (filtro por audiencia)
- src/components/novedades/QueSignificaPanel.tsx (explicacion en lenguaje claro)
- src/config/novedades-data.ts (novedades enriquecidas)

### Layout compartido:
- src/components/layout/ReferencePageLayout.tsx (wrapper para paginas de referencia)

## DIAGNOSTICO PREVIO

### CRITICOS:
1. Calendario: fechas de vencimiento son ESTATICAS (hardcoded en config). Si la DIAN cambia fechas, hay que editar manualmente. No hay indicador de "datos actualizados al DD/MM/YYYY".
2. Indicadores: datos son ESTATICOS. No hay API para TRM o tasa de usura en tiempo real. Debe mostrar disclaimer claro de fecha de corte.

### ALTOS:
3. Calendario: NIT profiles no se sincronizan entre dispositivos (solo localStorage). Agregar opcion de export/import de perfiles.
4. Calendario: la vista CalendarMonthGrid no muestra tooltips al hacer hover sobre un dia con vencimientos. Solo muestra un punto.
5. Calendario: no hay vista de "proxima semana" o "proximos 30 dias" como filtro rapido.
6. Indicadores: no hay export de indicadores (CSV con todos los valores actuales).
7. Indicadores: sparklines en IndicatorsHero no son clickeables para ver detalle.
8. Novedades: no hay RSS feed ni opcion de email notification.
9. Novedades: weekly digest fallback a 30 dias es confuso. Si no hay novedades recientes, deberia decir "No hay novedades esta semana" en vez de mostrar novedades viejas.
10. Novedades: no hay filtro por fecha (desde-hasta).

### MEDIOS:
11. Calendario: AddToCalendarButton genera .ics basico. Podria incluir descripcion con articulos ET relevantes.
12. Calendario: MobileMonthSwipe no tiene indicador de paginacion (dots o arrows).
13. Indicadores: UvtYoyTable no es exportable.
14. Indicadores: copy button no tiene confirmacion visual en dark mode.
15. Novedades: QueSignificaPanel solo muestra para la primera novedad expandida. Deberia estar en CADA card.
16. Novedades: integracion con calendario (cambiaCalendario) es unidireccional. El calendario no muestra banner de novedad.
17. No hay pagina de "Todas las actualizaciones de datos" con changelog.

## PLAN DE ACCION

### Calendario:
1. Agregar badge "Datos actualizados al DD/MM/YYYY" en header
2. Agregar tooltips en CalendarMonthGrid (hover sobre dia → lista de vencimientos)
3. Agregar filtros rapidos: "Proxima semana", "Proximos 30 dias"
4. Mejorar .ics con descripcion detallada (articulos ET, monto si aplica)
5. Agregar export/import de perfiles NIT (boton con JSON download/upload)
6. Agregar indicador de paginacion en MobileMonthSwipe
7. Agregar banner bidireccional: si hay novedad que afecta calendario, mostrar en calendario

### Indicadores:
8. Agregar export CSV de todos los indicadores actuales
9. Hacer sparklines clickeables → scroll a chart detallado
10. Agregar disclaimer prominente "Datos al DD/MM/YYYY. Consulte fuente oficial."
11. Mejorar copy feedback en dark mode (usar Toast component existente)
12. Hacer UvtYoyTable exportable (CSV button)
13. Evaluar TaxCharts.tsx — si no se usa, eliminar

### Novedades:
14. Mejorar weekly digest: mostrar "No hay novedades esta semana" cuando corresponda
15. Agregar filtro por rango de fechas (desde-hasta con date pickers)
16. Asegurar que QueSignificaPanel aparece en CADA card expandida
17. Agregar boton "Copiar resumen" por novedad (para enviar a clientes)
18. Agregar integracion bidireccional con calendario

### Al terminar:
- Ejecuta `npm run build` — 0 errores
- Ejecuta `npm run lint` — sin warnings
- Verifica calendario con NIT "1" → filtro trimestre → vista mes → export .ics
- Verifica indicadores en mobile → copy UVT → sparkline click
- Verifica novedades con filtro "alto" + audiencia "juridicas"
```

---

## PROMPT 5 de 6: Glosario, Guias Interactivas, Doctrina y Knowledge System

```
Eres un ingeniero frontend senior especializado en sistemas de conocimiento interactivo y educational tech. Tu tarea es perfeccionar el Glosario Tributario, las Guias Interactivas (decision trees), la seccion de Doctrina DIAN, y el sistema de conocimiento compartido (InteractiveTaxText, tooltips, vigencia) de SuperApp Tributaria Colombia.

## CONTEXTO DEL PROYECTO

- Framework: Next.js 16.1.6, React 19, Tailwind CSS v4
- Diseño: Harvey.ai warm-gray premium. Ver STYLE-GUIDE.md.
- Knowledge system: Terminos del glosario detectados automaticamente en texto via InteractiveTaxText. Doctrina DIAN vinculada a articulos del ET. Guias como decision trees con persistencia de progreso.

## PERMISOS

Tienes permiso para:
- Leer cualquier archivo del proyecto
- Editar archivos dentro de: src/app/glosario/, src/app/guias/, src/app/doctrina/, src/components/knowledge/, src/config/glosario-data.ts, src/config/guias-data.ts, src/config/doctrina-data.ts, src/lib/knowledge/
- Ejecutar `npm run build` y `npm run lint`
- NO instalar dependencias nuevas
- NO tocar archivos fuera de los directorios listados

## ARCHIVOS A DIAGNOSTICAR

### Glosario:
- src/app/glosario/page.tsx (cliente — indice A-Z, busqueda fuzzy, term of the day, streak)
- src/config/glosario-data.ts (terminos tributarios con definicion, ejemplo, formula, diagrama)

### Guias:
- src/app/guias/page.tsx (indice de guias con categorias y progreso)
- src/app/guias/[guiaId]/page.tsx (detalle — decision tree interactivo con persistencia)
- src/config/guias-data.ts (arboles de decision con nodos pregunta/resultado)

### Doctrina:
- src/app/doctrina/page.tsx (cliente — busqueda semantica, filtros, timeline)
- src/app/doctrina/layout.tsx
- src/config/doctrina-data.ts (conceptos DIAN curados)

### Knowledge components (compartidos por glosario, doctrina, guias, articulos):
- src/components/knowledge/InteractiveTaxText.tsx (auto-link de Art. XXX en texto)
- src/components/knowledge/RelatedResourcesRail.tsx (panel lateral con cross-links)
- src/components/knowledge/TermTooltip.tsx (tooltip de termino del glosario)
- src/components/knowledge/VigenciaBadge.tsx (vigente/revocado/suspendido)
- src/lib/knowledge/knowledge-index.ts (indice de busqueda en memoria)

### Tipos:
- src/types/knowledge.ts

## DIAGNOSTICO PREVIO

### CRITICOS:
1. InteractiveTaxText: solo detecta "Art. XXX" y "Articulo XXX". NO detecta "Ley XXXX de YYYY", "Decreto XXXX", "Concepto DIAN No. XXXX". Deberia auto-linkear estos tambien.
2. Doctrina: busqueda semantica es HEURISTICA (no usa embeddings ni LLM). El boton "Buscar semanticamente" genera una respuesta template, no una respuesta real de IA.

### ALTOS:
3. Glosario: streak de visitas es solo por dispositivo (localStorage). No tiene significado real sin cloud sync. Evaluar si vale la pena mantenerlo o reemplazarlo con algo mas util.
4. Glosario: no hay forma de bookmarkear/favoritar terminos individuales.
5. Glosario: las FormulaBlock y DiagramBlock son estaticas. No se renderizan con formato especial (solo texto plano).
6. Guias: el resultado final no tiene boton de "Descargar resultado como PDF".
7. Guias: la navegacion con swipe solo funciona para "volver atras" (derecha), no para avanzar.
8. Guias: las URLs compartidas usan base64 que es muy largo. Considerar acortar.
9. Doctrina: vista Timeline agrupa por ano pero no muestra cuantos conceptos hay por ano.
10. Doctrina: no hay filtro por articulo del ET directo (el input es free text, no autocomplete).

### MEDIOS:
11. Glosario: indice A-Z no muestra letras sin terminos como disabled. Letras vacias son clickeables y muestran "sin resultados".
12. Glosario: Term of the Day cambia cada dia pero no hay notificacion push o banner.
13. Guias: no hay indicador visual de cuantas personas han completado cada guia.
14. Guias: los nodos de pregunta no tienen ayudaRapida consistentemente. Algunos la omiten.
15. Doctrina: no hay enlace directo desde un termino del glosario a doctrina relacionada.
16. VigenciaBadge: no tiene tooltip explicando que significa cada estado.
17. RelatedResourcesRail: a veces muestra items no relevantes (match demasiado amplio).
18. No hay integracion entre glosario y chat (el asistente no sugiere terminos del glosario).

## PLAN DE ACCION

### InteractiveTaxText (PRIORIDAD MAXIMA):
1. Expandir regex para detectar: "Ley \d+ de \d{4}", "Decreto \d+", "Concepto DIAN No. \d+"
2. Para leyes: enlazar a /novedades?q=Ley+XXXX o pagina relevante
3. Para conceptos DIAN: enlazar a /doctrina?doc=XXXX
4. Para articulos: mantener enlace a /articulo/[slug]
5. Agregar tooltip preview al hover (primeras 2 lineas del contenido)

### Glosario:
6. Deshabilitar visualmente letras A-Z sin terminos (opacity-50, cursor-default)
7. Mejorar FormulaBlock: renderizar con formato matematico (subscripts, fracciones si aplica)
8. Mejorar DiagramBlock: renderizar como flowchart visual con boxes y arrows
9. Agregar boton "Guardar termino" que lo agrega a favoritos/workspace
10. Evaluar streak: si se mantiene, agregar tooltip explicativo. Si no aporta, removerlo.

### Guias:
11. Agregar PDF export del resultado final (incluir pregunta + respuestas + resultado + acciones)
12. Agregar contador de pasos en timeline lateral (step dots)
13. Asegurar que ayudaRapida esta presente en TODOS los nodos de pregunta (auditar guias-data.ts)
14. Acortar share URLs: usar hash comprimido en vez de base64 completo

### Doctrina:
15. Agregar autocomplete para filtro por articulo ET (usar articles-index)
16. Agregar conteo por ano en vista Timeline
17. Mejorar busqueda semantica: al menos agregar scoring por TF-IDF en vez de solo keyword match
18. Agregar enlace bidireccional glosario ↔ doctrina

### VigenciaBadge:
19. Agregar tooltip: "Vigente: norma en pleno vigor", "Revocado: sustituida por [ref]", "Suspendido: temporalmente sin efecto"

### Al terminar:
- Ejecuta `npm run build` — 0 errores
- Ejecuta `npm run lint` — sin warnings
- Verifica glosario: buscar "UVT", click en Term of the Day, verificar A-Z index
- Verifica guias: completar una guia completa, verificar persistencia, compartir URL
- Verifica doctrina: filtrar por "vigente" + tipo "concepto", buscar "Art. 240"
- Verifica InteractiveTaxText: abrir un articulo con texto que mencione leyes y conceptos DIAN
```

---

## PROMPT 6 de 6: Chat/Asistente IA, RAG Pipeline y Paginas de Articulos

```
Eres un ingeniero full-stack senior especializado en sistemas RAG (Retrieval-Augmented Generation) y LLM applications. Tu tarea es perfeccionar el Asistente IA con RAG, el pipeline de procesamiento de queries, y las paginas de articulos del Estatuto Tributario de SuperApp Tributaria Colombia.

## CONTEXTO DEL PROYECTO

- Framework: Next.js 16.1.6, React 19, Tailwind CSS v4
- LLM: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929) via Vercel AI SDK
- Query Enhancement: Claude Haiku 4.5 (claude-haiku-4-5-20251001)
- Embeddings: Pinecone Inference (multilingual-e5-large, 1024d)
- Vector DB: Pinecone (index: estatuto-tributario)
- RAG Config: topK=15, threshold=0.35, maxContextTokens=6000, maxRerankedResults=8
- Articulos: 1,294 articulos SSG en /articulo/[slug]

## PERMISOS

Tienes permiso para:
- Leer cualquier archivo del proyecto
- Editar archivos dentro de: src/app/asistente/, src/app/api/chat/, src/app/articulo/, src/components/chat/, src/components/article/, src/lib/rag/, src/lib/chat/, src/lib/pinecone/, src/config/constants.ts, src/contexts/article-panel-context.tsx
- Ejecutar `npm run build` y `npm run lint`
- NO instalar dependencias nuevas
- NO modificar variables de entorno
- NO tocar Pinecone directamente (solo codigo)

## ARCHIVOS A DIAGNOSTICAR

### Chat UI:
- src/app/asistente/page.tsx (wrapper con Suspense)
- src/components/chat/chat-container.tsx (337 lineas — orquestador principal)
- src/components/chat/chat-input.tsx (textarea auto-resize, Enter/Shift+Enter)
- src/components/chat/message-list.tsx (scroll automatico)
- src/components/chat/message-bubble.tsx (user/assistant, Markdown rendering)
- src/components/chat/message-actions.tsx (copy, profundizar, compartir, feedback)
- src/components/chat/source-citation.tsx (pills clickeables con article panel)
- src/components/chat/suggested-questions.tsx (preguntas contextuales por ruta)
- src/components/chat/calculator-suggestions.tsx (sugerencias de calculadoras por keyword)
- src/components/chat/conversation-sidebar.tsx (historial de conversaciones)
- src/components/chat/chat-bottom-sheet.tsx (modal mobile)
- src/components/chat/filter-chips.tsx (filtros por libro del ET)
- src/components/chat/typing-indicator.tsx (3-dot animation)

### API Route:
- src/app/api/chat/route.ts (142 lineas — rate limiting, validation, RAG, streaming)

### RAG Pipeline:
- src/lib/rag/pipeline.ts (orquestador: enhance → retrieve → rerank → assemble → build)
- src/lib/rag/query-enhancer.ts (rewrite + HyDE + decomposition via Haiku)
- src/lib/rag/retriever.ts (multi-query Pinecone search)
- src/lib/rag/reranker.ts (10 heuristic signals)
- src/lib/rag/context-assembler.ts (232 lineas — sibling retrieval + token budget)
- src/lib/rag/prompt-builder.ts (XML context formatting)

### Chat Utilities:
- src/lib/chat/system-prompt.ts (system prompt con constantes 2026 + 35 calculadoras)
- src/lib/chat/session-memory.ts (5 turnos, 200 chars truncation)
- src/lib/chat/calculator-context.ts (keyword matching para sugerencias)
- src/lib/chat/history-storage.ts (localStorage: 30 conv, 80 msgs, snapshot caching)
- src/lib/chat/contextual-questions.ts (preguntas por modulo de pagina)

### Pinecone:
- src/lib/pinecone/client.ts (singleton client)
- src/lib/pinecone/embedder.ts (multilingual-e5-large embeddings)
- src/config/constants.ts (RAG_CONFIG, PINECONE_HOST, EMBEDDING_MODEL)

### Articulos:
- src/app/articulo/[slug]/page.tsx (370 lineas — SSG, metadata, TOC, related articles)
- src/components/article/article-header.tsx (breadcrumb, titulo, estado, bookmark)
- src/components/article/article-content.tsx (HTML sanitizado con DOMPurify)
- src/components/article/article-sidebar.tsx (metadata, doctrina, enlaces)
- src/components/article/article-toc.tsx (sticky TOC con IntersectionObserver)
- src/components/article/modification-timeline.tsx (timeline visual por ano)
- src/components/article/texto-derogado.tsx (accordion de versiones historicas)
- src/components/article/normas-section.tsx (tabs: jurisprudencia, decretos, doctrina, notas)
- src/components/article/cross-references.tsx (bidireccional: referencia a / referenciado por)
- src/components/article/concordancias.tsx (concordancias + doctrina + notas editoriales)
- src/components/article/article-annotator.tsx (highlights 4 colores + notas)
- src/components/article/article-inline-diff.tsx (diff word-level entre versiones)
- src/components/article/article-assistant-button.tsx (prefill chat con articulo)
- src/components/article/article-share-actions.tsx (compartir articulo)
- src/components/article/related-articles.tsx (8 articulos relacionados por scoring)
- src/components/article/slide-out-panel.tsx (panel lateral para citations)

### Hooks y Context:
- src/hooks/useChatHistory.ts (useSyncExternalStore para conversaciones)
- src/contexts/article-panel-context.tsx (contexto para slide-out panel)

### Types:
- src/types/chat.ts
- src/types/chat-history.ts
- src/types/rag.ts
- src/types/pinecone.ts

### Rate Limiting:
- src/lib/api/rate-limiter.ts (in-memory Map, 20 req/min)
- src/lib/api/validation.ts (Zod schemas)

## DIAGNOSTICO PREVIO

### CRITICOS (RAG Pipeline):
1. Query enhancement es WATERFALL: rewrite → HyDE → decompose ejecutan en serie. Podrian ser PARALELOS con Promise.all(), ahorrando ~1-1.5s de latencia.
2. Rate limiter tiene riesgo de memory leak: Map crece sin limite bajo DDoS. Agregar max size (10,000 entries) con LRU eviction.
3. No hay cache de embeddings: queries identicas re-embeddan cada vez. Agregar LRU cache en memoria (100 entries max).

### ALTOS (RAG Pipeline):
4. Similarity threshold (0.35) es estatico. Deberia ser dinamico: si topScore > 0.75 → threshold 0.35, si topScore < 0.60 → threshold 0.25.
5. useLLMRerank esta en false. Implementar con Haiku: rankear top 8 chunks por relevancia semantica.
6. Feedback (thumbsUp/thumbsDown) se guarda en localStorage pero NO se usa para mejorar reranking.
7. Calculator suggestions usan keyword matching. No detecta intents semanticos.

### ALTOS (Chat UI):
8. No hay busqueda en historial de conversaciones. El sidebar solo muestra titulos.
9. No hay export de conversaciones (JSON o PDF).
10. Chat height en mobile (420px) es demasiado. Reducir a 360px en landing, full-height en /asistente.
11. ChatBottomSheet: tiene drag handle visual pero NO funcionalidad de drag. Implementar o remover.
12. No hay "typing indicator" con texto dinamico (ej: "Buscando en el Estatuto Tributario...", "Analizando 5 articulos...", "Redactando respuesta...")

### ALTOS (Articulos):
13. No hay boton "Exportar articulo como PDF" en la pagina de articulo.
14. No hay boton "Comparar con..." directo desde la pagina de articulo.
15. article-annotator highlights: se pierden si el HTML del articulo cambia (no hay mapping estable).
16. Modification timeline: no muestra preview del cambio al hacer hover sobre un evento.

### MEDIOS:
17. session-memory.ts trunca a 200 chars por mensaje. Puede perder contexto en queries complejas. Subir a 400 chars.
18. System prompt tiene 35 sugerencias de calculadoras hardcodeadas. Si se agrega una calculadora nueva, hay que actualizar manualmente.
19. source-citation pills: el estado dot (vigente/modificado/derogado) es muy pequeno. Agrandar o usar badge.
20. article-toc: el IntersectionObserver rootMargin es -30% top / -60% bottom. Podria no funcionar bien en pantallas muy altas o muy cortas.
21. related-articles scoring: no considera popularidad del articulo (total_referenced_by) como signal principal.
22. slide-out-panel: no tiene resize handle. Solo ancho fijo.
23. No hay "reading progress" bar en paginas de articulos largos.

## PLAN DE ACCION

### RAG Pipeline (backend):
1. PARALELIZAR query enhancement: Promise.all([rewrite, hyde, decompose])
2. IMPLEMENTAR LRU cache de embeddings (Map con max 100 entries, key=hash(text))
3. FIX rate limiter: agregar maxSize=10000 con eviction del entry mas antiguo
4. IMPLEMENTAR dynamic threshold: basado en topScore del primer query
5. IMPLEMENTAR LLM reranking con Haiku (top 8 chunks, prompt de ranking)
6. Subir session-memory truncation a 400 chars
7. Hacer calculator suggestions dinamicas: leer de calculators-catalog.ts en vez de hardcodear en system prompt

### Chat UI:
8. Agregar busqueda en conversation sidebar (filtrar por titulo y contenido)
9. Agregar export de conversacion actual (JSON + Copy all)
10. Agregar typing indicator dinamico con estados: "Buscando...", "Analizando X articulos...", "Redactando..."
11. Fix ChatBottomSheet: implementar drag-to-resize o remover drag handle
12. Ajustar chat height: 360px en landing, 100vh-header en /asistente

### Articulos:
13. Agregar boton "Exportar PDF" en article-header (usar usePrintExport)
14. Agregar boton "Comparar con..." en article-header (abre modal de seleccion → navega a /comparar?left=slug)
15. Agregar reading progress bar (sticky top, 2px height, bg-foreground)
16. Agregar tooltip en timeline events (preview del texto de la modificacion)
17. Mejorar related-articles: agregar total_referenced_by como signal de scoring (+0.15 per ref, max 1.2)

### Al terminar:
- Ejecuta `npm run build` — 0 errores
- Ejecuta `npm run lint` — sin warnings
- Verifica chat: enviar "Cual es la tarifa de renta para sociedades en 2026?" → debe citar Art. 240
- Verifica articulo Art. 240: TOC, timeline, cross-references, boton PDF, boton comparar
- Verifica que rate limiter no crece indefinidamente (revisar logica de cleanup)
- Verifica typing indicator en chat durante respuesta streaming
```

---

## NOTAS PARA EJECUCION PARALELA

### Distribucion de archivos por CLI (sin conflictos):

| CLI | Directorios exclusivos |
|-----|----------------------|
| 1 | src/components/landing/, src/components/hero/, src/app/page.tsx |
| 2 | src/app/calculadoras/, src/components/calculators/, src/config/tax-data*.ts |
| 3 | src/app/explorador/, src/app/dashboard/, src/app/comparar/, src/components/explorer/, src/components/dashboard/, src/components/comparison/ |
| 4 | src/app/calendario/, src/app/indicadores/, src/app/novedades/, src/components/calendar/, src/components/indicators/, src/components/novedades/ |
| 5 | src/app/glosario/, src/app/guias/, src/app/doctrina/, src/components/knowledge/, src/config/glosario-data.ts, src/config/guias-data.ts, src/config/doctrina-data.ts |
| 6 | src/app/asistente/, src/app/api/chat/, src/app/articulo/, src/components/chat/, src/components/article/, src/lib/rag/, src/lib/chat/ |

### Archivos compartidos (solo lectura para todos):
- src/app/globals.css
- src/app/layout.tsx
- STYLE-GUIDE.md
- CLAUDE.md
- src/components/layout/header.tsx (editado solo por CLI 1)
- src/components/layout/ReferencePageLayout.tsx (editado solo por CLI 4)
- src/components/ui/* (solo lectura)
- src/hooks/* (solo lectura excepto useChatHistory para CLI 6)
- src/types/* (solo lectura)

### Orden de ejecucion recomendado:
1. Lanzar los 6 CLIs en simultaneo
2. CLI 2 (calculadoras) es el mas largo — puede tardar mas
3. CLI 6 (RAG) requiere cuidado con cambios al pipeline — revisar resultados de busqueda despues
4. Cuando todos terminen: ejecutar `npm run build` global para verificar integracion
