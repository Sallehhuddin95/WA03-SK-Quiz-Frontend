"use client";

import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "../hooks/useLogout";

export function LogoutButton() {
  const logoutMutation = useLogout();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title="Log Keluar"
      aria-label="Log Keluar"
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
    >
      {logoutMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
    </Button>
  );
}
