import { ReactNode } from "react";

interface PrintWrapperProps {
  title: string;
  subtitle?: string;
  reportType?: string;
  children: ReactNode;
}

export function PrintWrapper({
  title,
  subtitle,
  reportType = "Informe de referencia tributaria",
  children,
}: PrintWrapperProps) {
  return (
    <div className="print-content">
      <div className="mb-6 border-b border-border pb-4">
        <p className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          {reportType}
        </p>
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        <p className="mt-1 text-xs text-muted-foreground">
          Generado el {new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
          {" — "}SuperApp Tributaria Colombia
        </p>
      </div>
      {children}
      <div className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
        <p>Este documento es informativo y no constituye asesoría tributaria profesional.</p>
        <p>Consulte siempre con un contador público o abogado tributarista.</p>
      </div>
    </div>
  );
}
