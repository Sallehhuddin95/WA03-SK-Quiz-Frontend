"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentView } from "../hooks/useStudentView";

export function StudentViewBanner() {
  const aktif = useStudentView((state) => state.aktif);
  const keluar = useStudentView((state) => state.keluar);

  if (!aktif) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-purple-200 bg-purple-50 px-4 py-2 text-sm text-purple-800">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span className="font-medium">Mod Pratonton Murid</span>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={keluar}>
        Keluar Mod Pratonton
      </Button>
    </div>
  );
}
