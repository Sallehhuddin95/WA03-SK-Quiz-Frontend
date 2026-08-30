import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bulkDeactivateUsers } from "../services/usersApi";
import { getErrorMessage } from "../utils/error";

export function useUserBulkDeactivate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => bulkDeactivateUsers(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Akaun pengguna yang dipilih telah dinyahaktifkan.");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
