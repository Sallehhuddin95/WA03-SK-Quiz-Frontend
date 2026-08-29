import { ApiClientError } from "@/lib/api-client";

const ERROR_MESSAGES: Record<string, string> = {
  NAMA_PENGGUNA_WUJUD: "Nama pengguna sudah wujud.",
  TIADA_KEBENARAN: "Anda tiada kebenaran untuk tindakan ini.",
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    const mapped = ERROR_MESSAGES[error.kod];
    if (mapped) return mapped;
    return error.message;
  }
  return error instanceof Error
    ? error.message
    : "Ralat tidak dijangka. Sila cuba lagi.";
}
