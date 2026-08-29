import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createUser } from "../services/usersApi";
import { getErrorMessage } from "../utils/error";
import type { CreateUserPayload } from "../types";

export function useUserCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserPayload) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Pengguna berjaya dicipta.");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
