const METRICS = [
  { value: "35", label: "Calculadoras Tributarias" },
  { value: "1,294", label: "Articulos del Estatuto" },
  { value: "2026", label: "Calendario Fiscal Completo" },
  { value: "24/7", label: "Asistente con IA" },
];

export function MetricsSection() {
  return (
    <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
      {METRICS.map((metric) => (
        <div key={metric.label} className="text-center">
          <div
            className="font-[family-name:var(--font-playfair)] text-5xl font-normal tracking-tight md:text-6xl lg:text-7xl"
            style={{ lineHeight: "1.05" }}
          >
            {metric.value}
          </div>
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.05em] text-muted-foreground">
            {metric.label}
          </p>
        </div>
      ))}
    </div>
  );
}
