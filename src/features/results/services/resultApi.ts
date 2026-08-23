import { apiGet } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";
import type { AttemptSummary, AttemptDetail } from "../types";

export async function getAttemptList(params?: {
  topic_id?: number;
  difficulty?: string;
  participant_name?: string;
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<AttemptSummary>> {
  return apiGet<PaginatedResponse<AttemptSummary>>("/quiz-attempts", {
    topic_id: params?.topic_id,
    difficulty: params?.difficulty,
    participant_name: params?.participant_name,
    status: params?.status,
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 20,
  });
}

export async function getAttemptDetail(
  id: number
): Promise<AttemptDetail> {
  return apiGet<AttemptDetail>(`/quiz-attempts/${id}/result`);
}
