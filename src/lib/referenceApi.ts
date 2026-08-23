import { apiGet } from "@/lib/api-client";
import type { Subject, Year, Topic } from "@/types/reference";

export async function getSubjects(): Promise<Subject[]> {
  return apiGet<Subject[]>("/subjects");
}

export async function getYears(subjectId: number): Promise<Year[]> {
  return apiGet<Year[]>(`/subjects/${subjectId}/tahun`);
}

export async function getTopics(yearId: number): Promise<Topic[]> {
  return apiGet<Topic[]>(`/tahun/${yearId}/topics`);
}
