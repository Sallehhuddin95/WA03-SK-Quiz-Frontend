import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";
import type { Question, QuestionFilter } from "../types";
import type { Subject, Year, Topic } from "@/types/reference";

export async function getQuestionList(
  filter: QuestionFilter = {}
): Promise<PaginatedResponse<Question>> {
  return apiGet<PaginatedResponse<Question>>("/questions", {
    topic_id: filter.topic_id,
    difficulty: filter.difficulty,
    question_type: filter.question_type,
    status: filter.status,
    page: filter.page ?? 1,
    page_size: filter.page_size ?? 10,
  });
}

export async function getQuestionById(id: number): Promise<Question> {
  return apiGet<Question>(`/questions/${id}`);
}

export async function createQuestion(data: Record<string, unknown>): Promise<Question> {
  return apiPost<Question>("/questions", data);
}

export async function editQuestion(
  id: number,
  data: Record<string, unknown>
): Promise<Question> {
  return apiPut<Question>(`/questions/${id}`, data);
}

export async function deleteQuestion(id: number): Promise<{ mesej: string }> {
  return apiDelete<{ mesej: string }>(`/questions/${id}`);
}

export async function toggleQuestionStatus(
  id: number,
  status: string
): Promise<Question> {
  return apiPatch<Question>(`/questions/${id}/status`, { status });
}

export async function getSubjects(): Promise<Subject[]> {
  return apiGet<Subject[]>("/subjects");
}

export async function getYears(subjectId: number): Promise<Year[]> {
  return apiGet<Year[]>(`/subjects/${subjectId}/tahun`);
}

export async function getTopics(yearId: number): Promise<Topic[]> {
  return apiGet<Topic[]>(`/tahun/${yearId}/topics`);
}
