# STYLE-GUIDE.md — SuperApp Tributaria Colombia

Guia de estilo visual inspirada en Harvey.ai. Warm-gray premium, tipografia serif de alto contraste, y microinteracciones sutiles. Este documento sirve como referencia para mantener coherencia visual en toda la aplicacion.

---

## 1. Paleta de Colores

### Tokens CSS (definidos en `globals.css`)

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `--background` | `#fafaf9` (ivory calido) | `#0f0e0d` (negro calido) | Fondo de pagina |
| `--foreground` | `#0f0e0d` | `#fafaf9` | Texto principal |
| `--card` | `#ffffff` | `#1f1d1a` | Superficie de cards |
| `--card-foreground` | `#0f0e0d` | `#fafaf9` | Texto en cards |
| `--muted` | `#f2f1f0` | `#1f1d1a` | Fondos sutiles, badges |
| `--muted-foreground` | `#706d66` | `#8f8b85` | Texto secundario |
| `--border` | `#e5e5e3` | `#33312c` | Bordes, divisores |
| `--primary` | `#0f0e0d` | `#fafaf9` | CTAs primarios |
| `--primary-foreground` | `#fafaf9` | `#0f0e0d` | Texto sobre primary |
| `--accent` | `#f2f1f0` | `#1f1d1a` | Hover sutil |
| `--ring` | `#0f0e0d` | `#fafaf9` | Focus ring |
| `--destructive` | `#dc2626` | `#ef4444` | Errores, alertas |
| `--success` | `#16a34a` | `#22c55e` | Confirmaciones |

### Regla de Oro

**Nunca usar colores hardcodeados.** Siempre usar los tokens via Tailwind:

```
text-foreground        (texto principal)
text-muted-foreground  (texto secundario)
bg-background          (fondo de pagina)
bg-card                (superficie de card)
bg-muted               (fondo sutil)
border-border          (borde estandar)
```

### Opacidades Comunes

```
text-muted-foreground/70    (texto terciario)
border-border/40            (borde muy sutil)
border-border/60            (borde semi-sutil)
bg-muted/30                 (fondo alternado en secciones)
bg-foreground/20            (overlay backdrop)
bg-black/35                 (overlay en hero)
border-white/20             (bordes sobre fondo oscuro)
text-white/85               (texto sobre fondo oscuro)
```

---

## 2. Tipografia

### Font Stacks

| Variable | Stack | Uso |
|----------|-------|-----|
| `--font-geist-sans` | Avenir Next, Segoe UI, Helvetica Neue, system-ui | Body, UI |
| `--font-geist-mono` | SFMono-Regular, Menlo, Monaco, Consolas | Codigo |
| `--font-playfair` | Iowan Old Style, Palatino Linotype, Times New Roman, Georgia | Headings hero |

### Clase `.heading-serif`

El sello visual del proyecto. Usarla en headings principales de cada seccion/pagina:

```css
.heading-serif {
  font-family: var(--font-serif);
  font-weight: 400;           /* NO bold — elegancia Harvey */
  letter-spacing: -0.0175em;  /* Tracking negativo sutil */
  line-height: 1.05;          /* Ultra tight */
  font-feature-settings: "liga" on, "calt" on;
}
```

### Escala Tipografica

| Nivel | Clase Tailwind | Ejemplo de Uso |
|-------|---------------|----------------|
| Hero | `text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem]` | Titulo principal landing |
| H1 Pagina | `heading-serif text-3xl md:text-5xl` | Titulo de seccion |
| H2 | `heading-serif text-2xl md:text-3xl` | Sub-seccion |
| H3 Card | `text-base font-semibold` o `text-lg font-semibold` | Titulo de card |
| Body | `text-base leading-relaxed` | Parrafos |
| Description | `text-sm leading-relaxed text-muted-foreground` | Descripciones en cards |
| Label/Meta | `text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground` | Labels, badges |
| Micro | `text-[10px]` o `text-[11px]` | Chips muy pequeños |

### Pesos Tipograficos

- `font-light` (300): Solo para "SuperApp" en el logo
- `font-normal` (400): Headings serif (NUNCA bold)
- `font-medium` (500): Labels, sub-headings menores
- `font-semibold` (600): CTAs, titulos de cards, estados activos
- `font-bold` (700): Casi nunca. Evitar.

---

## 3. Espaciado

