import { apiGet } from "@/lib/api-client";
import type { GuruBrief } from "../types";

export async function getGurus(): Promise<GuruBrief[]> {
  return apiGet<GuruBrief[]>("/gurus");
}
