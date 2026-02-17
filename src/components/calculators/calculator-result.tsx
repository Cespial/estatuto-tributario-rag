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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">{item.label}</div>
          <div className="mt-1 text-2xl font-bold">{item.value}</div>
          {item.sublabel && (
            <div className="mt-0.5 text-sm text-muted-foreground">{item.sublabel}</div>
          )}
        </div>
      ))}
    </div>
  );
}
