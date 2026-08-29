import { useQuery } from "@tanstack/react-query";
import { getUserList } from "../services/usersApi";

export function useUsers(params: {
  role?: string;
  carian?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: [
      "users",
      {
        role: params.role,
        carian: params.carian,
        page: params.page ?? 1,
      },
    ],
    queryFn: () => getUserList(params),
  });
}
