import type { Role } from "@/types/role";

export type { Role };

export interface KelasInfo {
  id: number;
  nama: string;
  darjah: number;
}

export interface SessionUser {
  id: number;
  username: string;
  nama_first: string;
  nama_last: string;
  role: Role;
  mesti_tukar_kata_laluan: boolean;
  kelas: KelasInfo | null;
}
