import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AUTH_SESSION_QUERY_KEY } from "@/lib/query-client";
import { logout } from "../services/authApi";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
      queryClient.clear();
      router.push("/login");
    },
  });
}
