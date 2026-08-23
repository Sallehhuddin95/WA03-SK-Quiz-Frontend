"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Root error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="mx-auto max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
        <h1 className="mb-2 text-xl font-bold">Ralat Sistem</h1>
        <p className="mb-6 text-gray-500">
          Maaf, berlaku ralat semasa memuatkan halaman ini.
        </p>
        <Button type="button" onClick={() => reset()}>
          Cuba Semula
        </Button>
      </div>
    </div>
  );
}