### Padding de Secciones

```
Seccion de pagina:   px-6 py-16 md:px-8 md:py-24
Sub-seccion:         px-6 py-10 md:px-8 md:py-16
Card grande:         p-6
Card mediana:        p-4 o p-5
Card compacta:       px-3 py-2 o px-4 py-3
Input/Button:        px-4 py-3 o px-6 (CTAs)
```

### Container (max-width)

```
Estandar:     mx-auto max-w-6xl        (1152px)
Estrecho:     mx-auto max-w-4xl o max-w-5xl
Texto:        max-w-2xl                (para descripciones)
Chat:         max-w-3xl o max-w-4xl
Mobile CTA:  max-w-md
```

### Gap en Grids y Flex

```
Tight:     gap-1, gap-1.5, gap-2
Medium:    gap-3, gap-4
Spacious:  gap-6, gap-8
Responsive: gap-2 sm:gap-3, gap-4 md:gap-10
```

---

## 4. Border Radius

| Elemento | Clase | Valor |
|----------|-------|-------|
| Badges/pills | `rounded-full` | 9999px |
| Botones | `rounded-md` o `rounded-lg` | 6px / 8px |
| Cards pequenas | `rounded-lg` | 8px |
| Cards grandes | `rounded-xl` o `rounded-2xl` | 12px / 16px |
| Inputs | `rounded-lg` | 8px |
| Iconos en cards | `rounded-lg` | 8px |
| Status dots | `rounded-full` | 9999px |

---

## 5. Sombras

Sombras minimalistas. Menos es mas:

| Contexto | Clase/Valor |
|----------|-------------|
| Card base | `shadow-sm` |
| Card hover | Custom: `0 4px 12px -4px rgba(0,0,0,0.06), 0 2px 6px -2px rgba(0,0,0,0.03)` |
| Card hover dark | `0 4px 12px -4px rgba(0,0,0,0.3), 0 2px 6px -2px rgba(0,0,0,0.2)` |
| Elevacion dramatica | `shadow-lg` (solo hero/chat showcase) |
| Chat showcase | `shadow-[0_20px_50px_rgba(0,0,0,0.25)]` |

---

## 6. Animaciones y Transiciones

### Transicion Global (aplicada a `*`)

```css
transition-property: color, background-color, border-color, box-shadow, opacity;
transition-duration: 150ms;
transition-timing-function: var(--ease-in-out);
```

### Curvas de Easing Personalizadas

```css
--ease-in:     cubic-bezier(0.7, 0, 1, 0.3);     /* Entrar con peso */
--ease-out:    cubic-bezier(0, 0.7, 0.3, 1);      /* Salir suave */
--ease-in-out: cubic-bezier(0.7, 0, 0.3, 1);      /* Premium feel */
```

### Hover Lift (cards interactivas)

```css
.hover-lift {
  transition: transform 300ms var(--ease-in-out), box-shadow 300ms var(--ease-in-out);
}
.hover-lift:hover {
  transform: translateY(-1px);    /* Solo 1px — sutileza Harvey */
}
```

O directamente en Tailwind: `hover:-translate-y-px`

### Scroll Reveal

```css
@keyframes reveal-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.reveal-on-scroll {
  animation: reveal-up 0.7s var(--ease-out) both;
}
```

Activada via `useScrollReveal` hook con `IntersectionObserver`.

### Reduced Motion

Siempre respetar `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## 7. Componentes Base

### Card Estandar

```tsx
<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
  {/* Icono */}
  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
    <Icon className="h-5 w-5 text-foreground/70" />
  </div>

  {/* Titulo */}
  <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>

  {/* Descripcion */}
  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
</div>
```

### Card Interactiva (con hover)

```tsx
<div className="group rounded-lg border border-transparent bg-card p-6 shadow-sm
  transition-all duration-300
  hover:border-border hover:shadow hover:-translate-y-px">
  {/* Contenido */}
  <span className="opacity-0 transition-opacity group-hover:opacity-100">
    Ver mas →
  </span>
</div>
```

### Card de Resultado (calculadoras)

```tsx
<div className="rounded-lg border border-border/60 bg-card p-6">
  <div className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
    {label}
  </div>
  <div className="mt-1.5 heading-serif text-2xl">{value}</div>
  <div className="mt-0.5 text-sm text-muted-foreground">{sublabel}</div>
