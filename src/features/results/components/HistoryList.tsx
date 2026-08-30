"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHistoryList } from "../hooks/useHistoryList";
import { useResultDetail } from "../hooks/useResultDetail";
import { AttemptCard } from "./AttemptCard";
import { ResultDetail } from "./ResultDetail";

export function HistoryList() {
  const router = useRouter();
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useHistoryList({
    page: 1,
    page_size: 50,
  });

  const { data: detail, isLoading: detailLoading } =
    useResultDetail(detailId);

  const attemptList = data?.data ?? [];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-4">
          Gagal memuatkan sejarah kuiz.
        </p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Cuba Semula
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sejarah Kuiz Saya</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : attemptList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground mb-4">
            Anda belum mempunyai sejarah kuiz.
          </p>
          <Link href="/murid">
            <Button type="button" variant="primary">Mula Kuiz Pertama</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {attemptList.map((p) => (
            <AttemptCard
              key={p.id}
              attempt={p}
              onViewDetail={() => setDetailId(p.id)}
              onContinue={
                p.status === "dalam_progres"
                  ? () => router.push(`/murid/kuiz/${p.id}`)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <ResultDetail
        open={detailId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        detail={detail ?? null}
        isLoading={detailLoading}
      />
    </div>
  );
}
