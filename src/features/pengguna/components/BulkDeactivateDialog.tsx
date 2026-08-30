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

interface BulkDeactivateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  onConfirm: () => void;
  isPending: boolean;
}

export function BulkDeactivateDialog({
  open,
  onOpenChange,
  count,
  onConfirm,
  isPending,
}: Readonly<BulkDeactivateDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nyahaktifkan Akaun</DialogTitle>
          <DialogDescription>
            Adakah anda pasti mahu menyahaktifkan {count} akaun yang dipilih?
            Pengguna ini tidak dapat log masuk selepas ini.
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
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Nyahaktifkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
