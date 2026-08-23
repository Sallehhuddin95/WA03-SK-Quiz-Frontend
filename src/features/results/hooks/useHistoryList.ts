import { useQuery } from "@tanstack/react-query";
import { getAttemptList } from "../services/resultApi";

export function useHistoryList(params?: {
  topic_id?: number;
  difficulty?: string;
  participant_name?: string;
  status?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ["quiz-attempts", params],
    queryFn: () => getAttemptList(params),
  });
}
