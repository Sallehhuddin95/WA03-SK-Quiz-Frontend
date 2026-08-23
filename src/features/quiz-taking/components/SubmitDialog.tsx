"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface SubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answeredCount: number;
  totalQuestions: number;
  onSubmit: () => void;
  isPending: boolean;
}

export function SubmitDialog({
  open,
  onOpenChange,
  answeredCount,
  totalQuestions,
  onSubmit,
  isPending,
}: Readonly<SubmitDialogProps>) {
  const [step, setStep] = useState<"warning" | "confirm">("warning");
  const unanswered = totalQuestions - answeredCount;

  function handleOpen(open: boolean) {
    if (!open) {
      setStep("warning");
    }
    onOpenChange(open);
  }

  if (unanswered > 0 && step === "warning") {
    return (
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <DialogTitle>Soalan Belum Dijawab</DialogTitle>
            </div>
            <DialogDescription>
              Anda belum menjawab {unanswered} soalan. Hantar juga?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpen(false)}>
              Kembali
            </Button>
            <Button type="button" onClick={() => setStep("confirm")}>
              Hantar Juga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hantar Jawapan</DialogTitle>
          <DialogDescription>
            Adakah anda pasti mahu menghantar jawapan? Tindakan ini tidak boleh
            dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpen(false)}>
            Batal
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isPending}>
            Ya, Hantar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
