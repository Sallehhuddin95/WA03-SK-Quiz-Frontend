"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGurus } from "../hooks/useGurus";
import { useKelasShare } from "../hooks/useKelasShare";
import type { KelasResponse } from "../types";

interface ShareKelasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kelas: KelasResponse | null;
}

export function ShareKelasDialog({
  open,
  onOpenChange,
  kelas,
}: Readonly<ShareKelasDialogProps>) {
  const { data: gurus, isLoading: gurusLoading, isError } = useGurus();
  const shareMutation = useKelasShare();

  const ownerIds = new Set(kelas?.guru_owners.map((g) => g.id) ?? []);

  // Parent keys this dialog by kelas id so state resets per kelas.
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(kelas?.shared_with.map((g) => g.id) ?? [])
  );

  const candidateGurus = (gurus ?? []).filter(
    (guru) => !ownerIds.has(guru.id)
  );

  function handleToggle(guruId: number, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(guruId);
      } else {
        next.delete(guruId);
      }
      return next;
    });
  }

  function handleSave() {
    if (!kelas) return;
    shareMutation.mutate(
      { id: kelas.id, guru_ids: [...selectedIds] },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kongsi Kelas</DialogTitle>
          <DialogDescription>
            Pilih guru yang boleh melihat kelas ini secara baca sahaja.
            {kelas ? ` Kelas: Darjah ${kelas.darjah} - ${kelas.nama}.` : ""}
          </DialogDescription>
        </DialogHeader>

        {gurusLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">
            Gagal memuatkan senarai guru.
          </p>
        ) : candidateGurus.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tiada guru lain untuk dikongsi.
          </p>
        ) : (
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {candidateGurus.map((guru) => (
              <div
                key={guru.id}
                className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
              >
                <Checkbox
                  id={`guru-${guru.id}`}
                  checked={selectedIds.has(guru.id)}
                  onCheckedChange={(checked) =>
                    handleToggle(guru.id, checked === true)
                  }
                />
                <Label htmlFor={`guru-${guru.id}`} className="cursor-pointer">
                  {guru.nama_first} {guru.nama_last}
                </Label>
              </div>
            ))}
          </div>
        )}

        {shareMutation.isError && (
          <p className="text-sm text-destructive text-center">
            {shareMutation.error?.message || "Gagal mengemas kini perkongsian."}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={shareMutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={shareMutation.isPending || gurusLoading}
          >
            {shareMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
