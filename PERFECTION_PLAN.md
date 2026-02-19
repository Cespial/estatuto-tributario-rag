# Plan de Perfeccionamiento Profundo — Harvey.ai Parity

## Diagnostico: Brechas Criticas Identificadas

Tras auditar 70+ archivos y comparar pixel-a-pixel con Harvey.ai, estas son las brechas ordenadas por impacto visual:

### BRECHAS CRITICAS (rompen la ilusion premium)

| # | Brecha | Estado Actual | Harvey.ai | Impacto |
|---|--------|---------------|-----------|---------|
| 1 | **Colores saturados** | green-600, red-500, blue-* en 27+ archivos | Solo escala de grises | CRITICO |
| 2 | **Landing page plana** | Hero + grid + chat + 1 linea footer | Hero + sizzle + ticker + testimonios + metricas + CTA + footer multi-columna | CRITICO |
| 3 | **Sin ritmo dark/light** | Todo mismo fondo ivory | Alternancia dark → light → dark (cinematico) | CRITICO |
| 4 | **Footer minimalista** | 1 linea de texto | Grid multi-columna con 5 categorias + social | ALTO |
| 5 | **Sin marquee de logos/features** | Stats bar estatico | Marquee CSS infinito de logos/features | ALTO |
| 6 | **Heading weights inconsistentes** | font-bold (700) en 134 instancias | weight 400 para display, impacto por tamano | ALTO |
| 7 | **Body text pequeno** | 1rem (16px) mayoria | 1.25rem (20px) para body principal | MEDIO |
| 8 | **Bordes entre secciones** | border-t, border-b visibles | CERO bordes — solo cambio de color | MEDIO |
| 9 | **Filter inputs inconsistentes** | rounded-lg en calendario, novedades | rounded (4px) uniforme | MEDIO |
| 10 | **Shadow-lg excesivo** | shadow-lg en chat container | shadow-sm base, shadow en hover | BAJO |

---

## Arquitectura de Waves

### WAVE 1: Landing Page Cinematica (La Primera Impresion)
**Archivos**: 3 nuevos, 2 modificados
**Objetivo**: Transformar la landing en una experiencia cinematica tipo Harvey.ai

### WAVE 2: Purga de Color + Sistema de Estados
**Archivos**: ~40 modificados
**Objetivo**: Eliminar TODOS los colores saturados, reemplazar con escala de grises

### WAVE 3: Calculadoras + Inputs Uniformes
**Archivos**: ~38 modificados
**Objetivo**: Heading weights, body text, filter inputs, spacing consistente

### WAVE 4: Reference Pages + Dashboard + Explorer
**Archivos**: ~20 modificados
**Objetivo**: Aplicar ritmo dark/light, pulir cada pagina de referencia

### WAVE 5: Animaciones + Micro-interacciones + QA Final
**Archivos**: ~10 modificados
**Objetivo**: Scroll reveals, marquee, transiciones premium, QA pixel-perfect

---

## WAVE 1: Landing Page Cinematica

### 1.1 Reescribir `src/app/page.tsx`

La landing actual tiene 3 secciones. Harvey tiene 8+. Nueva estructura:

