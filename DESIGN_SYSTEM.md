# Design System — SuperApp Tributaria Colombia

## Filosofia de Diseno

Inspirado en Harvey.ai: premium, sobrio, editorial. La estetica comunica autoridad profesional
a traves de restriccion cromatica, tipografia serif editorial, espaciado generoso y animaciones
discretas. Cada decision de diseno debe evocar un despacho de abogados de primer nivel —
papel crema, tinta negra, luz natural.

---

## 1. Paleta de Colores — Grises Calidos

Todos los grises tienen subtono ambar/calido. Nunca grises puros (#888) ni azulados.

### Light Mode (Default)

| Token               | Hex       | Uso                                   |
|----------------------|-----------|---------------------------------------|
| `--background`       | `#fafaf9` | Fondo principal (ivory)               |
| `--foreground`       | `#0f0e0d` | Texto principal (ink)                 |
| `--card`             | `#ffffff` | Superficie de tarjetas                |
| `--card-foreground`  | `#0f0e0d` | Texto en tarjetas                     |
| `--muted`            | `#f2f1f0` | Fondo secundario gris calido          |
| `--muted-foreground` | `#706d66` | Texto secundario                      |
| `--border`           | `#e5e5e3` | Borde principal                       |
| `--border-secondary` | `#cccac6` | Borde enfatizado                      |
| `--primary`          | `#0f0e0d` | Acento principal (ink)                |
| `--primary-foreground`| `#fafaf9`| Texto sobre primary                   |
| `--accent`           | `#f2f1f0` | Superficie de acento                  |
| `--accent-foreground`| `#0f0e0d` | Texto sobre accent                    |
| `--ring`             | `#0f0e0d` | Focus ring                            |
| `--destructive`      | `#dc2626` | Error/peligro                         |
| `--success`          | `#16a34a` | Exito                                 |

### Dark Mode

| Token               | Hex       | Uso                                   |
|----------------------|-----------|---------------------------------------|
| `--background`       | `#0f0e0d` | Fondo principal (ink)                 |
| `--foreground`       | `#fafaf9` | Texto principal (ivory)               |
| `--card`             | `#1f1d1a` | Superficie de tarjetas                |
| `--card-foreground`  | `#fafaf9` | Texto en tarjetas                     |
| `--muted`            | `#1f1d1a` | Fondo secundario                      |
| `--muted-foreground` | `#8f8b85` | Texto secundario                      |
| `--border`           | `#33312c` | Borde principal                       |
| `--border-secondary` | `#524f49` | Borde enfatizado                      |
| `--primary`          | `#fafaf9` | Acento principal (ivory)              |
| `--primary-foreground`| `#0f0e0d`| Texto sobre primary                   |
| `--accent`           | `#1f1d1a` | Superficie de acento                  |
| `--accent-foreground`| `#fafaf9` | Texto sobre accent                    |
| `--ring`             | `#fafaf9` | Focus ring                            |
| `--destructive`      | `#ef4444` | Error/peligro                         |
| `--success`          | `#22c55e` | Exito                                 |

### Regla de Oro
- **Cero colores de acento saturados.** Solo escala de grises calidos.
- Ningun azul, verde ni naranja como "brand color".
- La sofisticacion viene de la restriccion.

---

## 2. Tipografia

### Fuentes

| Rol        | Fuente            | Pesos        | Uso                           |
|------------|-------------------|--------------|-------------------------------|
| Serif      | Playfair Display  | 400, 500, 700 | Headings, hero, titulos      |
| Sans-serif | Geist             | 400, 500, 600 | Body, UI, botones, labels    |
| Monospace  | Geist Mono        | 400          | Valores numericos, codigo    |

### Escala Tipografica

| Clase                | Size     | Weight | Line-height | Tracking    | Uso                        |
|----------------------|----------|--------|-------------|-------------|----------------------------|
| Hero display         | 7rem     | 400    | 1.05        | -0.0175em   | Titulo hero principal      |
| Page heading (h1)    | 2.5rem   | 700    | 1.05        | -0.02em     | Titulos de pagina          |
| Section heading (h2) | 2rem     | 600    | 1.1         | -0.02em     | Subtitulos de seccion      |
| Card heading (h3)    | 1.25rem  | 600    | 1.2         | -0.01em     | Titulos de tarjetas        |
| Body large           | 1.25rem  | 400    | 1.3         | 0           | Texto descriptivo grande   |
| Body default         | 1rem     | 400    | 1.3         | 0           | Texto general              |
| Body small           | 0.875rem | 400    | 1.3         | 0           | Texto secundario           |
| Label                | 0.75rem  | 500    | 1.3         | 0.05em      | Labels uppercase           |
| Caption              | 0.6875rem| 400    | 1.3         | 0           | Footnotes, disclaimers     |

### Reglas Tipograficas
- **Headings**: siempre serif (Playfair Display), `font-feature-settings: "liga" on`
- **Body**: siempre sans-serif (Geist)
- **Valores numericos**: siempre monospace (Geist Mono)
- **Labels**: uppercase, tracking wide (0.05em), font-medium
- **Line-height headings**: 1.05 (extremadamente apretado = impacto visual)
- **Line-height body**: 1.3 (compacto pero legible)
- **Nunca** text-wrap: balance en headings (Harvey usa `text-wrap: pretty`)

---

## 3. Espaciado

### Sistema Responsivo (crece en cada breakpoint)

| Token         | Mobile   | md (768px) | lg (1025px) | xl (1440px) |
|---------------|----------|------------|-------------|-------------|
| `--space-xs`  | 0.5rem   | 0.5rem     | 0.625rem    | 0.625rem    |
| `--space-sm`  | 1rem     | 1rem       | 1.125rem    | 1.25rem     |
| `--space-md`  | 2rem     | 2rem       | 2.25rem     | 2.5rem      |
| `--space-lg`  | 3.5rem   | 4rem       | 4.5rem      | 5rem        |
| `--space-xl`  | 7rem     | 8rem       | 9rem        | 10rem       |

### Layout

| Propiedad          | Valor                      |
|--------------------|----------------------------|
| Container max-width| `80rem` (1280px)           |
| Side margins       | `1.5rem` → `2rem` → `2.5rem` |
| Section top pad    | `5rem` (80px)              |
| Section bottom pad | `7rem` (112px) → `10rem`   |
| Grid gap           | `1.25rem` (20px)           |
| Card gap           | `1.25rem` (20px)           |
| Content max-width  | `48rem` (768px) para texto |

### Regla de Espacio
- El espacio es un lujo. Las secciones deben "respirar".
- Padding vertical de secciones minimo `py-20` (80px), ideal `py-28`-`py-32`.
- Entre un heading de seccion y su contenido: minimo `mb-16` (64px).

---

## 4. Border Radius

| Contexto           | Radius      | Tailwind      |
|--------------------|-------------|---------------|
| Botones            | `0.25rem`   | `rounded`     |
| Inputs             | `0.25rem`   | `rounded`     |
| Tarjetas           | `0.5rem`    | `rounded-lg`  |
| Badges/pills       | `9999px`    | `rounded-full`|
| Modals/panels      | `0.75rem`   | `rounded-xl`  |

### Regla de Radius
- **Minimo radius posible.** La precision se comunica con bordes rectos.
- Nunca `rounded-2xl` ni `rounded-3xl` en componentes funcionales.
- Solo pills/badges usan `rounded-full`.

---

## 5. Sombras

| Nivel    | Valor CSS                                                             | Uso              |
|----------|-----------------------------------------------------------------------|------------------|
| Ninguna  | `none`                                                                | Estado por defecto|
| Sutil    | `0 1px 2px rgba(0,0,0,0.04)`                                         | Tarjetas base    |
| Media    | `0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.04)`  | Hover state      |
| Grande   | `0 10px 25px -5px rgba(0,0,0,0.08), 0 4px 10px -6px rgba(0,0,0,0.04)` | Modals, elevated |

### Regla de Sombras
- La profundidad se comunica con **color de fondo**, no con sombras.
- Sombras solo en hover state como feedback visual.
- En dark mode, sombras mucho mas sutiles (opacity reducida).

---

## 6. Botones

### Primary Button

```
height:        48px (h-12)
padding-x:     20px (px-5)
border-radius:  4px (rounded)
font-size:     1rem (text-base)
font-weight:   500 (font-medium)
transition:    300ms ease
```

**Light bg**: `bg-foreground text-background` → hover: `bg-foreground/80`
**Dark bg**: `bg-background text-foreground` → hover: `bg-background/80`

### Secondary/Ghost Button

```
height:        48px (h-12)
padding-x:     20px (px-5)
border:        1px solid currentColor (30% opacity)
border-radius:  4px (rounded)
background:    transparent
```

Hover: `border-opacity-60`, `bg-foreground/5`

### Regla de Botones
- Sin border-radius grande. Maximo `rounded` (4px).
- Altura consistente: siempre 48px para primarios, 40px para secundarios.
- Sin iconos decorativos dentro de botones (excepto flechas direccionales).

---

## 7. Inputs de Formulario

```
height:        48px
padding-x:     1rem (px-4)
border:        1px solid var(--border)
border-radius: 4px (rounded)
font-size:     1rem
focus:         border-color: var(--foreground), ring: 2px
```

### Labels
```
font-size:     0.75rem (text-xs)
font-weight:   500 (font-medium)
text-transform: uppercase
letter-spacing: 0.05em
color:         var(--muted-foreground)
margin-bottom: 0.5rem
```

---

## 8. Tarjetas

### Card Base
```
background:    var(--card)
border:        1px solid var(--border)
border-radius: 0.5rem (rounded-lg)
padding:       1.5rem (p-6)
shadow:        none (default), shadow-sm (hover)
```

### Hover State
```
border-color:  var(--border-secondary)
shadow:        shadow-sm
transform:     translateY(-1px)
transition:    200ms ease
```

### Regla de Tarjetas
- Padding generoso: minimo `p-6`, ideal `p-8` para tarjetas prominentes.
- Borde siempre visible, sutil. No depender solo de sombra.
- Sin background gradients dentro de tarjetas.

---

## 9. Header/Navigation

```
height:        72px (h-18) — mas alto que 64px standard
position:      sticky top-0
z-index:       100
background:    bg-background/80 backdrop-blur-md (default)
               transparent (sobre hero video)
border:        border-b border-border/40
```

### Nav Items
```
font-size:     13px
font-weight:   500
text-transform: uppercase
letter-spacing: 0.05em
color:         var(--muted-foreground) → hover: var(--foreground)
active:        var(--foreground) + underline 1.5px
```

---

## 10. Animaciones y Transiciones

### Easing Curves (Custom)
```css
--ease-in:       cubic-bezier(0.7, 0, 1, 0.3)    /* agresivo, decisivo */
--ease-out:      cubic-bezier(0, 0.7, 0.3, 1)     /* desaceleracion suave */
--ease-in-out:   cubic-bezier(0.7, 0, 0.3, 1)     /* simetrico, premium */
--ease-default:  cubic-bezier(0.4, 0, 0.2, 1)     /* Material standard */
```

### Duraciones
```
Botones, hovers:     300ms
Dropdowns, toggles:  150ms
Page transitions:    500ms
Video crossfade:     1500ms
```

### Micro-interacciones
- Hover de tarjetas: `translateY(-1px)` + shadow
- Hover de links: underline-offset transition
- Nunca bounce, spring, ni overshoot
- Todas las animaciones se desactivan con `prefers-reduced-motion`

---

## 11. Hero Section

### Video Background
```
width:         100vw
height:        100vh (min 600px)
object-fit:    cover
overlay 1:     linear-gradient(to right, black/80, black/50, black/30)
overlay 2:     linear-gradient(to top, black/60, transparent, black/20)
```

### Contenido Hero
```
position:      left-aligned, vertically centered
max-width:     640px (max-w-2xl) para el heading
heading:       Playfair Display, 7rem (112px), weight 400*, line-height 1.05
subtext:       Geist, 1.25rem, white/80
CTA buttons:   48px height, sharp corners (rounded-none en hero)
```

*Nota: Harvey usa weight 400 (regular) en serif display, no bold. El impacto viene del tamano.

### Stats Bar (fondo del hero)
```
position:      absolute bottom-0
background:    black/40 backdrop-blur-sm
border-top:    white/10
text:          13px, white/60, tracking-wide
```

---

## 12. Secciones Below-the-fold

### Patron de Alternacion
Las secciones alternan fondos para crear ritmo visual:

1. **Ivory** (`bg-background`): fondo calido claro
2. **Gray** (`bg-muted/30`): fondo ligeramente mas oscuro
3. **Dark** (`bg-foreground text-background`): seccion invertida dramatica

### Estructura de Seccion Estandar
```html
<section class="px-6 py-20 md:py-28">
  <div class="mx-auto max-w-5xl">
    <h2 class="heading-serif text-center text-3xl">Titulo</h2>
    <p class="mt-4 text-center text-muted-foreground text-base max-w-xl mx-auto">
      Subtitulo descriptivo
    </p>
    <div class="mt-16">
      <!-- Contenido: grid, cards, etc. -->
    </div>
  </div>
</section>
```

---

## 13. Iconos

- Libreria: **Lucide React** (consistente, outline style)
- Tamanos estandar:
  - UI controles: `h-4 w-4`
  - Card icons: `h-5 w-5`
  - Feature icons: `h-6 w-6`
- Color: siempre `text-foreground/70` o `text-muted-foreground`
- Nunca filled icons. Siempre outline para mantener elegancia.

---

## 14. Responsividad

### Breakpoints
```
sm:  640px   (mobile landscape)
md:  768px   (tablet)
lg:  1024px  (desktop)
xl:  1280px  (large desktop)
2xl: 1536px  (ultra-wide)
```

### Patron Mobile-First
- Grid 1 col → 2 col (sm) → 3 col (lg)
- Heading sizes reducidos ~40% en mobile
- Padding lateral: `px-4` (mobile) → `px-6` (md) → `px-8` (lg)
- Hero height: `100vh` en todos los tamanos
- Navigation: horizontal scroll en mobile, visible completo en desktop

---

## 15. Anti-Patrones (Lo que NUNCA hacer)

1. **Nunca** usar colores saturados como accent
2. **Nunca** border-radius > 0.75rem en componentes funcionales
3. **Nunca** gradientes coloridos de fondo
4. **Nunca** animaciones bouncy o spring
5. **Nunca** iconos rellenos/filled
6. **Nunca** mas de 2 pesos tipograficos en una misma vista
7. **Nunca** sombras sin hover state (excepto modals)
8. **Nunca** texto centrado en secciones de mas de 3 lineas
9. **Nunca** mezclar serif y sans-serif en el mismo nivel jerarquico
10. **Nunca** usar opacity < 0.4 para texto legible
