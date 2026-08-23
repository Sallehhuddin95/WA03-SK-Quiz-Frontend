import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleQuestionStatus } from "../services/questionApi";

export function useQuestionStatusToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      toggleQuestionStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      const label = data.status === "aktif" ? "diaktifkan" : "dinyahaktifkan";
      toast.success(`Soalan berjaya ${label}.`);
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Gagal menukar status soalan. Sila cuba lagi."
      );
    },
  });
}
