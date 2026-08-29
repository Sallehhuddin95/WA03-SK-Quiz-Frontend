import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createKelas } from "../services/kelasApi";
import { getErrorMessage } from "../utils/error";
import type { CreateKelasPayload } from "../types";

export function useKelasCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateKelasPayload) => createKelas(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kelas"] });
      toast.success("Kelas berjaya dicipta.");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