</div>
```

### Boton Primario

```tsx
<button className="inline-flex h-12 items-center justify-center
  rounded-md bg-foreground px-6
  text-sm font-semibold text-background
  transition hover:bg-foreground/90
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
  {label}
</button>
```

### Boton Secundario (outline)

```tsx
<button className="inline-flex h-12 items-center justify-center
  rounded-md border border-border bg-transparent px-6
  text-sm font-medium text-foreground
  transition hover:border-foreground/30 hover:bg-muted">
  {label}
</button>
```

### Boton Texto (link)

```tsx
<button className="inline-flex items-center gap-1.5
  text-sm font-semibold text-foreground
  underline underline-offset-4 decoration-border
  transition-colors hover:decoration-foreground">
  {label}
</button>
```

### Chip/Filtro (toggle)

```tsx
<button className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
  isActive
    ? "border border-foreground bg-foreground text-background"
    : "border border-border text-muted-foreground hover:border-foreground/30"
}`}>
  {label}
</button>
```

### Badge/Pill

```tsx
<span className="rounded-full px-2 py-0.5
  text-[10px] font-medium uppercase tracking-[0.05em]
  bg-muted text-foreground border border-border">
  {label}
</span>
```

### Label Uppercase

```tsx
<span className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
  {label}
</span>
```

### Input de Formulario

```tsx
<input className="w-full rounded-lg
  border border-border/60 bg-card
  px-4 py-3 text-sm
  outline-none transition-colors
  focus:border-foreground
  focus-visible:ring-1 focus-visible:ring-foreground/20"
/>
```

---

## 8. Estructura de Secciones

### Seccion Estandar de Pagina

```tsx
<section aria-labelledby="section-id" className="bg-background px-6 py-16 md:px-8 md:py-24">
  <div className="mx-auto max-w-6xl">
    {/* Label */}
    <span className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
      Seccion
    </span>

    {/* Heading */}
    <h2 id="section-id" className="mt-3 heading-serif text-3xl md:text-5xl">
      Titulo de Seccion
    </h2>

    {/* Description */}
    <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
      Descripcion de la seccion.
    </p>

    {/* Content grid */}
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Cards */}
    </div>
  </div>
</section>
```

### Seccion con Fondo Alternado

Alternar fondos para ritmo visual:

```
Seccion 1: bg-background
Seccion 2: bg-muted/30
Seccion 3: bg-background
Seccion 4: bg-foreground (texto: text-background) — seccion oscura invertida
Seccion 5: bg-background
```

### Hero Section (fondo oscuro)

```tsx
<section className="relative min-h-[92svh] overflow-hidden bg-black">
  {/* Video/imagen de fondo */}
  <div className="absolute inset-0">...</div>

  {/* Overlay gradient */}
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />

  {/* Contenido */}
  <div className="relative z-10 mx-auto flex min-h-[92svh] w-full max-w-6xl
    items-end px-6 pb-24 pt-28">
    {/* Titulo, descripcion, CTAs */}
  </div>
</section>
```

---

## 9. Responsive Design

### Filosofia: Mobile-First

Siempre escribir estilos base para mobile, luego agregar breakpoints:

```
Base (0px+):   Estilos mobile
sm (640px+):   Tablet portrait
md (768px+):   Tablet landscape
lg (1024px+):  Desktop
xl (1280px+):  Desktop grande
```

### Patrones Comunes

```tsx
// Grids
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
grid-cols-2 md:grid-cols-3 lg:grid-cols-4

// Texto responsive
text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem]
text-xl md:text-3xl
text-sm md:text-base

// Spacing responsive
px-6 md:px-8
py-16 md:py-24
gap-2 sm:gap-3
gap-4 md:gap-10

// Layout
flex-col sm:flex-row
hidden md:flex
md:hidden

// Alturas responsive
h-[420px] sm:h-[500px] md:h-[620px]
```

---

## 10. Dark Mode

### Implementacion

- Provider: `next-themes` con `attribute="class"`
- Toggle: User-selectable (system/light/dark)
- Todos los colores usan tokens CSS que cambian con `.dark`

### Reglas

1. **Nunca hardcodear colores.** Usar siempre tokens.
2. Los tokens se invierten automaticamente: `bg-foreground` es negro en light, blanco en dark.
3. Para sombras en dark, usar valores mas oscuros (ver `.hover-lift` en `globals.css`).
4. Overlays: `bg-black/35` funciona bien en ambos modos.

