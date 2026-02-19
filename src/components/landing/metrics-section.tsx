"use client";

import { useState, useEffect, useRef } from "react";

const METRICS = [
  { value: 35, display: "35", label: "Calculadoras Tributarias" },
  { value: 1294, display: "1,294", label: "Articulos del Estatuto" },
  { value: 2026, display: "2026", label: "Calendario Fiscal Completo" },
  { value: 0, display: "24/7", label: "Asistente con IA" },
];

function formatNumber(n: number, target: typeof METRICS[number]): string {
  if (target.value === 0) return target.display; // "24/7" — no animation
  if (target.value === 2026) return String(Math.round(n)); // year, no commas
  if (target.value >= 1000) return Math.round(n).toLocaleString("es-CO");
  return String(Math.round(n));
}

function useCountUp(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active || target === 0) return;

    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);

  return value;
}

export function MetricsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
      {METRICS.map((metric) => (
        <MetricItem key={metric.label} metric={metric} active={visible} />
      ))}
    </div>
  );
}

function MetricItem({ metric, active }: { metric: typeof METRICS[number]; active: boolean }) {
  const count = useCountUp(metric.value, 1500, active);

  return (
    <div className="text-center">
      <div className="heading-serif text-5xl md:text-6xl lg:text-7xl">
        {metric.value === 0 ? metric.display : formatNumber(count, metric)}
      </div>
      <p className="mt-3 text-sm font-medium uppercase tracking-[0.05em] text-muted-foreground">
        {metric.label}
      </p>
    </div>
  );
}
