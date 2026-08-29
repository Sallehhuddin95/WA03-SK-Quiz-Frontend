import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateUser } from "../services/usersApi";
import { getErrorMessage } from "../utils/error";
import type { UpdateUserPayload } from "../types";

export function useUserUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserPayload }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Maklumat pengguna dikemas kini.");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
