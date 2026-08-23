import { useQuery } from "@tanstack/react-query";
import { getAttemptDetail } from "../services/resultApi";

export function useResultDetail(id: number | null) {
  return useQuery({
    queryKey: ["quiz-attempts", id, "result"],
    queryFn: () => getAttemptDetail(id!),
    enabled: id !== null,
  });
}
