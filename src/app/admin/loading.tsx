import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="flex">
      {/* Sidebar skeleton */}
      <aside className="hidden w-64 shrink-0 border-r bg-white lg:block">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-3 px-3 py-4">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <div className="mt-4 px-3">
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="px-3 py-4">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="flex-1 p-6">
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="mb-8 h-5 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
