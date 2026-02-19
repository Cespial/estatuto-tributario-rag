# Plan de Perfeccionamiento V2 — Revision Profunda Post-5-Waves

## Diagnostico: Brechas Restantes Identificadas

Tras auditar exhaustivamente 70+ archivos post-5-waves, estas son las brechas organizadas por impacto:

### BRECHAS CRITICAS

| # | Brecha | Estado Actual | Harvey.ai Target | Impacto |
|---|--------|---------------|------------------|---------|
| 1 | **heading-serif class no usada** | 6+ headings usan inline `font-[family-name:var(--font-playfair)]` perdiendo letter-spacing, font-features | `heading-serif` class aplica weight 400, tracking -0.0175em, ligaduras | CRITICO |
| 2 | **Scroll reveal no implementado** | CSS keyframe existe pero NO hay IntersectionObserver | Secciones aparecen con fade-in-up al scroll | CRITICO |
| 3 | **Chat showcase dark section rota** | `text-foreground` dentro de `bg-foreground` = texto invisible | `text-background` para invertir correctamente | CRITICO |
| 4 | **Description text demasiado pequeno** | `text-sm` y `text-base` en descripciones | `text-lg` minimo para descripciones bajo h1 | ALTO |
| 5 | **tracking-wide en CTAs** | 5 botones CTA usan `tracking-wide` | Sin tracking extra o `tracking-[0.05em]` en labels | ALTO |
| 6 | **Header no reacciona al scroll** | Solo 2 estados estaticos via prop | Detectar seccion actual (dark/light) y adaptar | ALTO |
| 7 | **Info/warning boxes inconsistentes** | Mezcla de text-xs y text-sm, estilos variados | Pattern unico para callouts/info boxes | MEDIO |
| 8 | **Calendario/Explorador inputs raw** | HTML inputs sin h-12, sin shared components | Inputs consistentes h-12 rounded | MEDIO |
| 9 | **ReferencePageLayout description text-sm** | Afecta 8+ paginas que usan este layout | `text-base` o `text-lg` con leading-relaxed | MEDIO |
| 10 | **MetricsSection sin counter animation** | Numeros estaticos | Animar de 0 al valor al entrar viewport | BAJO |

---

## Arquitectura de Waves

### WAVE 1: Fixes Criticos + heading-serif + Scroll Reveal
**Archivos**: ~12 modificados, 1 nuevo
**Objetivo**: Corregir bugs visuales criticos, implementar heading-serif uniformemente, activar scroll-reveal

### WAVE 2: Text Sizing + Info Boxes + Inputs Uniformes
**Archivos**: ~25 modificados
**Objetivo**: Descriptions text-lg, info boxes estandarizados, inputs consistentes

### WAVE 3: Animaciones Premium + Header Scroll-Aware
**Archivos**: ~5 modificados, 1 nuevo
**Objetivo**: Counter animation, header scroll detection, transiciones finales

### WAVE 4: QA Final Exhaustivo
**Archivos**: verificacion de ~70 archivos
**Objetivo**: Cero inconsistencias restantes, build limpio, audit completo

---

## WAVE 1: Fixes Criticos + heading-serif + Scroll Reveal

### 1.1 Crear hook `src/hooks/useScrollReveal.ts`
```typescript
"use client";
import { useEffect, useRef } from "react";

export function useScrollReveal() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Start hidden
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("reveal-on-scroll");
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
```

### 1.2 Fix chat showcase dark section (page.tsx:241-244)
**Bug**: `text-foreground` inside `bg-foreground` = invisible text
**Fix**: Change `bg-card` → `bg-background` for chat container inside dark section, and fix inner header color

**Antes (linea 241-243)**:
```tsx
<div className="flex h-[650px] flex-col overflow-hidden rounded-lg border border-background/10 bg-card shadow-sm">
  <div className="border-b border-border bg-muted/30 px-5 py-4">
    <h3 className="font-medium text-foreground">Asistente con IA</h3>
```

**Despues**:
```tsx
<div className="flex h-[600px] flex-col overflow-hidden rounded-lg border border-background/10 bg-background shadow-sm md:h-[650px]">
  <div className="border-b border-border/40 bg-muted/30 px-5 py-4">
    <h3 className="font-medium text-foreground">Asistente con IA</h3>
```

### 1.3 Reemplazar inline Playfair con heading-serif (6 ubicaciones)

**page.tsx** — 4 headings:
- Linea 73 (Hero h1): Mantener inline por tamano custom (7rem), PERO agregar font-feature-settings
- Linea 133 (Sizzle h2): `heading-serif text-3xl md:text-5xl lg:text-6xl` + inline lineHeight
- Linea 174 (Features h2): `heading-serif text-3xl`
- Linea 233 (Chat h2): `heading-serif text-3xl text-background`
- Linea 256 (CTA h2): `heading-serif text-4xl md:text-5xl lg:text-6xl text-background`

**use-case-ticker.tsx** — Linea 29:
- `heading-serif text-3xl md:text-5xl lg:text-6xl`

**metrics-section.tsx** — Linea 14:
- `heading-serif text-5xl md:text-6xl lg:text-7xl`

