"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiClientError } from "@/lib/api-client";
import { loginSchema, type LoginValues } from "../schemas/auth";
import { useLogin } from "../hooks/useLogin";
import { ChangePasswordForm } from "./ChangePasswordForm";
import type { SessionUser } from "../types";

interface LoginFormProps {
  onNeedPasswordChange?: (user: SessionUser) => void;
}

function getRoleHome(role: SessionUser["role"]): string {
  return role === "murid" ? "/murid" : "/admin";
}

function getLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.kod === "KELAYAKAN_TIDAK_SAH") {
      return "Nama pengguna atau kata laluan tidak sah.";
    }
    if (error.kod === "AKAUN_TIDAK_AKTIF") {
      return "Akaun anda tidak aktif. Sila hubungi guru atau pentadbir.";
    }
    return error.message;
  }
  return error instanceof Error
    ? error.message
    : "Gagal log masuk. Sila cuba lagi.";
}

export function LoginForm({ onNeedPasswordChange }: LoginFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLogin();
  const [loggedInUser, setLoggedInUser] = useState<SessionUser | null>(null);

  function handleNeedPasswordChange(user: SessionUser) {
    if (onNeedPasswordChange) {
      onNeedPasswordChange(user);
      return;
    }
    setLoggedInUser(user);
  }

  function onSubmit(values: LoginValues) {
    loginMutation.mutate(values, {
      onSuccess: (user) => {
        if (user.mesti_tukar_kata_laluan) {
          handleNeedPasswordChange(user);
          return;
        }
        router.push(getRoleHome(user.role));
      },
    });
  }

  if (loggedInUser?.mesti_tukar_kata_laluan) {
    return <ChangePasswordForm role={loggedInUser.role} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Nama Pengguna</Label>
        <Input
          id="username"
          placeholder="Masukkan nama pengguna"
          autoComplete="username"
          {...register("username")}
        />
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="kata_laluan">Kata Laluan</Label>
        <Input
          id="kata_laluan"
          type="password"
          placeholder="Masukkan kata laluan"
          autoComplete="current-password"
          {...register("kata_laluan")}
        />
        {errors.kata_laluan && (
          <p className="text-sm text-destructive">
            {errors.kata_laluan.message}
          </p>
        )}
      </div>

      {loginMutation.isError && (
        <p className="text-sm text-destructive text-center">
          {getLoginErrorMessage(loginMutation.error)}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Log Masuk
      </Button>
    </form>
  );
}
