"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useHistoryList } from "../hooks/useHistoryList";
import { useResultDetail } from "../hooks/useResultDetail";
import { useSubjects, useYears, useTopics } from "@/hooks/useReferenceData";
import { ResultDetail } from "./ResultDetail";
import { formatDate, formatScore, formatPercentage } from "@/utils/format";

export function PerformanceTable() {
  const [page, setPage] = useState(1);
  const [topicId, setTopicId] = useState<string>("semua");
  const [difficulty, setDifficulty] = useState<string>("semua");
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data: subjects } = useSubjects();
  const subjectId = subjects?.[0]?.id ?? null;
  const { data: yearList } = useYears(subjectId);
  const yearId = yearList?.[0]?.id ?? null;
  const { data: topics } = useTopics(yearId);

  const { data, isLoading, isError, refetch } = useHistoryList({
    status: "selesai",
    topic_id: topicId !== "semua" ? Number(topicId) : undefined,
    difficulty: difficulty !== "semua" ? difficulty : undefined,
    page,
    page_size: 20,
  });

  const { data: detail, isLoading: detailLoading } =
    useResultDetail(detailId);

  const attemptList = data?.data ?? [];
  const totalPages = data?.meta?.total_pages ?? 1;
  const totalItems = data?.meta?.total_items ?? 0;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-500 mb-4">
          Gagal memuatkan prestasi.
        </p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Cuba Semula
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Prestasi Murid</h1>

      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Topik</label>
          <Select
            value={topicId === "semua" ? undefined : topicId}
            onValueChange={(v) => {
              setTopicId(v ?? "semua");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Semua Topik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Topik</SelectItem>
              {topics?.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">
            Tahap Kesukaran
          </label>
          <Select
            value={difficulty === "semua" ? undefined : difficulty}
            onValueChange={(v) => {
              setDifficulty(v ?? "semua");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Semua Tahap" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Tahap</SelectItem>
              <SelectItem value="mudah">Mudah</SelectItem>
              <SelectItem value="sederhana">Sederhana</SelectItem>
              <SelectItem value="sukar">Sukar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-16" />
            </div>
          ))}
        </div>
      ) : attemptList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {topicId !== "semua" || difficulty !== "semua" ? (
            <p className="text-gray-500">
              Tiada percubaan sepadan dengan penapis.
            </p>
          ) : (
            <p className="text-gray-500">Belum ada percubaan kuiz.</p>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Murid</TableHead>
                  <TableHead>Topik</TableHead>
                  <TableHead>Tahap</TableHead>
                  <TableHead>Skor</TableHead>
                  <TableHead>Peratus</TableHead>
                  <TableHead>Tarikh</TableHead>
                  <TableHead className="w-16">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attemptList.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.nama_peserta}
                    </TableCell>
                    <TableCell>{p.topic_nama}</TableCell>
                    <TableCell>
                      {p.tahap_kesukaran === "mudah"
                        ? "Mudah"
                        : p.tahap_kesukaran === "sederhana"
                          ? "Sederhana"
                          : "Sukar"}
                    </TableCell>
                    <TableCell>
                      {formatScore(p.skor, p.jumlah_soalan)}
                    </TableCell>
                    <TableCell>
                      {p.skor !== null
                        ? formatPercentage(p.skor, p.jumlah_soalan)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {p.masa_hantar ? formatDate(p.masa_hantar) : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setDetailId(p.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Jumlah: {totalItems} percubaan
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Halaman {page} dari {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

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
