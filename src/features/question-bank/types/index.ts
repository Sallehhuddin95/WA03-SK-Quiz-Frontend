export type { QuestionType, Difficulty, QuestionStatus, MultipleChoiceOptions } from "@/types/question";
export type { Subject, Year, Topic } from "@/types/reference";

export type CorrectAnswerMultipleChoice = { pilihan: "A" | "B" | "C" | "D" };
export type CorrectAnswerFillBlank = { jawapan_diterima: string[] };
export type CorrectAnswerTrueFalse = { nilai: boolean };
export type CorrectAnswerMatching = { pasangan: { kiri: string; kanan: string }[] };

export type CorrectAnswer =
  | CorrectAnswerMultipleChoice
  | CorrectAnswerFillBlank
  | CorrectAnswerTrueFalse
  | CorrectAnswerMatching;

export interface Question {
  id: number;
  topic_id: number;
  topic_nama: string;
  jenis_soalan: import("@/types/question").QuestionType;
  tahap_kesukaran: import("@/types/question").Difficulty;
  status: import("@/types/question").QuestionStatus;
  teks_soalan: string;
  pilihan: import("@/types/question").MultipleChoiceOptions | null;
  jawapan_betul: CorrectAnswer;
  created_at: string;
  updated_at: string;
}

export interface QuestionFilter {
  topic_id?: number;
  difficulty?: import("@/types/question").Difficulty;
  question_type?: import("@/types/question").QuestionType;
  status?: import("@/types/question").QuestionStatus;
  page?: number;
  page_size?: number;
}
