"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, LogOut, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/useRole";

export default function MuridLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearRole } = useRole();

  function handleChangeRole() {
    clearRole();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 shadow-sm">
        <Link href="/murid" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-5 w-5 text-purple-600" />
          <span>SK Quiz</span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Link href="/murid/sejarah">
            <Button type="button" variant="ghost" size="sm" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Sejarah</span>
            </Button>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleChangeRole}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Tukar Peranan</span>
          </Button>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
