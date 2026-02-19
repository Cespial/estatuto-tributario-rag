"use client";
import { useState, useEffect } from "react";

const USE_CASES = [
  "Declaracion de Renta",
  "Retencion en la Fuente",
  "Regimen SIMPLE",
  "Liquidacion Laboral",
  "Consulta del Estatuto",
  "Calendario Fiscal",
  "Comparacion de Regimenes",
];

export function UseCaseTicker() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % USE_CASES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 md:gap-3">
      {USE_CASES.map((useCase, i) => (
        <span
          key={useCase}
          className={`font-[family-name:var(--font-playfair)] text-3xl md:text-5xl lg:text-6xl transition-all duration-500 ${
            i === activeIndex
              ? "text-foreground font-medium scale-100 opacity-100"
              : "text-foreground/15 font-normal scale-95 opacity-100"
          }`}
          style={{ lineHeight: "1.15" }}
        >
          {useCase}
        </span>
      ))}
    </div>
  );
}
