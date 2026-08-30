export const QUESTION_TYPE_LABELS: Record<string, string> = {
  aneka_pilihan: "Aneka Pilihan",
  isi_tempat_kosong: "Isi Tempat Kosong",
  betul_salah: "Betul/Salah",
  padanan: "Padanan",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  mudah: "Mudah",
  sederhana: "Sederhana",
  sukar: "Sukar",
};

export function formatTypeLabel(type: string): string {
  return QUESTION_TYPE_LABELS[type] ?? type;
}

export function formatTopicLabel(id: number, nama: string): string {
  return nama || `Topik ${id}`;
}

export interface TopicOption {
  id: number;
  nama: string;
}

export function topicLabel(
  value: string | null | undefined,
  topics: TopicOption[] | undefined,
  fallback = "Semua Topik"
): string {
  if (!value) return fallback;
  const topic = topics?.find((t) => t.id.toString() === value);
  return formatTopicLabel(topic?.id ?? Number(value), topic?.nama ?? "");
}

export function difficultyLabel(
  value: string | null | undefined,
  fallback = "Semua Tahap"
): string {
  if (!value) return fallback;
  return DIFFICULTY_LABELS[value] ?? value;
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("ms-MY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatPercentage(score: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((score / total) * 100)}%`;
}

export function truncateText(text: string, maxChars: number = 80): string {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars).trimEnd() + "...";
}

export function formatScore(score: number | null, total: number): string {
  if (score === null || score === undefined) return "-";
  return `${score}/${total}`;
}
