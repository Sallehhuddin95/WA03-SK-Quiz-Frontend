import { Skeleton } from "@/components/ui/skeleton";

export default function MuridLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header skeleton */}
      <header className="flex h-14 items-center gap-4 border-b bg-card px-4 shadow-sm">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-20" />
        <div className="flex flex-1 items-center justify-end gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </header>

      {/* Centered card skeleton */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6 text-center">
            <Skeleton className="mx-auto mb-2 h-7 w-48" />
            <Skeleton className="mx-auto h-5 w-64" />
          </div>
          <div className="space-y-4">
            <div>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>
      </main>
    </div>
  );
}
