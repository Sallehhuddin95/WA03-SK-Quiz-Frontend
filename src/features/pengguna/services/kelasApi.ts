import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/api-client";
import type {
  CreateKelasPayload,
  KelasResponse,
  UpdateKelasPayload,
} from "../types";

export async function getKelasList(): Promise<KelasResponse[]> {
  return apiGet<KelasResponse[]>("/kelas");
}

export async function createKelas(data: CreateKelasPayload): Promise<KelasResponse> {
  return apiPost<KelasResponse>("/kelas", data);
}

export async function updateKelas(
  id: number,
  data: UpdateKelasPayload
): Promise<KelasResponse> {
  return apiPatch<KelasResponse>(`/kelas/${id}`, data);
}

export async function shareKelas(
  id: number,
  guru_ids: number[]
): Promise<KelasResponse> {
  return apiPut<KelasResponse>(`/kelas/${id}/share`, { guru_ids });
}
