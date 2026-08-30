import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bulkUpdateQuestionStatus } from "../services/questionApi";
import type { QuestionStatus } from "@/types/question";

interface BulkStatusVariables {
  ids: number[];
  status: QuestionStatus;
}

export function useQuestionBulkStatusToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: BulkStatusVariables) =>
      bulkUpdateQuestionStatus(ids, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      const label =
        variables.status === "aktif" ? "diaktifkan" : "dinyahaktifkan";
      toast.success(`Soalan yang dipilih berjaya ${label}.`);
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          "Gagal menukar status soalan yang dipilih. Sila cuba lagi."
      );
    },
  });
}
