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
