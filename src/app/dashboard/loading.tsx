import { Header } from "@/components/layout/header";

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-border p-4">
      <div className="mb-2 h-4 w-20 rounded bg-muted" />
      <div className="h-8 w-16 rounded bg-muted" />
      <div className="mt-2 h-3 w-24 rounded bg-muted" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="animate-pulse rounded-lg border border-border p-4">
      <div className="mb-4 h-5 w-40 rounded bg-muted" />
      <div className="h-64 rounded bg-muted" />
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="animate-pulse rounded-lg border border-border p-4">
      <div className="mb-4 h-5 w-48 rounded bg-muted" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-4 flex-1 rounded bg-muted" />
            <div className="h-4 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="mb-6 h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="space-y-6">
          {/* Stats cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <SkeletonChart />
            <SkeletonChart />
          </div>
          {/* Tables */}
          <div className="grid gap-6 lg:grid-cols-2">
            <SkeletonTable />
            <SkeletonTable />
          </div>
        </div>
      </main>
    </div>
  );
}
