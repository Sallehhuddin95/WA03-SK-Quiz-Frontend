import { useQuery } from "@tanstack/react-query";
import { getAttemptList } from "@/features/results/services/resultApi";

export function usePendingAttempt(
  namaPeserta: string,
  topicId: number,
  tahapKesukaran: string
) {
  return useQuery({
    queryKey: ["pending-attempt", namaPeserta, topicId, tahapKesukaran],
    queryFn: () =>
      getAttemptList({
        participant_name: namaPeserta,
        topic_id: topicId,
        difficulty: tahapKesukaran,
        status: "dalam_progres",
        page: 1,
        page_size: 1,
      }),
    enabled: namaPeserta.length > 0 && topicId > 0 && tahapKesukaran.length > 0,
  });
}
