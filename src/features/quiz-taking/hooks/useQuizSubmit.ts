import { useMutation } from "@tanstack/react-query";
import { submitAnswers } from "../services/quizApi";

export function useQuizSubmit() {
  return useMutation({
    mutationFn: ({
      attemptId,
      data,
    }: {
      attemptId: number;
      data: {
        jawapan: { question_id: number; data_jawapan: Record<string, unknown> }[];
      };
    }) => submitAnswers(attemptId, data),
  });
}
