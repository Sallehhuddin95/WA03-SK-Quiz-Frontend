export type QuestionType = "aneka_pilihan" | "isi_tempat_kosong" | "betul_salah" | "padanan";

export type Difficulty = "mudah" | "sederhana" | "sukar";

export type QuestionStatus = "aktif" | "tidak_aktif";

export interface MultipleChoiceOptions {
  A: string;
  B: string;
  C: string;
  D: string;
}
