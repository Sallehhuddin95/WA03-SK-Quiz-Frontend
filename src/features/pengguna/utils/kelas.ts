import type { KelasResponse } from "../types";

export function getOwnKelasIds(
  kelasList: KelasResponse[] | undefined,
  userId: number | undefined
): Set<number> {
  const ids = new Set<number>();
  if (!kelasList || userId === undefined) return ids;
  for (const kelas of kelasList) {
    if (kelas.guru_owners.some((guru) => guru.id === userId)) {
      ids.add(kelas.id);
    }
  }
  return ids;
}

export function getSharedKelasIds(
  kelasList: KelasResponse[] | undefined,
  userId: number | undefined
): Set<number> {
  const ids = new Set<number>();
  if (!kelasList || userId === undefined) return ids;
  for (const kelas of kelasList) {
    if (kelas.shared_with.some((guru) => guru.id === userId)) {
      ids.add(kelas.id);
    }
  }
  return ids;
}

// Rows from shared-but-not-owned classes are read-only for a guru.
export function getReadOnlyKelasIds(
  ownKelasIds: ReadonlySet<number>,
  sharedKelasIds: ReadonlySet<number>
): Set<number> {
  return new Set(
    [...sharedKelasIds].filter((id) => !ownKelasIds.has(id))
  );
}