```
SECCION 1: HERO (dark)
  - Video background (ya existe)
  - Header transparent (ya existe)
  - Heading: "Tributaria Colombia" — Playfair 7rem, weight 400
  - Subtext: 1.25rem, white/70
  - 2 CTAs: filled ivory + ghost
  - Stats bar con numeros

SECCION 2: PRODUCT SIZZLE (ivory)
  - Heading grande serif: "La plataforma tributaria mas completa del pais."
  - Segundo fragmento en muted-foreground: "35 calculadoras, 1,294 articulos del Estatuto Tributario, calendario fiscal y asistente con IA."
  - Debajo: screenshot/mockup del chat o calculadora (imagen estatica)
  - Padding: py-32 (128px)

SECCION 3: USE CASE TICKER (ivory, continua)
  - Texto izquierda: "Los profesionales tributarios usan SuperApp para"
  - Lista vertical animada con fade: Declaracion de Renta, Retencion en la Fuente, Regimen SIMPLE, Liquidacion Laboral, Consulta del Estatuto, Calendario Fiscal, Comparacion de Regimenes
  - El item activo en negro bold, los demas en muted-foreground/30
  - CTA: "Explorar Calculadoras"
  - Padding: py-32

SECCION 4: FEATURES GRID (muted/gray bg)
  - Heading: "Herramientas Profesionales"
  - 6 cards (las actuales quick-access) con icono + titulo + descripcion
  - Cards con hover-lift, rounded-lg, border sutil
  - Padding: py-32

SECCION 5: METRICAS (ivory)
  - Grid 4 columnas de numeros grandes
  - "35" Calculadoras | "1,294" Articulos ET | "2026" Calendario Fiscal | "24/7" Asistente IA
  - Numeros en heading-serif 4rem, labels en text-sm muted
  - Padding: py-24

SECCION 6: CHAT SHOWCASE (dark — retorno dramatico)
  - Fondo: bg-foreground text-background (invertido)
  - Heading ivory serif: "Asistente Tributario con IA"
  - Subtext: "Consulte los 1,294 articulos del Estatuto Tributario"
  - ChatContainer embebido con borde sutil
  - Padding: py-32

SECCION 7: CTA FINAL (dark, continua)
  - Heading serif grande: "Domine la tributaria colombiana"
  - Boton: "Explorar Calculadoras" (ivory filled)
  - Boton secundario: "Consultar Estatuto" (ghost)
  - Padding: py-24

SECCION 8: FOOTER (dark, continua)
  - Grid 4 columnas de links
  - Col 1: Calculadoras (renta, retencion, SIMPLE, GMF, patrimonio, dividendos)
  - Col 2: Referencia (Estatuto, Calendario, Indicadores, Glosario, Tablas)
  - Col 3: Herramientas (Comparador, Novedades, Doctrina, Guias, Favoritos)
  - Col 4: Informacion (Dashboard, Acerca de, Disclaimer legal)
  - Copyright: "2026 SuperApp Tributaria Colombia. Herramienta informativa."
  - SIN border-top. Solo cambio de seccion por spacing.
```

### 1.2 Crear `src/components/landing/use-case-ticker.tsx`
- Client component con useState para item activo
- setInterval cada 3 segundos cambia item
- Lista vertical con transicion de opacity/scale
- Item activo: text-foreground font-bold text-5xl
- Items inactivos: text-muted-foreground/20 text-4xl

### 1.3 Crear `src/components/landing/metrics-section.tsx`
- 4 metricas en grid
- Numeros grandes en font-serif
- Labels pequenos uppercase

### 1.4 Crear `src/components/landing/footer.tsx`
- Footer multi-columna reutilizable
- 4 columnas de links
- Copyright y disclaimer
- Fondo dark (bg-foreground text-background)

### 1.5 Modificar `src/app/globals.css`
- Agregar clase `.section-dark` para secciones invertidas
- Agregar animacion `@keyframes fade-in-up` para scroll reveals

---

## WAVE 2: Purga de Color + Sistema de Estados

### 2.1 Definir paleta de estados en globals.css
```css
/* Status sin colores saturados — solo grises + iconos */
.status-positive { color: var(--foreground); }          /* checkmark icon */
.status-negative { color: var(--muted-foreground); }     /* x icon, line-through */
.status-warning  { color: var(--foreground); opacity: 0.7; } /* alert icon */
.status-highlight { background: var(--muted); border-left: 3px solid var(--foreground); }
```

### 2.2 Archivos a purgar (TODOS los colores saturados)

