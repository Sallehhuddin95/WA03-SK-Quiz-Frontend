import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createQuestion } from "../services/questionApi";

export function useQuestionCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Soalan berjaya disimpan.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menyimpan soalan. Sila cuba lagi.");
    },
  });
}
