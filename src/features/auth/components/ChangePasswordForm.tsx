"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Role } from "@/types/role";
import { changePasswordSchema, type ChangePasswordValues } from "../schemas/auth";
import { useChangePassword } from "../hooks/useChangePassword";
import { useSession } from "../hooks/useSession";

interface ChangePasswordFormProps {
  role?: Role;
}

function getRoleHome(role: Role): string {
  return role === "murid" ? "/murid" : "/admin";
}

export function ChangePasswordForm({ role }: ChangePasswordFormProps) {
  const router = useRouter();
  const { user } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const changePasswordMutation = useChangePassword();

  function onSubmit(values: ChangePasswordValues) {
    changePasswordMutation.mutate(values, {
      onSuccess: () => {
        const targetRole = role ?? user?.role ?? "murid";
        router.push(getRoleHome(targetRole));
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="kata_laluan_semasa">Kata Laluan Semasa</Label>
        <Input
          id="kata_laluan_semasa"
          type="password"
          placeholder="Masukkan kata laluan semasa"
          autoComplete="current-password"
          {...register("kata_laluan_semasa")}
        />
        {errors.kata_laluan_semasa && (
          <p className="text-sm text-destructive">
            {errors.kata_laluan_semasa.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="kata_laluan_baru">Kata Laluan Baru</Label>
        <Input
          id="kata_laluan_baru"
          type="password"
          placeholder="Masukkan kata laluan baru"
          autoComplete="new-password"
          {...register("kata_laluan_baru")}
        />
        {errors.kata_laluan_baru && (
          <p className="text-sm text-destructive">
            {errors.kata_laluan_baru.message}
          </p>
        )}
      </div>

      {changePasswordMutation.isError && (
        <p className="text-sm text-destructive text-center">
          {changePasswordMutation.error?.message ||
            "Gagal menukar kata laluan. Sila cuba lagi."}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={changePasswordMutation.isPending}
      >
        {changePasswordMutation.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Tukar Kata Laluan
      </Button>
    </form>
  );
}
