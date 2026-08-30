"use client";

import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsers } from "../hooks/useUsers";
import { useUserDeactivate } from "../hooks/useUserDeactivate";
import { getReadOnlyKelasIds } from "../utils/kelas";
import { UserTable } from "./UserTable";
import { UserCreateDialog } from "./UserCreateDialog";
import { UserEditDialog } from "./UserEditDialog";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import { DeactivateDialog } from "./DeactivateDialog";
import type { KelasResponse, UserResponse } from "../types";

const PAGE_SIZE = 50;

interface MuridSectionProps {
  isSuperAdmin: boolean;
  ownKelasIds: ReadonlySet<number>;
  sharedKelasIds: ReadonlySet<number>;
  kelasList: KelasResponse[];
}

export function MuridSection({
  isSuperAdmin,
  ownKelasIds,
  sharedKelasIds,
  kelasList,
}: Readonly<MuridSectionProps>) {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [resetUser, setResetUser] = useState<UserResponse | null>(null);
  const [deactivatingUser, setDeactivatingUser] =
    useState<UserResponse | null>(null);

  const { data, isLoading, isError, refetch } = useUsers({
    role: "murid",
    page,
    page_size: PAGE_SIZE,
  });

  const deactivateMutation = useUserDeactivate();

  // Gurus may only create murid in classes they own.
  const kelasOptions = isSuperAdmin
    ? kelasList
    : kelasList.filter((kelas) => ownKelasIds.has(kelas.id));

  const readOnlyKelasIds = isSuperAdmin
    ? undefined
    : getReadOnlyKelasIds(ownKelasIds, sharedKelasIds);

  const muridList = data?.data ?? [];
  const totalPages = data?.meta?.total_pages ?? 1;
  const totalItems = data?.meta?.total_items ?? 0;

  function handleDeactivate() {
    if (!deactivatingUser) return;
    deactivateMutation.mutate(deactivatingUser.id, {
      onSuccess: () => setDeactivatingUser(null),
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pengurusan Murid</h2>
        <Button type="button" variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Murid
        </Button>
      </div>

      <UserTable
        users={muridList}
        isLoading={isLoading}
        isError={isError}
        onRefetch={refetch}
        readOnlyKelasIds={readOnlyKelasIds}
        onEdit={(user) => setEditingUser(user)}
        onResetPassword={(user) => setResetUser(user)}
        onDeactivate={(user) => setDeactivatingUser(user)}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Jumlah: {totalItems} murid
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Halaman {page} dari {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <UserCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        targetRoles={["murid"]}
        kelasOptions={kelasOptions}
      />
      <UserEditDialog
        open={editingUser !== null}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
        user={editingUser}
        kelasOptions={kelasOptions}
      />
      <ResetPasswordDialog
        open={resetUser !== null}
        onOpenChange={(open) => {
          if (!open) setResetUser(null);
        }}
        user={resetUser}
      />
      <DeactivateDialog
        open={deactivatingUser !== null}
        onOpenChange={(open) => {
          if (!open) setDeactivatingUser(null);
        }}
        user={deactivatingUser}
        onConfirm={handleDeactivate}
        isPending={deactivateMutation.isPending}
      />
    </section>
  );
}
