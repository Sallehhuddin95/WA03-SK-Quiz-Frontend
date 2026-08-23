import { useQuery } from "@tanstack/react-query";
import { getQuestionList } from "../services/questionApi";
import type { QuestionFilter } from "../types";

export function useQuestionList(filter: QuestionFilter = {}) {
  return useQuery({
    queryKey: ["questions", filter],
    queryFn: () => getQuestionList(filter),
    placeholderData: (previousData) => previousData,
  });
}
