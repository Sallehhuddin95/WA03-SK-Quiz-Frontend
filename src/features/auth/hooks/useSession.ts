import { useQuery } from "@tanstack/react-query";
import { AUTH_SESSION_QUERY_KEY } from "@/lib/query-client";
import { getMe } from "../services/authApi";
import type { SessionUser } from "../types";

export function useSession() {
  const { data: user, isLoading, isError } = useQuery<SessionUser>({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: getMe,
    retry: false,
    staleTime: 0,
  });

  return {
    user,
    isLoading,
    isError,
    hasSession: Boolean(user),
  };
}
