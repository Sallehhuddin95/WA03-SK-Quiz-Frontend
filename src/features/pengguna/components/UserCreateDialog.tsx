"use client";

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
import type { Role } from "@/types/role";
import { createUserSchema, type CreateUserValues } from "../schemas/user";
import { useUserCreate } from "../hooks/useUserCreate";
import type { KelasResponse } from "../types";

type TargetRole = Exclude<Role, "super_admin">;

interface UserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetRoles: TargetRole[];
  kelasOptions: KelasResponse[];
}

const ROLE_OPTIONS: { value: TargetRole; label: string }[] = [
  { value: "admin", label: "Guru" },
  { value: "murid", label: "Murid" },
];

export function UserCreateDialog({
  open,
  onOpenChange,
  targetRoles,
  kelasOptions,
}: Readonly<UserCreateDialogProps>) {
  const createMutation = useUserCreate();
  const defaultRole =
    targetRoles.length === 1 ? targetRoles[0] : undefined;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: defaultRole,
      nama_first: "",
      nama_last: "",
      username: "",
      kata_laluan_awal: "",
      kelas_id: "",
    },
  });

  const selectedRole = watch("role") ?? defaultRole;
  const isMurid = selectedRole === "murid";

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  }

  function onSubmit(values: CreateUserValues) {
    createMutation.mutate(
      {
        nama_first: values.nama_first.trim(),
        nama_last: values.nama_last.trim(),
        username: values.username.trim(),
        role: values.role,
        kata_laluan_awal: values.kata_laluan_awal,
        kelas_id: isMurid ? (values.kelas_id ? Number(values.kelas_id) : null) : null,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Pengguna</DialogTitle>
          <DialogDescription>
            Masukkan maklumat akaun baru. Pengguna perlu menukar kata laluan
            selepas log masuk pertama.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {targetRoles.length > 1 && (
            <div className="space-y-2">
              <Label>Peranan</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih peranan" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nama_first">Nama Pertama</Label>
            <Input
              id="nama_first"
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
            <Label htmlFor="nama_last">Nama Akhir</Label>
            <Input
              id="nama_last"
              placeholder="Nama akhir"
              {...register("nama_last")}
            />
            {errors.nama_last && (
              <p className="text-sm text-destructive">
                {errors.nama_last.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nama Pengguna</Label>
            <Input
              id="username"
              placeholder="Nama pengguna"
              autoComplete="off"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kata_laluan_awal">Kata Laluan Awal</Label>
            <Input
              id="kata_laluan_awal"
              type="password"
              placeholder="Sekurang-kurangnya 8 aksara"
              autoComplete="new-password"
              {...register("kata_laluan_awal")}
            />
            {errors.kata_laluan_awal && (
              <p className="text-sm text-destructive">
                {errors.kata_laluan_awal.message}
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

          {createMutation.isError && (
            <p className="text-sm text-destructive text-center">
              {createMutation.error?.message || "Gagal mencipta pengguna."}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
