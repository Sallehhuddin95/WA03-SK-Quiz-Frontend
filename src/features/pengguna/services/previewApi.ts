import { apiGet } from "@/lib/api-client";
import type { PreviewQuestion } from "../types";

export async function getPreviewQuestions(params: {
  topic_id: number;
  tahap_kesukaran?: string;
}): Promise<PreviewQuestion[]> {
  return apiGet<PreviewQuestion[]>("/kuiz/pratonton", {
    topic_id: params.topic_id,
    tahap_kesukaran: params.tahap_kesukaran,
  });
}
