import { apiGet, apiPost } from "@/lib/api-client";
import type { QuizAttempt, QuizResult } from "../types";

export async function startAttempt(data: {
  topic_id: number;
  tahap_kesukaran: string;
  nama_peserta: string;
}): Promise<QuizAttempt> {
  return apiPost<QuizAttempt>("/quiz-attempts", data);
}

export async function getAttempt(id: number): Promise<QuizAttempt> {
  return apiGet<QuizAttempt>(
    `/quiz-attempts/${id}/result?include_questions=true`
  );
}

export async function submitAnswers(
  attemptId: number,
  data: { jawapan: { question_id: number; data_jawapan: Record<string, unknown> }[] }
): Promise<QuizResult> {
  return apiPost<QuizResult>(`/quiz-attempts/${attemptId}/submit`, data);
}