---

## 11. Iconos

- **Libreria:** `lucide-react`
- **Tamano estandar:** `h-4 w-4` o `h-5 w-5`
- **Tamano grande:** `h-6 w-6`
- **Color:** `text-foreground/70` o `text-muted-foreground`
- **En cards:** Envueltos en `flex h-11 w-11 items-center justify-center rounded-lg bg-muted`
- **Decorativos:** Siempre `aria-hidden="true"`

---

## 12. Scrollbars

```css
/* Webkit */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

/* Firefox */
* { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
```

---

## 13. Focus y Accesibilidad

### Focus Visible

```css
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

En componentes custom:
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
```

### ARIA

- `aria-labelledby` en secciones (`<section aria-labelledby="id">`)
- `aria-hidden="true"` en iconos decorativos y videos de fondo
- `role="tablist"`, `role="tab"`, `role="tabpanel"` para tabs
- `.sr-only` para labels accesibles no visibles
- Contraste minimo WCAG AA

---

## 14. Clases Utilitarias Propias

| Clase | Uso |
|-------|-----|
| `.heading-serif` | Headings con Playfair Display, weight 400, tracking negativo |
| `.surface-card` | Card con bg, border 1px, radius 8px |
| `.hover-lift` | Elevacion sutil de 1px en hover |
| `.prose-chat` | Estilos Markdown para el chat |
| `.callout-info` | Caja informativa con bg muted y borde |
| `.section-dark` | Seccion con colores invertidos |
| `.reveal-on-scroll` | Animacion reveal-up al entrar en viewport |
| `.line-clamp-2` | Truncar a 2 lineas |
| `.line-clamp-6` | Truncar a 6 lineas |
| `.text-pretty` | `text-wrap: pretty` |
| `.text-balance` | `text-wrap: balance` |

---

## 15. Print Styles

```css
@media print {
  @page { margin: 1.8cm; }
  body { background: #fff; color: #000; font-size: 11pt; line-height: 1.55; }
  header, nav, .no-print { display: none !important; }
  a { color: inherit; text-decoration: none; }
}
```

---

## 16. Patrones Especiales

### Navigation Active State

```tsx
{isActive && (
  <span className="absolute inset-x-0 -bottom-[1px] h-[1.5px] rounded-full bg-foreground" />
)}
```

### Gradient Fade (overflow horizontal)

```tsx
<div className="pointer-events-none absolute right-0 top-0 h-full w-12
  bg-gradient-to-l from-background/80 to-transparent" />
```

### Status Dot

```tsx
<span className="h-2.5 w-2.5 rounded-full bg-success" />
<span className="h-2.5 w-2.5 rounded-full bg-destructive" />
```

### Sticky Mobile CTA

```tsx
<div className="fixed inset-x-0 bottom-0 z-40
  border-t border-border bg-background/95 backdrop-blur
  p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
  {/* CTA */}
</div>
```

### Chat Bubble — User

```tsx
<div className="rounded-2xl bg-foreground px-4 py-2.5 text-sm text-background">
  {message}
</div>
```

### Chat Bubble — Assistant

```tsx
<div className="rounded-2xl bg-muted px-4 py-2.5 text-sm prose-chat">
  {markdown}
</div>
```

---

## 17. Resumen de Principios

1. **Warm, not cold.** Grises calidos (`#fafaf9`, `#0f0e0d`), nunca azul-gris.
2. **Serif for impact.** `.heading-serif` solo en headings principales. Nunca en body.
3. **Weight 400 headings.** Elegancia Harvey: los headings serif son font-weight normal, no bold.
4. **Subtle motion.** Hover lift de 1px. Reveal de 20px. Crossfade de 1.5s. Nada brusco.
5. **Token-driven.** Todo color via CSS custom properties. Zero hardcoded.
6. **Mobile-first.** Siempre disenar para mobile primero, expandir con breakpoints.
7. **Less is more.** Sombras minimas, bordes finos, padding generoso.
8. **Accessibility.** Focus visible, reduced motion, ARIA, contraste AA.
9. **Dark mode nativo.** Tokens se invierten. Nunca requiere override manual.
10. **Professional tone.** Sin emojis en la UI (excepto status indicators). Sin colores brillantes. Paleta monocromatica con acentos verdes/rojos solo para estados.
