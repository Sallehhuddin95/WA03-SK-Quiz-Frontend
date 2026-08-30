import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bulkDeleteQuestions } from "../services/questionApi";

export function useQuestionBulkDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => bulkDeleteQuestions(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Soalan yang dipilih berjaya dipadam.");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Gagal memadam soalan yang dipilih. Sila cuba lagi."
      );
    },
  });
}
