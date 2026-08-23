import { useQuery } from "@tanstack/react-query";
import { getSubjects, getYears, getTopics } from "@/lib/referenceApi";

export function useSubjects() {
  return useQuery({
    queryKey: ["reference", "subjects"],
    queryFn: getSubjects,
    staleTime: Infinity,
  });
}

export function useYears(subjectId: number | null) {
  return useQuery({
    queryKey: ["reference", "years", subjectId],
    queryFn: () => getYears(subjectId!),
    enabled: subjectId !== null,
    staleTime: Infinity,
  });
}

export function useTopics(yearId: number | null) {
  return useQuery({
    queryKey: ["reference", "topics", yearId],
    queryFn: () => getTopics(yearId!),
    enabled: yearId !== null,
    staleTime: Infinity,
  });
}
