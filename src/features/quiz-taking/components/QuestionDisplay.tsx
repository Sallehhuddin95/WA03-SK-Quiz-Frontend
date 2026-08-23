"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileQuestion } from "lucide-react";
import { MultipleChoiceAnswer } from "./MultipleChoiceAnswer";
import { FillBlankAnswer } from "./FillBlankAnswer";
import { TrueFalseAnswer } from "./TrueFalseAnswer";
import { MatchingAnswer } from "./MatchingAnswer";
import type { QuizQuestion, AnswerData } from "../types";

interface QuestionDisplayProps {
  question: QuizQuestion;
  index: number;
  total: number;
  answer: AnswerData | null;
  onChangeAnswer: (data: AnswerData) => void;
  onPrevious: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  aneka_pilihan: "Aneka Pilihan",
  isi_tempat_kosong: "Isi Tempat Kosong",
  betul_salah: "Betul / Salah",
  padanan: "Padanan",
};

export function QuestionDisplay({
  question,
  index,
  total,
  answer,
  onChangeAnswer,
  onPrevious,
  onNext,
  isFirst,
  isLast,
}: Readonly<QuestionDisplayProps>) {
  function renderAnswer() {
    switch (question.jenis_soalan) {
      case "aneka_pilihan":
        return (
          <MultipleChoiceAnswer
            options={question.pilihan ?? { A: "", B: "", C: "", D: "" }}
            answer={answer as { pilihan: string } | null}
            onChange={(data) => onChangeAnswer(data)}
          />
        );
      case "isi_tempat_kosong":
        return (
          <FillBlankAnswer
            answer={answer as { teks: string } | null}
            onChange={(data) => onChangeAnswer(data)}
          />
        );
      case "betul_salah":
        return (
          <TrueFalseAnswer
            answer={answer as { nilai: boolean } | null}
            onChange={(data) => onChangeAnswer(data)}
          />
        );
      case "padanan":
        return (
          <MatchingAnswer
            pasangan={question.pasangan ?? []}
            answer={answer as { pasangan: { kiri: string; kanan: string }[] } | null}
            onChange={(data) => onChangeAnswer(data)}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {/* Question meta + progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            <FileQuestion className="h-4 w-4" />
            Soalan {index + 1} dari {total}
          </span>
          <span className="text-sm text-gray-400">
            {TYPE_LABELS[question.jenis_soalan] ?? question.jenis_soalan}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xl leading-relaxed whitespace-pre-wrap text-gray-900">
          {question.teks_soalan}
        </p>
      </div>

      <div className="space-y-4">{renderAnswer()}</div>

      <div className="mt-2 flex items-center justify-between border-t pt-6">
        <Button type="button" variant="ghost" onClick={onPrevious} disabled={isFirst}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Sebelumnya
        </Button>
        <Button type="button" onClick={onNext} disabled={isLast}>
          Seterusnya
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
