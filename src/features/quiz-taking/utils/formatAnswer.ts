import type { AnswerData } from "../types";

export function formatAnswer(
  jenisSoalan: string,
  jawapan: AnswerData | Record<string, unknown> | null
): string {
  if (!jawapan) return "Tiada jawapan";

  switch (jenisSoalan) {
    case "aneka_pilihan": {
      const data = jawapan as { pilihan?: string };
      return data.pilihan && data.pilihan.length > 0 ? data.pilihan : "Tiada jawapan";
    }
    case "isi_tempat_kosong": {
      const data = jawapan as { teks?: string };
      return data.teks && data.teks.trim().length > 0 ? data.teks : "Tiada jawapan";
    }
    case "betul_salah": {
      const data = jawapan as { nilai?: boolean };
      if (data.nilai === undefined || data.nilai === null) return "Tiada jawapan";
      return data.nilai ? "Betul" : "Salah";
    }
    case "padanan": {
      const data = jawapan as { pasangan?: { kiri: string; kanan: string }[] };
      if (!data.pasangan || data.pasangan.length === 0) return "Tiada jawapan";
      return data.pasangan.map((p) => `${p.kiri} \u2192 ${p.kanan}`).join("; ");
    }
    default:
      return "Jenis soalan tidak dikenali";
  }
}

export function formatCorrectAnswer(
  jenisSoalan: string,
  jawapanBetul: Record<string, unknown> | null
): string {
  if (!jawapanBetul) return "Tiada jawapan betul";

  switch (jenisSoalan) {
    case "aneka_pilihan": {
      const data = jawapanBetul as { pilihan?: string };
      return data.pilihan ?? "Tiada data";
    }
    case "isi_tempat_kosong": {
      const data = jawapanBetul as { jawapan_diterima?: string[] };
      if (!data.jawapan_diterima || data.jawapan_diterima.length === 0) return "Tiada data";
      return data.jawapan_diterima.join(" / ");
    }
    case "betul_salah": {
      const data = jawapanBetul as { nilai?: boolean };
      return data.nilai ? "Betul" : "Salah";
    }
    case "padanan": {
      const data = jawapanBetul as { pasangan?: { kiri: string; kanan: string }[] };
      if (!data.pasangan || data.pasangan.length === 0) return "Tiada data";
      return data.pasangan.map((p) => `${p.kiri} \u2192 ${p.kanan}`).join("; ");
    }
    default:
      return "Jenis soalan tidak dikenali";
  }
}
