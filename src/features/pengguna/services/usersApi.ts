import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";
import type { CreateUserPayload, UpdateUserPayload, UserResponse } from "../types";

export async function getUserList(params: {
  role?: string;
  carian?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<UserResponse>> {
  return apiGet<PaginatedResponse<UserResponse>>("/users", {
    role: params.role,
    carian: params.carian,
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
  });
}

export async function createUser(data: CreateUserPayload): Promise<UserResponse> {
  return apiPost<UserResponse>("/users", data);
}

export async function updateUser(
  id: number,
  data: UpdateUserPayload
): Promise<UserResponse> {
  return apiPatch<UserResponse>(`/users/${id}`, data);
}

export async function resetUserPassword(
  id: number,
  kata_laluan_baru: string
): Promise<UserResponse> {
  return apiPost<UserResponse>(`/users/${id}/reset-password`, {
    kata_laluan_baru,
  });
}

export async function deactivateUser(id: number): Promise<void> {
  return apiDelete<void>(`/users/${id}`);
}

export async function bulkDeactivateUsers(
  ids: number[]
): Promise<{ mesej: string }> {
  return apiPost<{ mesej: string }>("/users/bulk-deactivate", { ids });
}
