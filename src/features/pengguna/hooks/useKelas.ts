import { useQuery } from "@tanstack/react-query";
import { getKelasList } from "../services/kelasApi";

export function useKelas() {
  return useQuery({
    queryKey: ["kelas"],
    queryFn: getKelasList,
  });
}