### 1.4 Eliminar tracking-wide de CTAs (page.tsx)
- Lineas 90, 96, 268, 274: Cambiar `tracking-wide` → eliminar (sin tracking)
- Linea 107: `tracking-wide` en stats bar → `tracking-[0.05em]`

### 1.5 Aplicar scroll reveal a secciones de landing (page.tsx)
- Convertir page.tsx a client component (necesario para useScrollReveal)
- O: Usar CSS-only approach con animation-delay staggered
- **Decision**: CSS-only es mas limpio — agregar `reveal-on-scroll` class con delays

### 1.6 Actualizar globals.css para scroll reveal mejorado
```css
.reveal-on-scroll {
  animation: reveal-up 0.6s var(--ease-out) both;
}

/* Staggered delays para secciones */
section:nth-child(2) .reveal-content { animation-delay: 0s; }
section:nth-child(3) .reveal-content { animation-delay: 0.1s; }
section:nth-child(4) .reveal-content { animation-delay: 0.15s; }
```

---

## WAVE 2: Text Sizing + Info Boxes + Inputs

### 2.1 Description text sizing — text-sm → text-base/text-lg

**ReferencePageLayout.tsx** (linea 40):
```
text-sm → text-base leading-relaxed
```
Esto afecta: calendario, novedades, doctrina, glosario, explorador, favoritos, dashboard, guias, comparar

**page.tsx**:
- Linea 177 (features desc): `text-base` → `text-lg`
- Linea 196 (card descriptions): mantener `text-sm` (cards son compactas)
- Linea 236 (chat desc): `text-base` → `text-lg`
- Linea 261 (CTA desc): `text-base` → `text-lg`

**Calculadoras** — descriptions debajo de h1:
- Cada calculadora que tenga `text-muted-foreground` sin size → agregar `text-base leading-relaxed`

### 2.2 Info/Warning box pattern estandarizado

Crear clase CSS en globals.css:
```css
.callout-info {
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  font-size: 0.875rem; /* text-sm consistente */
  line-height: 1.5;
}

.callout-info strong {
  font-weight: 600;
}
```

Aplicar a ~15 info boxes en calculadoras que actualmente mezclan text-xs y text-sm.

### 2.3 Calendario inputs → h-12 + rounded

**calendario/page.tsx** — inputs de busqueda y selects:
- Agregar `h-12` a search input y selects
- Cambiar styling a pattern consistente

### 2.4 Explorador view toggle buttons

**explorador/page.tsx** — lineas 181-201:
- Toggle buttons: `rounded-md px-3 py-1.5` → `rounded px-4 h-10` (secondary buttons)

---

## WAVE 3: Animaciones Premium + Header Scroll-Aware

### 3.1 useScrollReveal hook (alternativa client-component)

Crear `src/hooks/useScrollReveal.ts` con IntersectionObserver.

Crear wrapper component `src/components/ui/reveal.tsx`:
```tsx
"use client";
export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
```

### 3.2 Header scroll-aware behavior

**header.tsx** — Agregar deteccion de scroll:
```typescript
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  if (variant !== "transparent") return;
  const handleScroll = () => {
    setScrolled(window.scrollY > window.innerHeight * 0.8);
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, [variant]);
```

Cuando `scrolled = true` en variant transparent:
- Transicionar a fondo opaco con backdrop-blur
- Texto cambia de white → foreground
- Border aparece

### 3.3 MetricsSection counter animation

Usar IntersectionObserver para animar numeros de 0 al valor.
Duracion: 1.5s, easing: ease-out.
Solo se activa una vez al entrar viewport.

### 3.4 Use Case Ticker refinamiento

- Eliminar `font-medium` de item activo (mantener font-normal = weight 400)
- Agregar `cursor-default` para indicar no-interactivo
- Suavizar transicion con translateY ademas de opacity/scale

---

## WAVE 4: QA Final Exhaustivo

### Checklist de Verificacion

- [ ] 0 instancias de inline `font-[family-name:var(--font-playfair)]` (excepto hero h1 con size custom)
- [ ] 0 instancias de `tracking-wide` en botones CTA
- [ ] 0 instancias de `text-foreground` dentro de secciones `bg-foreground` (dark inversion)
- [ ] Todas las descriptions bajo h1 son `text-base` o `text-lg`
- [ ] Todos los info boxes usan `.callout-info` o pattern consistente
- [ ] Todos los inputs de referencia tienen `h-12`
- [ ] Scroll reveal funcional en landing page
- [ ] Header transiciona al scroll en landing
- [ ] Build: 0 errores
- [ ] Lint: 0 errores
- [ ] Dark mode: verificar todas las secciones dark
- [ ] Mobile: hero, nav, grids responsivos

---

## Estimacion

| Wave | Archivos | Descripcion |
|------|----------|-------------|
| 1 | ~12 mod + 1 nuevo | Fixes criticos + heading-serif + scroll reveal CSS |
| 2 | ~25 mod | Text sizing + info boxes + inputs |
| 3 | ~5 mod + 2 nuevos | Animaciones + header scroll + counter |
| 4 | Verificacion | QA exhaustivo |
| **Total** | **~45 archivos** | |
