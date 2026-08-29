import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateKelas } from "../services/kelasApi";
import { getErrorMessage } from "../utils/error";
import type { UpdateKelasPayload } from "../types";

export function useKelasUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateKelasPayload }) =>
      updateKelas(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kelas"] });
      toast.success("Kelas dikemas kini.");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
