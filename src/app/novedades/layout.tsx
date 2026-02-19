import { Header } from "@/components/layout/header";

export default function NovedadesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-6">{children}</main>
    </div>
  );
}
