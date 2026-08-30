"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ToggleStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  isDeactivating: boolean;
}

export function ToggleStatusDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  isDeactivating,
}: Readonly<ToggleStatusDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isDeactivating ? "Nyahaktifkan Soalan" : "Aktifkan Soalan"}
          </DialogTitle>
          <DialogDescription>
            {isDeactivating
              ? "Adakah anda pasti mahu menyahaktifkan soalan ini? Ia tidak akan muncul dalam kuiz."
              : "Adakah anda pasti mahu mengaktifkan soalan ini? Ia akan muncul dalam kuiz."}
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
            variant={isDeactivating ? "destructive" : "primary"}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeactivating ? "Nyahaktifkan" : "Aktifkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
