import { Header } from "@/components/layout/header";

export default function CalculadorasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-16">{children}</main>
    </div>
  );
}
