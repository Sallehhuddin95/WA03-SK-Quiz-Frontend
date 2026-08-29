import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { resetUserPassword } from "../services/usersApi";
import { getErrorMessage } from "../utils/error";

export function useUserResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      kata_laluan_baru,
    }: {
      id: number;
      kata_laluan_baru: string;
    }) => resetUserPassword(id, kata_laluan_baru),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Kata laluan telah ditetapkan semula.");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
