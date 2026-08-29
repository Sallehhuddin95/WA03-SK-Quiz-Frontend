import { useQuery } from "@tanstack/react-query";
import { getGurus } from "../services/gurusApi";

export function useGurus() {
  return useQuery({
    queryKey: ["gurus"],
    queryFn: getGurus,
  });
}
