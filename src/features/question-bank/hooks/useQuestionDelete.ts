import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteQuestion } from "../services/questionApi";

export function useQuestionDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Soalan berjaya dipadam.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memadam soalan. Sila cuba lagi.");
    },
  });
}
