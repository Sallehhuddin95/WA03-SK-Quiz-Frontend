"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth";
import { useKelas } from "../hooks/useKelas";
import { getOwnKelasIds, getSharedKelasIds } from "../utils/kelas";
import { GuruSection } from "./GuruSection";
import { MuridSection } from "./MuridSection";
import { KelasSection } from "./KelasSection";

export function PenggunaManagement() {
  const { user, isLoading: sessionLoading } = useSession();
  const {
    data: kelasList,
    isLoading: kelasLoading,
    isError: kelasError,
    refetch: kelasRefetch,
  } = useKelas();

  if (sessionLoading || !user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const isSuperAdmin = user.role === "super_admin";
  const ownKelasIds = getOwnKelasIds(kelasList, user.id);
  const sharedKelasIds = getSharedKelasIds(kelasList, user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Pengurusan Pengguna
        </h1>
        <p className="text-muted-foreground">
          Urus guru, murid dan perkongsian kelas.
        </p>
      </div>

      {isSuperAdmin && <GuruSection />}

      <KelasSection
        kelasList={kelasList ?? []}
        isLoading={kelasLoading}
        isError={kelasError}
        onRefetch={kelasRefetch}
        isSuperAdmin={isSuperAdmin}
        ownKelasIds={ownKelasIds}
      />

      <MuridSection
        isSuperAdmin={isSuperAdmin}
        ownKelasIds={ownKelasIds}
        sharedKelasIds={sharedKelasIds}
        kelasList={kelasList ?? []}
      />
    </div>
  );
}
