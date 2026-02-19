interface ResultItem {
  label: string;
  value: string;
  sublabel?: string;
  helper?: string;
  tone?: "neutral" | "success" | "warning";
}

interface CalculatorResultProps {
  items: ResultItem[];
}

export function CalculatorResult({ items }: CalculatorResultProps) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-lg border border-border/60 bg-card p-6 ${item.tone === "warning" ? "bg-muted/30" : item.tone === "success" ? "bg-muted/20" : ""}`}
        >
          <div className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">{item.label}</div>
          <div className="mt-1.5 heading-serif text-2xl">{item.value}</div>
          {item.sublabel && (
            <div className="mt-0.5 text-sm text-muted-foreground">{item.sublabel}</div>
          )}
          {item.helper && (
            <div className="mt-1 text-xs text-muted-foreground">{item.helper}</div>
          )}
        </div>
      ))}
    </div>
  );
}
