"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type BulkButtonVariant =
  | "default"
  | "primary"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive"
  | "link";

export interface TableBulkAction {
  id: string;
  label: string;
  variant?: BulkButtonVariant;
  icon?: ReactNode;
}

interface TableBulkBarProps {
  selectedCount: number;
  actions: TableBulkAction[];
  onAction: (actionId: string) => void;
  onClear: () => void;
  isPending?: boolean;
  pendingActionId?: string | null;
}

export function TableBulkBar({
  selectedCount,
  actions,
  onAction,
  onClear,
  isPending = false,
  pendingActionId = null,
}: Readonly<TableBulkBarProps>) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{selectedCount}</span>{" "}
        dipilih
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => {
          const isThisPending = isPending && pendingActionId === action.id;
          return (
            <Button
              key={action.id}
              type="button"
              variant={action.variant ?? "destructive"}
              size="sm"
              disabled={isPending}
              onClick={() => onAction(action.id)}
            >
              {isThisPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                action.icon
              )}
              {action.label}
            </Button>
          );
        })}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={onClear}
        >
          Batal
        </Button>
      </div>
    </div>
  );
}
