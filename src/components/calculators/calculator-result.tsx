interface ResultItem {
  label: string;
  value: string;
  sublabel?: string;
}

interface CalculatorResultProps {
  items: ResultItem[];
}

export function CalculatorResult({ items }: CalculatorResultProps) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border/60 bg-card p-6">
          <div className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">{item.label}</div>
          <div className="mt-1 font-mono text-2xl font-bold tracking-tight">{item.value}</div>
          {item.sublabel && (
            <div className="mt-0.5 text-sm text-muted-foreground">{item.sublabel}</div>
          )}
        </div>
      ))}
    </div>
  );
}
