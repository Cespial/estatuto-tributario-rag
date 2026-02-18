import type { Metadata } from "next";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "Comparador de Artículos | Estatuto Tributario",
  description:
    "Herramienta de comparación multi-año para el Estatuto Tributario de Colombia. Compare versiones vigentes con textos derogados por reformas tributarias.",
};

export default function CompararLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
