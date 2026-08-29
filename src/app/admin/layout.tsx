"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Users,
  Eye,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSession, LogoutButton, StudentViewBanner } from "@/features/auth";
import { can, type Role } from "@/types/role";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const baseNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Bank Soalan",
    href: "/admin/bank-soalan",
    icon: BookOpen,
  },
  {
    label: "Prestasi Murid",
    href: "/admin/prestasi",
    icon: BarChart3,
  },
];

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Guru",
  murid: "Murid",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { user } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role;
  const navItems: NavItem[] = [
    ...baseNavItems,
    ...(role && can(role, "user:read")
      ? [{ label: "Pengguna", href: "/admin/pengguna", icon: Users }]
      : []),
    ...(role && can(role, "attempt:preview")
      ? [{ label: "Pratonton Murid", href: "/admin/pratonton", icon: Eye }]
      : []),
  ];

  const displayName = user
    ? `${user.nama_first} ${user.nama_last}`.trim()
    : "";
  const initial = displayName.charAt(0).toUpperCase() || "G";
  const roleLabel = user ? (ROLE_LABELS[user.role] ?? "Guru") : "";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <span className="font-semibold">SK Quiz Admin</span>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isNested = item.href.split("/").filter(Boolean).length > 1;
              const isActive =
                pathname === item.href ||
                (isNested && pathname.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="shrink-0 border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
              {initial}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-card-foreground">
                {displayName || "Admin"}
              </p>
              <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <ThemeToggle />
          <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
              {initial}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-card-foreground">
                {displayName || "Admin"}
              </p>
              <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
        </header>

        <StudentViewBanner />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
