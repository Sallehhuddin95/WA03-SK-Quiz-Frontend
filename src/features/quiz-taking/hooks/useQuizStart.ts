import { useMutation } from "@tanstack/react-query";
import { startAttempt } from "../services/quizApi";

export function useQuizStart() {
  return useMutation({
    mutationFn: (data: {
      topic_id: number;
      tahap_kesukaran: string;
      nama_peserta: string;
    }) => startAttempt(data),
  });
}
