"use client";

import { Pencil, KeyRound, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Nama Pengguna</TableHead>
            {showRoleColumn && <TableHead>Peranan</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead className="w-44">Tindakan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isReadOnly =
              user.kelas_id !== null &&
              readOnlyKelasIds !== undefined &&
              readOnlyKelasIds.has(user.kelas_id);

            return (
              <TableRow key={user.id}>
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
                  <Badge variant={user.aktif ? "default" : "destructive"}>
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
                        title="Nyahaktifkan"
                        onClick={() => onDeactivate(user)}
                      >
                        <UserX className="h-4 w-4 text-red-500" />
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
  );
}
