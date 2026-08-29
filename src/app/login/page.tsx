"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  LoginForm,
  ChangePasswordForm,
  useSession,
} from "@/features/auth";
import type { SessionUser } from "@/features/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useSession();
  const [pendingUser, setPendingUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    if (user.mesti_tukar_kata_laluan) return;
    router.replace(user.role === "murid" ? "/murid" : "/admin");
  }, [user, isLoading, router]);

  const showChangePassword =
    pendingUser !== null || user?.mesti_tukar_kata_laluan === true;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <GraduationCap className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            SK Quiz
          </h1>
          <p className="text-muted-foreground">Matematik Tahun 6</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {showChangePassword ? (
              <ChangePasswordForm
                role={pendingUser?.role ?? user?.role}
              />
            ) : (
              <LoginForm onNeedPasswordChange={setPendingUser} />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
