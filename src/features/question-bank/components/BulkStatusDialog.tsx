"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BulkStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  isActivating: boolean;
  onConfirm: () => void;
  isPending: boolean;
}

export function BulkStatusDialog({
  open,
  onOpenChange,
  count,
  isActivating,
  onConfirm,
  isPending,
}: Readonly<BulkStatusDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isActivating ? "Aktifkan Soalan" : "Nyahaktifkan Soalan"}
          </DialogTitle>
          <DialogDescription>
            {isActivating
              ? `Adakah anda pasti mahu mengaktifkan ${count} soalan yang dipilih? Ia akan muncul dalam kuiz.`
              : `Adakah anda pasti mahu menyahaktifkan ${count} soalan yang dipilih? Ia tidak akan muncul dalam kuiz.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant={isActivating ? "primary" : "destructive"}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isActivating ? "Aktifkan" : "Nyahaktifkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
