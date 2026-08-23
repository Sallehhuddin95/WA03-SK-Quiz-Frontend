import type { QuestionType, Difficulty, MultipleChoiceOptions } from "@/types/question";

export type { QuestionType, Difficulty };

export interface QuizAttempt {
  id: number;
  topic_id: number;
  topic_nama: string;
  tahap_kesukaran: Difficulty;
  nama_peserta: string;
  status: "dalam_progres" | "selesai";
  skor: number | null;
  jumlah_soalan: number;
  masa_mula: string;
  masa_hantar: string | null;
  soalan?: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  jenis_soalan: QuestionType;
  teks_soalan: string;
  pilihan: MultipleChoiceOptions | null;
  pasangan?: { kiri: string; kanan: string }[];
}

export type AnswerDataMultipleChoice = { pilihan: string };
export type AnswerDataFillBlank = { teks: string };
export type AnswerDataTrueFalse = { nilai: boolean };
export type AnswerDataMatching = {
  pasangan: { kiri: string; kanan: string }[];
};

export type AnswerData =
  | AnswerDataMultipleChoice
  | AnswerDataFillBlank
  | AnswerDataTrueFalse
  | AnswerDataMatching;

export interface AnswerDraft {
  [questionId: number]: {
    jenis_soalan: QuestionType;
    data_jawapan: AnswerData | null;
  };
}

export interface QuestionDetail {
  question_id: number;
  jenis_soalan: QuestionType;
  teks_soalan: string;
  pilihan: MultipleChoiceOptions | null;
  jawapan_murid: AnswerData | null;
  jawapan_betul: Record<string, unknown>;
  adalah_betul: boolean;
}

export interface QuizResult {
  id: number;
  status: "selesai";
  skor: number;
  jumlah_soalan: number;
  masa_hantar: string;
  perincian: QuestionDetail[];
}

export interface QuizState {
  mode: "memuat" | "menjawab" | "menghantar" | "keputusan";
  answerDraft: AnswerDraft;
  currentQuestionIndex: number;
  showSubmitDialog: boolean;
  submitError: string | null;
  result: QuizResult | null;
}

export type QuizAction =
  | { type: "SET_ANSWER"; questionId: number; data_jawapan: AnswerData }
  | { type: "CLEAR_ANSWER"; questionId: number }
  | { type: "NAVIGATE"; index: number }
  | { type: "TOGGLE_SUBMIT_DIALOG"; open: boolean }
  | { type: "START_SUBMIT" }
  | { type: "SUBMIT_ERROR"; message: string }
  | { type: "COMPLETE"; result: QuizResult }
  | { type: "SET_MODE_ANSWERING" };
