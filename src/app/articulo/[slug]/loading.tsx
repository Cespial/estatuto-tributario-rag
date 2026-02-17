import { Header } from "@/components/layout/header";

export default function ArticleLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-4">
            {/* Breadcrumb skeleton */}
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            {/* Title skeleton */}
            <div className="h-8 w-96 animate-pulse rounded bg-muted" />
            <div className="h-4 w-64 animate-pulse rounded bg-muted" />
            {/* Content skeleton */}
            <div className="mt-6 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="w-full shrink-0 lg:w-72">
            <div className="h-48 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </main>
    </div>
  );
}
