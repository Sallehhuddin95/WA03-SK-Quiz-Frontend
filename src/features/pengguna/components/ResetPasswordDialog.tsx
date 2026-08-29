"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "../schemas/user";
import { useUserResetPassword } from "../hooks/useUserResetPassword";
import type { UserResponse } from "../types";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
}: Readonly<ResetPasswordDialogProps>) {
  const resetMutation = useUserResetPassword();

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { kata_laluan_baru: "" },
  });

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) resetForm();
  }

  function onSubmit(values: ResetPasswordValues) {
    if (!user) return;
    resetMutation.mutate(
      { id: user.id, kata_laluan_baru: values.kata_laluan_baru },
      {
        onSuccess: () => {
          resetForm();
          onOpenChange(false);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Semula Kata Laluan</DialogTitle>
          <DialogDescription>
            Tetapkan kata laluan baru untuk {user?.username ?? ""}. Pengguna
            perlu menukarnya selepas log masuk.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kata_laluan_baru">Kata Laluan Baru</Label>
            <Input
              id="kata_laluan_baru"
              type="password"
              placeholder="Sekurang-kurangnya 8 aksara"
              autoComplete="new-password"
              {...register("kata_laluan_baru")}
            />
            {errors.kata_laluan_baru && (
              <p className="text-sm text-destructive">
                {errors.kata_laluan_baru.message}
              </p>
            )}
          </div>

          {resetMutation.isError && (
            <p className="text-sm text-destructive text-center">
              {resetMutation.error?.message || "Gagal menetapkan kata laluan."}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={resetMutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={resetMutation.isPending}>
              {resetMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Set Semula
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