| Archivo | Colores a eliminar | Reemplazo |
|---------|-------------------|-----------|
| `calculadoras/debo-declarar/page.tsx` | green-600, green-100, red-600, red-100 | foreground + muted + iconos Check/X |
| `calculadoras/ica/page.tsx` | green-700, red-700 | foreground/70 + muted-foreground |
| `calculadoras/beneficio-auditoria/page.tsx` | green-600, green-100 | foreground + muted |
| `calculadoras/comparador/page.tsx` | green-600, red-600 | foreground + muted-foreground |
| `calculadoras/comparador-regimenes/page.tsx` | green-*, red-* | foreground + muted-foreground |
| `calculadoras/pension/page.tsx` | green-*, red-* | foreground + muted-foreground |
| `calculadoras/sanciones/page.tsx` | red-* | muted-foreground |
| `calculadoras/sanciones-ampliadas/page.tsx` | red-* | muted-foreground |
| `calculadoras/intereses-mora/page.tsx` | red-* | muted-foreground |
| `calculadoras/renta/page.tsx` | red-500 (en TableRow negative) | foreground con - prefix |
| `calculadoras/nomina-completa/page.tsx` | red-500 | foreground con - prefix |
| `calculadoras/retencion-salarios/page.tsx` | red-*, green-* | foreground + muted |
| `calculadoras/horas-extras/page.tsx` | green-*, red-* | foreground + muted |
| `calculadoras/liquidacion-laboral/page.tsx` | green-*, red-* | foreground + muted |
| `calculadoras/herencias/page.tsx` | green-*, red-* | foreground + muted |
| `calculadoras/seguridad-social/page.tsx` | green-*, red-* | foreground + muted |
| `doctrina/page.tsx` | green-700, green-400 | foreground + muted-foreground |
| `novedades/page.tsx` | Posibles colores en badges | muted palette |
| `comparison/article-diff-viewer.tsx` | green-*, red-* (diff highlights) | foreground/10 + foreground/5 con border |
| `app/error.tsx` | red-* | foreground + muted |

### 2.3 Patron de reemplazo para "positivo/negativo"

**Antes (saturado):**
```tsx
<div className="bg-green-100 text-green-700 border-green-200">Si cumple</div>
<div className="bg-red-100 text-red-700 border-red-200">No cumple</div>
```

**Despues (Harvey.ai):**
```tsx
<div className="bg-foreground text-background px-4 py-2 rounded font-medium">
  <CheckCircle className="inline h-4 w-4 mr-1.5" /> Si cumple
</div>
<div className="bg-muted text-muted-foreground px-4 py-2 rounded">
  <XCircle className="inline h-4 w-4 mr-1.5" /> No cumple
</div>
```

### 2.4 Patron para valores negativos en tablas

**Antes:**
```tsx
<td className="text-red-500">-$1,200,000</td>
```

**Despues:**
```tsx
<td className="text-muted-foreground font-mono">-$1,200,000</td>
```

### 2.5 Patron para diff viewer

**Antes:**
```tsx
<span className="bg-green-100 text-green-800">texto agregado</span>
<span className="bg-red-100 text-red-800 line-through">texto eliminado</span>
```

**Despues:**
```tsx
<span className="bg-foreground/10 underline decoration-foreground/30">texto agregado</span>
<span className="bg-muted text-muted-foreground line-through">texto eliminado</span>
```

---

## WAVE 3: Calculadoras + Inputs Uniformes

### 3.1 Heading weights en TODAS las calculadoras (36 archivos)
- Reemplazar `font-bold` por `font-semibold` en h1 de pagina
- Los h1 de calculadora deben usar Playfair weight 600 (no 700)
- Subtitulos: font-normal (400)

### 3.2 Body text size
- Descripciones principales: text-base (1rem) → text-lg (1.125rem) o text-base con leading-relaxed
- Esto aplica a las descripciones debajo de h1 en cada calculadora

### 3.3 Filter inputs en reference pages
- `calendario/page.tsx`: search input rounded-lg → rounded, select rounded-lg → rounded
- `novedades/page.tsx`: inputs rounded-lg → rounded
- `doctrina/page.tsx`: inputs rounded-lg → rounded
- `explorador/page.tsx`: search input → rounded
- `glosario/page.tsx`: search input → rounded

