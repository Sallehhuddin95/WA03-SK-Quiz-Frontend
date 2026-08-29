"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton, useSession } from "@/features/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default function MuridLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { user } = useSession();
  const isActive = pathname === "/murid/sejarah";

  const displayName = user
    ? `${user.nama_first} ${user.nama_last}`.trim()
    : "";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background px-4 shadow-sm">
        <Link href="/murid" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-5 w-5 text-purple-600" />
          <span>SK Quiz</span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Link href="/murid/sejarah">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={
                isActive
                  ? "gap-2 bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300"
                  : "gap-2"
              }
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Sejarah</span>
            </Button>
          </Link>
          <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
            {displayName}
          </span>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
