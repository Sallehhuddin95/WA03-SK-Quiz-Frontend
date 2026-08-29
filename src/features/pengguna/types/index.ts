import type { Role } from "@/types/role";

export type { Role };

export interface GuruBrief {
  id: number;
  nama_first: string;
  nama_last: string;
}

export interface UserResponse {
  id: number;
  username: string;
  nama_first: string;
  nama_last: string;
  role: Role;
  aktif: boolean;
  mesti_tukar_kata_laluan: boolean;
  kelas_id: number | null;
  created_at: string;
}

export interface KelasResponse {
  id: number;
  nama: string;
  darjah: number;
  guru_owners: GuruBrief[];
  shared_with: GuruBrief[];
  created_at: string;
}

export interface CreateUserPayload {
  nama_first: string;
  nama_last: string;
  username: string;
  role: Role;
  kata_laluan_awal: string;
  kelas_id: number | null;
}

export interface UpdateUserPayload {
  nama_first?: string;
  nama_last?: string;
  aktif?: boolean;
  kelas_id?: number | null;
}

export interface CreateKelasPayload {
  nama: string;
  darjah: number;
}

export interface UpdateKelasPayload {
  nama?: string;
  darjah?: number;
}

export interface PreviewQuestion {
  id: number;
  jenis_soalan: string;
  teks_soalan: string;
  pilihan: Record<string, string> | null;
}
