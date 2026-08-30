"use client";

import { useState } from "react";
import { Pencil, KeyRound, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { TableBulkBar } from "@/components/TableBulkBar";
import { useTableSelection } from "@/hooks/useTableSelection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserBulkDeactivate } from "../hooks/useUserBulkDeactivate";
import { BulkDeactivateDialog } from "./BulkDeactivateDialog";
import type { UserResponse } from "../types";

interface UserTableProps {
  users: UserResponse[];
  isLoading: boolean;
  isError: boolean;
  onRefetch: () => void;
  showRoleColumn?: boolean;
  readOnlyKelasIds?: ReadonlySet<number>;
  onEdit: (user: UserResponse) => void;
  onResetPassword: (user: UserResponse) => void;
  onDeactivate: (user: UserResponse) => void;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Pentadbir",
  admin: "Guru",
  murid: "Murid",
};

export function UserTable({
  users,
  isLoading,
  isError,
  onRefetch,
  showRoleColumn = false,
  readOnlyKelasIds,
  onEdit,
  onResetPassword,
  onDeactivate,
}: Readonly<UserTableProps>) {
  const [bulkOpen, setBulkOpen] = useState(false);

  const bulkDeactivate = useUserBulkDeactivate();

  const isUserReadOnly = (user: UserResponse) =>
    user.kelas_id !== null &&
    readOnlyKelasIds !== undefined &&
    readOnlyKelasIds.has(user.kelas_id);

  const selectableIds = users
    .filter((user) => !isUserReadOnly(user))
    .map((user) => user.id);

  const selection = useTableSelection({
    selectableIds,
    resetKey: users.map((user) => user.id).join(","),
  });

  function handleBulkDeactivate() {
    const ids = Array.from(selection.selectedIds);
    if (ids.length === 0) return;
    bulkDeactivate.mutate(ids, {
      onSuccess: () => {
        selection.clear();
        setBulkOpen(false);
      },
    });
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="mb-4 text-muted-foreground">Gagal memuatkan senarai pengguna.</p>
        <Button type="button" variant="outline" onClick={() => onRefetch()}>
          Cuba Semula
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">Tiada pengguna ditemui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selection.selectedCount > 0 && (
        <TableBulkBar
          selectedCount={selection.selectedCount}
          actions={[
            {
              id: "nyahaktifkan",
              label: "Nyahaktifkan",
              variant: "destructive",
              icon: <UserX className="h-4 w-4" />,
            },
          ]}
          onAction={() => setBulkOpen(true)}
          onClear={selection.clear}
          isPending={bulkDeactivate.isPending}
          pendingActionId={bulkDeactivate.isPending ? "nyahaktifkan" : null}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selection.allSelected}
                  indeterminate={selection.someSelected && !selection.allSelected}
                  onCheckedChange={selection.toggleAll}
                  disabled={selectableIds.length === 0 || bulkDeactivate.isPending}
                />
              </TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Nama Pengguna</TableHead>
              {showRoleColumn && <TableHead>Peranan</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead className="w-44">Tindakan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isReadOnly = isUserReadOnly(user);

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selection.selectedIds.has(user.id)}
                      onCheckedChange={() => selection.toggleId(user.id)}
                      disabled={isReadOnly || bulkDeactivate.isPending}
                      aria-label={
                        isReadOnly
                          ? `${user.username} tidak boleh dipilih`
                          : `Pilih ${user.username}`
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {user.nama_first} {user.nama_last}
                    {isReadOnly && (
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300"
                      >
                        Berkongsi (baca sahaja)
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  {showRoleColumn && (
                    <TableCell>{ROLE_LABELS[user.role] ?? user.role}</TableCell>
                  )}
                  <TableCell>
                    <Badge variant={user.aktif ? "success" : "destructive"}>
                      {user.aktif ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isReadOnly ? (
                      <span className="text-xs text-muted-foreground">
                        Tiada tindakan
                      </span>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Sunting"
                          onClick={() => onEdit(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Set Semula Kata Laluan"
                          onClick={() => onResetPassword(user)}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-red-500 hover:text-red-600"
                          title="Nyahaktifkan"
                          onClick={() => onDeactivate(user)}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <BulkDeactivateDialog
        open={bulkOpen}
        onOpenChange={(open) => {
          if (!open) setBulkOpen(false);
        }}
        count={selection.selectedCount}
        onConfirm={handleBulkDeactivate}
        isPending={bulkDeactivate.isPending}
      />
    </div>
  );
}
