import { useQuery } from "@tanstack/react-query";
import { getPreviewQuestions } from "../services/previewApi";

export function usePreviewQuestions(
  topicId: number,
  tahapKesukaran: string | undefined
) {
  return useQuery({
    queryKey: ["kuiz", "pratonton", topicId, tahapKesukaran ?? "semua"],
    queryFn: () =>
      getPreviewQuestions({
        topic_id: topicId,
        tahap_kesukaran: tahapKesukaran,
      }),
    enabled: topicId > 0,
  });
}
