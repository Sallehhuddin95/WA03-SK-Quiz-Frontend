export interface AttemptSummary {
  id: number;
  topic_id: number;
  topic_nama: string;
  tahap_kesukaran: "mudah" | "sederhana" | "sukar";
  nama_peserta: string;
  status: "dalam_progres" | "selesai";
  skor: number | null;
  jumlah_soalan: number;
  masa_mula: string;
  masa_hantar: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttemptDetail {
  id: number;
  topic_id: number;
  topic_nama: string;
  tahap_kesukaran: string;
  nama_peserta: string;
  status: string;
  skor: number;
  jumlah_soalan: number;
  masa_mula: string;
  masa_hantar: string;
  perincian: DetailItem[];
}

export interface DetailItem {
  question_id: number;
  jenis_soalan: string;
  teks_soalan: string;
  pilihan: Record<string, string> | null;
  jawapan_murid: Record<string, unknown> | null;
  jawapan_betul: Record<string, unknown> | null;
  adalah_betul: boolean;
}
