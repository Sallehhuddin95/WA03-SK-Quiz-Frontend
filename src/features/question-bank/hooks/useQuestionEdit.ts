import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { editQuestion } from "../services/questionApi";

export function useQuestionEdit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      editQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Soalan berjaya dikemas kini.");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Gagal mengemas kini soalan. Sila cuba lagi."
      );
    },
  });
}
