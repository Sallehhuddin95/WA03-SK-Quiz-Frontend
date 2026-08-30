"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TableBulkBar } from "@/components/TableBulkBar";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useQuestionList } from "../hooks/useQuestionList";
import { useQuestionStatusToggle } from "../hooks/useQuestionStatusToggle";
import { useQuestionDelete } from "../hooks/useQuestionDelete";
import { useQuestionBulkDelete } from "../hooks/useQuestionBulkDelete";
import { useQuestionBulkStatusToggle } from "../hooks/useQuestionBulkStatusToggle";
import { useTopics } from "../hooks/useReferenceData";
import { useSubjects, useYears } from "../hooks/useReferenceData";
import { DeleteDialog } from "./DeleteDialog";
import { ToggleStatusDialog } from "./ToggleStatusDialog";
import { BulkDeleteDialog } from "./BulkDeleteDialog";
import { BulkStatusDialog } from "./BulkStatusDialog";
import { formatTopicLabel, formatTypeLabel, DIFFICULTY_LABELS, topicLabel, difficultyLabel } from "@/utils/format";
import type { QuestionFilter, QuestionType, Difficulty } from "../types";

type BulkAction = "delete" | "aktif" | "tidak_aktif" | null;

export function QuestionTable() {
  const [page, setPage] = useState(1);
  const [topicId, setTopicId] = useState<string>("semua");
  const [difficulty, setDifficulty] = useState<string>("semua");
  const [questionType, setQuestionType] = useState<string>("semua");
  const [statusFilter, setStatusFilter] = useState<string>("semua");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toggleTarget, setToggleTarget] = useState<{
    id: number;
    status: string;
  } | null>(null);
  const [bulkAction, setBulkAction] = useState<BulkAction>(null);

  const { data: subjects } = useSubjects();
  const subjectId = subjects?.[0]?.id ?? null;
  const { data: yearList } = useYears(subjectId);
  const yearId = yearList?.[0]?.id ?? null;
  const { data: topics } = useTopics(yearId);

  const filter: QuestionFilter = {
    page,
    page_size: 10,
    topic_id: topicId !== "semua" ? Number(topicId) : undefined,
    difficulty: difficulty !== "semua" ? (difficulty as Difficulty) : undefined,
    question_type:
      questionType !== "semua" ? (questionType as QuestionType) : undefined,
    status: statusFilter !== "semua" ? (statusFilter as "aktif" | "tidak_aktif") : undefined,
  };

  const { data, isLoading, isError, refetch } = useQuestionList(filter);
  const statusToggle = useQuestionStatusToggle();
  const deleteMutation = useQuestionDelete();
  const bulkDelete = useQuestionBulkDelete();
  const bulkStatus = useQuestionBulkStatusToggle();

  const questionList = data?.data ?? [];
  const totalPages = data?.meta?.total_pages ?? 1;
  const totalItems = data?.meta?.total_items ?? 0;

  const resetKey = `${page}-${topicId}-${difficulty}-${questionType}-${statusFilter}`;
  const selection = useTableSelection({
    selectableIds: questionList.map((question) => question.id),
    resetKey,
  });
  const isBulkPending = bulkDelete.isPending || bulkStatus.isPending;
  const pendingActionId = bulkDelete.isPending
    ? "delete"
    : bulkStatus.isPending
      ? bulkAction === "aktif"
        ? "aktif"
        : bulkAction === "tidak_aktif"
          ? "tidak_aktif"
          : null
      : null;

  const resetPage = useCallback(() => setPage(1), []);

  function handleToggleConfirm() {
    if (toggleTarget !== null) {
      const newStatus =
        toggleTarget.status === "aktif" ? "tidak_aktif" : "aktif";
      statusToggle.mutate(
        { id: toggleTarget.id, status: newStatus },
        {
          onSettled: () => setToggleTarget(null),
        }
      );
    }
  }

  function handleDelete() {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => {
          setDeleteId(null);
          if (questionList.length === 1 && page > 1) {
            setPage((p) => p - 1);
          }
        },
      });
    }
  }

  function handleBulkDelete() {
    const ids = Array.from(selection.selectedIds);
    if (ids.length === 0) return;
    bulkDelete.mutate(ids, {
      onSuccess: () => {
        selection.clear();
        setBulkAction(null);
        if (questionList.length <= ids.length && page > 1) {
          setPage((p) => p - 1);
        }
      },
    });
  }

  function handleBulkStatus(status: "aktif" | "tidak_aktif") {
    const ids = Array.from(selection.selectedIds);
    if (ids.length === 0) return;
    bulkStatus.mutate(
      { ids, status },
      {
        onSuccess: () => {
          selection.clear();
          setBulkAction(null);
        },
      }
    );
  }

  function handleBulkAction(actionId: string) {
    if (actionId === "delete") {
      setBulkAction("delete");
    } else if (actionId === "aktif") {
      setBulkAction("aktif");
    } else if (actionId === "tidak_aktif") {
      setBulkAction("tidak_aktif");
    }
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-4">
          Gagal memuatkan senarai soalan.
        </p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Cuba Semula
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bank Soalan</h1>
        <Link href="/admin/bank-soalan/baru">
          <Button type="button" variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Soalan
          </Button>
        </Link>
      </div>

      {/* Filter row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Topik</label>
          <Select
            value={topicId === "semua" ? undefined : topicId}
            onValueChange={(v) => {
              setTopicId(v ?? "semua");
              resetPage();
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Topik">
                {(value: string | null) => topicLabel(value, topics, "Semua Topik")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Topik</SelectItem>
              {topics?.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {formatTopicLabel(t.id, t.nama)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Tahap Kesukaran
          </label>
          <Select
            value={difficulty === "semua" ? undefined : difficulty}
            onValueChange={(v) => {
              setDifficulty(v ?? "semua");
              resetPage();
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Tahap">
                {(value: string | null) => difficultyLabel(value, "Semua Tahap")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Tahap</SelectItem>
              <SelectItem value="mudah">Mudah</SelectItem>
              <SelectItem value="sederhana">Sederhana</SelectItem>
              <SelectItem value="sukar">Sukar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Jenis Soalan
          </label>
          <Select
            value={questionType === "semua" ? undefined : questionType}
            onValueChange={(v) => {
              setQuestionType(v ?? "semua");
              resetPage();
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Jenis">
                {(value: string | null) => (value ? formatTypeLabel(value) : "Semua Jenis")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Jenis</SelectItem>
              <SelectItem value="aneka_pilihan">Aneka Pilihan</SelectItem>
              <SelectItem value="isi_tempat_kosong">
                Isi Tempat Kosong
              </SelectItem>
              <SelectItem value="betul_salah">Betul/Salah</SelectItem>
              <SelectItem value="padanan">Padanan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select
            value={statusFilter === "semua" ? undefined : statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v ?? "semua");
              resetPage();
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Status">
                {(value: string | null) =>
                  value === "aktif"
                    ? "Aktif"
                    : value === "tidak_aktif"
                      ? "Tidak Aktif"
                      : "Semua Status"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Status</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table or loading/empty states */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-24" />
            </div>
          ))}
        </div>
      ) : questionList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {topicId !== "semua" ||
          difficulty !== "semua" ||
          questionType !== "semua" ||
          statusFilter !== "semua" ? (
            <>
              <p className="text-muted-foreground mb-4">
                Tiada soalan sepadan dengan penapis. Cuba tukar penapis.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">Tiada soalan ditemui.</p>
              <Link href="/admin/bank-soalan/baru">
                <Button type="button" variant="primary">
                  Tambah Soalan Pertama
                </Button>
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          {selection.selectedCount > 0 && (
            <TableBulkBar
              selectedCount={selection.selectedCount}
              actions={[
                {
                  id: "delete",
                  label: "Padam",
                  variant: "destructive",
                  icon: <Trash2 className="h-4 w-4" />,
                },
                {
                  id: "aktif",
                  label: "Aktifkan",
                  variant: "primary",
                  icon: <CheckCircle2 className="h-4 w-4" />,
                },
                {
                  id: "tidak_aktif",
                  label: "Nyahaktifkan",
                  variant: "destructive",
                  icon: <UserX className="h-4 w-4" />,
                },
              ]}
              onAction={handleBulkAction}
              onClear={selection.clear}
              isPending={isBulkPending}
              pendingActionId={pendingActionId}
            />
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selection.allSelected}
                      indeterminate={selection.someSelected && !selection.allSelected}
                      onCheckedChange={selection.toggleAll}
                      disabled={questionList.length === 0 || isBulkPending}
                    />
                  </TableHead>
                  <TableHead>Teks Soalan</TableHead>
                  <TableHead>Topik</TableHead>
                  <TableHead>Tahap</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionList.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      <Checkbox
                        checked={selection.selectedIds.has(question.id)}
                        onCheckedChange={() => selection.toggleId(question.id)}
                        disabled={isBulkPending}
                      />
                    </TableCell>
                    <TableCell className="max-w-md">
                      <span className="line-clamp-2">
                        {question.teks_soalan}
                      </span>
                    </TableCell>
                    <TableCell>{question.topic_nama}</TableCell>
                    <TableCell>
                      {DIFFICULTY_LABELS[question.tahap_kesukaran]}
                    </TableCell>
                    <TableCell>
                      {formatTypeLabel(question.jenis_soalan)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          question.status === "aktif" ? "success" : "destructive"
                        }
                      >
                        {question.status === "aktif" ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/admin/bank-soalan/${question.id}/edit`}>
                          <Button type="button" variant="ghost" size="icon" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-green-600 hover:text-green-700"
                          title={
                            question.status === "aktif"
                              ? "Nyahaktifkan"
                              : "Aktifkan"
                          }
                          onClick={() =>
                            setToggleTarget({
                              id: question.id,
                              status: question.status,
                            })
                          }
                          disabled={statusToggle.isPending}
                        >
                          {statusToggle.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Padam"
                          onClick={() => setDeleteId(question.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Jumlah: {totalItems} soalan
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

      {/* Delete dialog */}
      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />

      {/* Status toggle dialog */}
      <ToggleStatusDialog
        open={toggleTarget !== null}
        onOpenChange={(open) => {
          if (!open) setToggleTarget(null);
        }}
        onConfirm={handleToggleConfirm}
        isPending={statusToggle.isPending}
        isDeactivating={toggleTarget?.status === "aktif"}
      />

      {/* Bulk delete dialog */}
      <BulkDeleteDialog
        open={bulkAction === "delete"}
        onOpenChange={(open) => {
          if (!open) setBulkAction(null);
        }}
        count={selection.selectedCount}
        onConfirm={handleBulkDelete}
        isPending={bulkDelete.isPending}
      />

      {/* Bulk status dialog */}
      <BulkStatusDialog
        open={bulkAction === "aktif" || bulkAction === "tidak_aktif"}
        onOpenChange={(open) => {
          if (!open) setBulkAction(null);
        }}
        count={selection.selectedCount}
        isActivating={bulkAction === "aktif"}
        onConfirm={() => handleBulkStatus(bulkAction === "aktif" ? "aktif" : "tidak_aktif")}
        isPending={bulkStatus.isPending}
      />
    </div>
  );
}
