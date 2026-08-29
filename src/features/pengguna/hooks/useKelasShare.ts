import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { shareKelas } from "../services/kelasApi";
import { getErrorMessage } from "../utils/error";

export function useKelasShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, guru_ids }: { id: number; guru_ids: number[] }) =>
      shareKelas(id, guru_ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kelas"] });
      toast.success("Perkongsian kelas dikemas kini.");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
