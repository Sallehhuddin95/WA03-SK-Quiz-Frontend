"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { kelasFormSchema, type KelasFormValues } from "../schemas/kelas";
import { useKelasCreate } from "../hooks/useKelasCreate";
import { useKelasUpdate } from "../hooks/useKelasUpdate";
import type { KelasResponse } from "../types";

interface KelasFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  kelas?: KelasResponse | null;
}

const DARJAH_OPTIONS = ["1", "2", "3", "4", "5", "6"];

export function KelasFormDialog({
  open,
  onOpenChange,
  mode,
  kelas,
}: Readonly<KelasFormDialogProps>) {
  const createMutation = useKelasCreate();
  const updateMutation = useKelasUpdate();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<KelasFormValues>({
    resolver: zodResolver(kelasFormSchema),
    defaultValues: { nama: "", darjah: "" },
  });

  useEffect(() => {
    if (kelas) {
      reset({
        nama: kelas.nama,
        darjah: String(kelas.darjah),
      });
    }
  }, [kelas, reset]);

  const mutation = mode === "edit" ? updateMutation : createMutation;
  const isPending = mutation.isPending;

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  }

  function onSubmit(values: KelasFormValues) {
    const darjah = Number(values.darjah);
    const payload = { nama: values.nama.trim(), darjah };

    if (mode === "edit" && kelas) {
      updateMutation.mutate(
        { id: kelas.id, data: payload },
        {
          onSuccess: () => {
            reset();
            onOpenChange(false);
          },
        }
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Sunting Kelas" : "Tambah Kelas"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Kemas kini nama atau darjah kelas."
              : "Cipta kelas baru."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kelas_nama">Nama Kelas</Label>
            <Input
              id="kelas_nama"
              placeholder="Contoh: Cemerlang"
              {...register("nama")}
            />
            {errors.nama && (
              <p className="text-sm text-destructive">{errors.nama.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Darjah</Label>
            <Controller
              control={control}
              name="darjah"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih darjah">
                      {(value: string | null) =>
                        value ? `Darjah ${value}` : "Pilih darjah"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {DARJAH_OPTIONS.map((darjah) => (
                      <SelectItem key={darjah} value={darjah}>
                        Darjah {darjah}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.darjah && (
              <p className="text-sm text-destructive">{errors.darjah.message}</p>
            )}
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive text-center">
              {mutation.error?.message || "Gagal menyimpan kelas."}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
