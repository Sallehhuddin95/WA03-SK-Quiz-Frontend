"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHistoryList } from "../hooks/useHistoryList";
import { useResultDetail } from "../hooks/useResultDetail";
import { AttemptCard } from "./AttemptCard";
import { ResultDetail } from "./ResultDetail";
import { useDebounce } from "@/hooks/useDebounce";

const NAME_STORAGE_KEY = "sk_quiz_nama_murid";

export function HistoryList() {
  const router = useRouter();
  const [searchName, setSearchName] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);

  const debouncedSearchName = useDebounce(searchName, 500);

  useEffect(() => {
    const saved = localStorage.getItem(NAME_STORAGE_KEY);
    if (saved) setSearchName(saved);
  }, []);

  const { data, isLoading, isError, refetch } = useHistoryList({
    participant_name: debouncedSearchName || undefined,
    page: 1,
    page_size: 50,
  });

  const { data: detail, isLoading: detailLoading } =
    useResultDetail(detailId);

  const attemptList = data?.data ?? [];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-500 mb-4">
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Cari nama murid..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : attemptList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {searchName ? (
            <p className="text-gray-500 mb-4">
              Tiada sejarah untuk nama &apos;{searchName}&apos;. Cuba nama lain
              atau mula kuiz baru.
            </p>
          ) : (
            <>
              <p className="text-gray-500 mb-4">
                Anda belum mempunyai sejarah kuiz.
              </p>
              <Link href="/murid">
                <Button type="button">Mula Kuiz Pertama</Button>
              </Link>
            </>
          )}
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
