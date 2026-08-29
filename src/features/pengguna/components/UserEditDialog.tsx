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
import { editUserSchema, type EditUserValues } from "../schemas/user";
import { useUserUpdate } from "../hooks/useUserUpdate";
import type { KelasResponse, UserResponse } from "../types";

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
  kelasOptions: KelasResponse[];
}

export function UserEditDialog({
  open,
  onOpenChange,
  user,
  kelasOptions,
}: Readonly<UserEditDialogProps>) {
  const updateMutation = useUserUpdate();
  const isMurid = user?.role === "murid";

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      nama_first: "",
      nama_last: "",
      kelas_id: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        nama_first: user.nama_first,
        nama_last: user.nama_last,
        kelas_id: user.kelas_id ? String(user.kelas_id) : "",
      });
    }
  }, [user, reset]);

  function onSubmit(values: EditUserValues) {
    if (!user) return;

    const data = {
      nama_first: values.nama_first.trim(),
      nama_last: values.nama_last.trim(),
      kelas_id: isMurid
        ? values.kelas_id
          ? Number(values.kelas_id)
          : null
        : undefined,
    };

    updateMutation.mutate(
      { id: user.id, data },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sunting Pengguna</DialogTitle>
          <DialogDescription>
            Kemas kini maklumat akaun {user?.username ?? ""}.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_nama_first">Nama Pertama</Label>
              <Input
                id="edit_nama_first"
                placeholder="Nama pertama"
                {...register("nama_first")}
              />
              {errors.nama_first && (
                <p className="text-sm text-destructive">
                  {errors.nama_first.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_nama_last">Nama Akhir</Label>
              <Input
                id="edit_nama_last"
                placeholder="Nama akhir"
                {...register("nama_last")}
              />
              {errors.nama_last && (
                <p className="text-sm text-destructive">
                  {errors.nama_last.message}
                </p>
              )}
            </div>

            {isMurid && (
              <div className="space-y-2">
                <Label>Kelas</Label>
                <Controller
                  control={control}
                  name="kelas_id"
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        {kelasOptions.map((kelas) => (
                          <SelectItem
                            key={kelas.id}
                            value={kelas.id.toString()}
                          >
                            Darjah {kelas.darjah} - {kelas.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.kelas_id && (
                  <p className="text-sm text-destructive">
                    {errors.kelas_id.message}
                  </p>
                )}
              </div>
            )}

            {updateMutation.isError && (
              <p className="text-sm text-destructive text-center">
                {updateMutation.error?.message ||
                  "Gagal mengemas kini pengguna."}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
