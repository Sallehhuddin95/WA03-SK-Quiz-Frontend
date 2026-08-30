"use client";

import { useState } from "react";
import { Plus, Pencil, Share2 } from "lucide-react";
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
import { KelasFormDialog } from "./KelasFormDialog";
import { ShareKelasDialog } from "./ShareKelasDialog";
import type { KelasResponse } from "../types";

interface KelasSectionProps {
  kelasList: KelasResponse[];
  isLoading: boolean;
  isError: boolean;
  onRefetch: () => void;
  isSuperAdmin: boolean;
  ownKelasIds: ReadonlySet<number>;
}

interface KelasFormState {
  mode: "create" | "edit";
  kelas: KelasResponse | null;
}

export function KelasSection({
  kelasList,
  isLoading,
  isError,
  onRefetch,
  isSuperAdmin,
  ownKelasIds,
}: Readonly<KelasSectionProps>) {
  const [formState, setFormState] = useState<KelasFormState | null>(null);
  const [sharingKelas, setSharingKelas] = useState<KelasResponse | null>(null);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pengurusan Kelas</h2>
        {isSuperAdmin && (
          <Button
            type="button"
            variant="primary"
            onClick={() => setFormState({ mode: "create", kelas: null })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kelas
          </Button>
        )}
      </div>

      {isError ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="mb-4 text-muted-foreground">Gagal memuatkan senarai kelas.</p>
          <Button type="button" variant="outline" onClick={() => onRefetch()}>
            Cuba Semula
          </Button>
        </div>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : kelasList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Tiada kelas ditemui.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kelas</TableHead>
                <TableHead>Darjah</TableHead>
                <TableHead>Guru Pemilik</TableHead>
                <TableHead>Dikongsi Dengan</TableHead>
                <TableHead className="w-32">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kelasList.map((kelas) => {
                const canShare = isSuperAdmin || ownKelasIds.has(kelas.id);
                return (
                  <TableRow key={kelas.id}>
                    <TableCell className="font-medium">{kelas.nama}</TableCell>
                    <TableCell>Darjah {kelas.darjah}</TableCell>
                    <TableCell>
                      {kelas.guru_owners.length > 0
                        ? kelas.guru_owners
                            .map((g) => `${g.nama_first} ${g.nama_last}`)
                            .join(", ")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {kelas.shared_with.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {kelas.shared_with.map((guru) => (
                            <Badge key={guru.id} variant="secondary">
                              {guru.nama_first} {guru.nama_last}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Tiada</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {isSuperAdmin && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Sunting Kelas"
                            onClick={() =>
                              setFormState({ mode: "edit", kelas })
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canShare && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Kongsi Kelas"
                            onClick={() => setSharingKelas(kelas)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <KelasFormDialog
        open={formState !== null}
        onOpenChange={(open) => {
          if (!open) setFormState(null);
        }}
        mode={formState?.mode ?? "create"}
        kelas={formState?.kelas ?? null}
      />

      <ShareKelasDialog
        key={sharingKelas?.id ?? "none"}
        open={sharingKelas !== null}
        onOpenChange={(open) => {
          if (!open) setSharingKelas(null);
        }}
        kelas={sharingKelas}
      />
    </section>
  );
}
