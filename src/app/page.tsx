"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRole } from "@/hooks/useRole";
import type { Role } from "@/types/role";

export default function LandingPage() {
  const router = useRouter();
  const { role, setRole, hasRole } = useRole();
  // RoleProvider returns null until hydrated, so hasRole is final on first render.
  const [showRoleConfirm, setShowRoleConfirm] = useState(hasRole);

  function handleSelectRole(newRole: Role) {
    setRole(newRole);
    router.push(newRole === "admin" ? "/admin" : "/murid");
  }

  function handleContinue() {
    if (role === "admin") {
      router.push("/admin");
    } else if (role === "murid") {
      router.push("/murid");
    }
  }

  function handleChangeRole() {
    setRole(null);
    setShowRoleConfirm(false);
  }

  const roleLabel =
    role === "admin" ? "Guru" : role === "murid" ? "Murid" : "";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="mx-auto max-w-lg w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            SK Quiz
          </h1>
          <p className="text-lg text-gray-600">Matematik Tahun 6</p>
        </div>

        {showRoleConfirm ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Anda telah memilih sebagai {roleLabel}.
              </CardTitle>
              <CardDescription>
                Adakah anda mahu tukar peranan?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={handleContinue}
              >
                Teruskan
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="w-full"
                onClick={handleChangeRole}
              >
                Tukar Peranan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  size="lg"
                  variant="default"
                  className="w-full"
                  onClick={() => handleSelectRole("admin")}
                >
                  Saya Guru
                </Button>
                <p className="mt-2 text-sm text-gray-500">
                  Urus bank soalan dan lihat prestasi murid
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleSelectRole("murid")}
                >
                  Saya Murid
                </Button>
                <p className="mt-2 text-sm text-gray-500">
                  Jawab kuiz Matematik Tahun 6
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
