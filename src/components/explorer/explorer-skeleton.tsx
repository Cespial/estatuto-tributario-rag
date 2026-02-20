import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col rounded-lg border border-border/60 bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="mb-2 h-5 w-full" />
          <Skeleton className="mb-3 h-3 w-2/3" />
          <div className="mb-3 flex gap-1.5">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
          </div>
          <div className="mt-auto flex items-center gap-3">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="ml-auto h-3 w-8" />
          </div>
          <Skeleton className="mt-2 h-1 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/60 bg-muted/50">
              <th className="px-4 py-2"><Skeleton className="h-3 w-12" /></th>
              <th className="px-2 py-2"><Skeleton className="h-3 w-40" /></th>
              <th className="px-2 py-2"><Skeleton className="h-3 w-20" /></th>
              <th className="px-2 py-2"><Skeleton className="h-3 w-10" /></th>
              <th className="px-2 py-2"><Skeleton className="h-3 w-10" /></th>
              <th className="px-2 py-2"><Skeleton className="h-3 w-16" /></th>
              <th className="px-2 py-2 text-right"><Skeleton className="ml-auto h-3 w-12" /></th>
              <th className="px-4 py-2 text-right"><Skeleton className="ml-auto h-3 w-16" /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 15 }).map((_, i) => (
              <tr key={i} className="border-b border-border/40">
                <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                <td className="px-2 py-3">
                  <Skeleton className="mb-1 h-4 w-full max-w-[300px]" />
                  <div className="flex gap-1">
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="h-3 w-16 rounded-full" />
                  </div>
                </td>
                <td className="px-2 py-3"><Skeleton className="h-4 w-24" /></td>
                <td className="px-2 py-3"><Skeleton className="h-4 w-6 ml-auto" /></td>
                <td className="px-2 py-3"><Skeleton className="h-4 w-6 ml-auto" /></td>
                <td className="px-2 py-3"><Skeleton className="h-4 w-6 ml-auto" /></td>
                <td className="px-2 py-3 text-right"><Skeleton className="h-4 w-10 ml-auto" /></td>
                <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
