import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deactivateUser } from "../services/usersApi";
import { getErrorMessage } from "../utils/error";

export function useUserDeactivate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Akaun pengguna telah dinyahaktifkan.");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
