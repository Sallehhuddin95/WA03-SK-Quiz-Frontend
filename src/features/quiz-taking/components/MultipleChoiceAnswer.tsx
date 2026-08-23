"use client";

import { cn } from "@/lib/utils";
import type { AnswerDataMultipleChoice } from "../types";

interface MultipleChoiceAnswerProps {
  options: { A: string; B: string; C: string; D: string };
  answer: AnswerDataMultipleChoice | null;
  onChange: (data: AnswerDataMultipleChoice) => void;
}

const CHOICES = ["A", "B", "C", "D"] as const;

export function MultipleChoiceAnswer({
  options,
  answer,
  onChange,
}: Readonly<MultipleChoiceAnswerProps>) {
  return (
    <div className="grid gap-3">
      {CHOICES.map((letter) => (
        <button
          type="button"
          key={letter}
          onClick={() => onChange({ pilihan: letter })}
          className={cn(
            "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50",
            answer?.pilihan === letter
              ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
              : "border-gray-200"
          )}
        >
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
              answer?.pilihan === letter
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600"
            )}
          >
            {letter}
          </span>
          <span className="text-base">{options[letter]}</span>
        </button>
      ))}
    </div>
  );
}
