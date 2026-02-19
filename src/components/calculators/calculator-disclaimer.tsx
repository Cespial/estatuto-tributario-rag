interface CalculatorDisclaimerProps {
  references: string[];
  message?: string;
}

export function CalculatorDisclaimer({ references, message }: CalculatorDisclaimerProps) {
  return (
    <div className="mt-8 rounded-lg border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-foreground">
        Base normativa y advertencias
      </p>
      <p>
        {message ??
          "Este resultado es una simulacion informativa. No reemplaza la asesoria de un contador publico o abogado tributarista."}
      </p>
      {references.length > 0 && (
        <p className="mt-2 text-xs">
          Referencias: {references.join(" · ")}.
        </p>
      )}
    </div>
  );
}
