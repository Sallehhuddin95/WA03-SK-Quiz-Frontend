import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AUTH_SESSION_QUERY_KEY } from "@/lib/query-client";
import { changePassword } from "../services/authApi";
import type { ChangePasswordValues } from "../schemas/auth";

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ChangePasswordValues) =>
      changePassword(values.kata_laluan_semasa, values.kata_laluan_baru),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
    },
  });
}
