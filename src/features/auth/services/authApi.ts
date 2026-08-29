import { apiGet, apiPost } from "@/lib/api-client";
import type { SessionUser } from "../types";

export async function login(
  username: string,
  kata_laluan: string
): Promise<SessionUser> {
  return apiPost<SessionUser>("/auth/login", { username, kata_laluan });
}

export async function logout(): Promise<void> {
  return apiPost<void>("/auth/logout");
}

export async function getMe(): Promise<SessionUser> {
  return apiGet<SessionUser>("/auth/me");
}

export async function changePassword(
  kata_laluan_semasa: string,
  kata_laluan_baru: string
): Promise<{ mesej: string }> {
  return apiPost<{ mesej: string }>("/auth/change-password", {
    kata_laluan_semasa,
    kata_laluan_baru,
  });
}
