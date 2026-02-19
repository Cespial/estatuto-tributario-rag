import type { Metadata } from "next";
import { CALCULATORS_CATALOG } from "@/config/calculators-catalog";
import { CalculadorasHubClient } from "@/components/calculators/calculadoras-hub-client";

export const metadata: Metadata = {
  title: "Calculadoras Tributarias | SuperApp Tributaria Colombia",
  description:
    "Hub de calculadoras tributarias colombianas con busqueda inteligente, flujo guiado y 35 herramientas actualizadas para 2026.",
  openGraph: {
    title: "Calculadoras Tributarias Colombianas",
    description: "35 calculadoras tributarias integradas con el Estatuto Tributario de Colombia.",
    type: "website",
    locale: "es_CO",
    siteName: "SuperApp Tributaria Colombia",
  },
};

export default function CalculadorasPage() {
  return (
    <div data-calculators-count={CALCULATORS_CATALOG.length}>
      <CalculadorasHubClient />
    </div>
  );
}
