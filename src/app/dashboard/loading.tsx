import { Header } from "@/components/layout/header";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-16">
        <div className="mb-2 h-9 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="mb-10 h-5 w-96 animate-pulse rounded-lg bg-muted" />
        <DashboardSkeleton />
      </main>
    </div>
  );
}