### 3.4 Eliminar bordes decorativos entre secciones
- Buscar `border-t` y `border-b` que actuen como separadores de seccion
- Reemplazar con spacing (margin/padding)
- Mantener borders dentro de componentes (tablas, cards)

### 3.5 Shadow cleanup
- `shadow-lg` en page.tsx chat container → `shadow-sm`
- Verificar que ningun card tenga shadow > shadow-sm en estado base

---

## WAVE 4: Reference Pages + Dashboard + Explorer

### 4.1 Layouts de referencia — ritmo visual
- ReferencePageLayout: agregar alternancia de fondo si hay multiples secciones
- Dashboard: stats cards + charts deben tener spacing generoso
- Explorer: mejorar empty state, agregar mas breathing room

### 4.2 Calendario page
- Tabla: asegurar que no tenga saturated colors en badges de estado
- Status badges: "Proximo" → bg-foreground text-background (ya correcto?)
- "Vencido" → bg-muted text-muted-foreground (verificar)

### 4.3 Guias interactivas
- Nodos de decision: asegurar rounded-lg, no rounded-xl
- Botones de opcion: rounded, h-12 consistente
- Resultado final: asegurar palette monocromatica

### 4.4 Favoritos page
- Tabs: asegurar estilo consistente
- Cards de bookmarks/notas: rounded-lg, border-border

### 4.5 Comparador de articulos
- Diff viewer: colores monocromaticos (Wave 2)
- Version selector: dropdown rounded, consistente

---

## WAVE 5: Animaciones + Micro-interacciones + QA Final

### 5.1 Scroll-triggered reveals
- Agregar clase CSS `.reveal-on-scroll` con IntersectionObserver
- Cada seccion de la landing aparece con fade-in-up al entrar al viewport
- Duracion: 600ms, easing: var(--ease-out)
- Solo en landing page (no en paginas internas — mantener instant)

### 5.2 Use Case Ticker animation
- Transicion suave entre items (opacity + translateY)
- Timing: 3 segundos por item, 500ms transicion

### 5.3 Metricas counter animation (opcional)
- Animar numeros de 0 al valor final al entrar viewport
- Duracion: 1.5 segundos
- Easing: ease-out

### 5.4 Header scroll behavior mejorado
- Detectar seccion actual (dark vs light)
- Adaptar header theme automaticamente
- Transicion suave de 300ms

### 5.5 QA Final — Checklist
- [ ] Cero instancias de green-*, red-*, blue-*, orange-*, yellow-* en componentes (excepto --destructive, --success en CSS vars)
- [ ] Cero instancias de rounded-xl o rounded-2xl
- [ ] Cero instancias de shadow-lg fuera de modals
- [ ] Cero borders entre secciones (solo dentro de componentes)
- [ ] Todos los headings serif usan weight 400-600 (nunca 700 para display)
- [ ] Todos los inputs tienen h-12 y rounded
- [ ] Todos los botones primarios tienen h-12 y rounded
- [ ] Body text minimo 1rem con leading-relaxed
- [ ] Labels: text-xs uppercase tracking-[0.05em] font-medium text-muted-foreground
- [ ] Lint: 0 errores
- [ ] Build: 0 errores
- [ ] Mobile responsive: verificar hero, nav, grids

---

## Estimacion de Ejecucion

| Wave | CLIs Paralelos | Archivos | Tiempo Estimado |
|------|---------------|----------|-----------------|
| 1    | 2 (landing + components) | 5 nuevos + 2 mod | 30-45 min |
| 2    | 3 (calc A-L + calc L-Z + reference) | ~40 mod | 45-60 min |
| 3    | 2 (calc uniformes + inputs) | ~38 mod | 30-45 min |
| 4    | 2 (reference + dashboard) | ~20 mod | 30-40 min |
| 5    | 1 (animations + QA) | ~10 mod | 20-30 min |
| **Total** | | **~115 archivos** | **~3 horas** |
