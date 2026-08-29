"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import type { AnswerDataTrueFalse } from "../types";

interface TrueFalseAnswerProps {
  answer: AnswerDataTrueFalse | null;
  onChange: (data: AnswerDataTrueFalse) => void;
}

export function TrueFalseAnswer({
  answer,
  onChange,
}: Readonly<TrueFalseAnswerProps>) {
  return (
    <div className="flex gap-4">
      <button
        type="button"
        onClick={() => onChange({ nilai: true })}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-lg border p-6 transition-colors",
          answer?.nilai === true
            ? "border-green-500 bg-green-50 ring-1 ring-green-500"
            : "border-border hover:bg-muted"
        )}
      >
        <Check className="h-5 w-5 text-green-600" />
        <span className="text-lg font-medium">Betul</span>
      </button>
      <button
        type="button"
        onClick={() => onChange({ nilai: false })}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-lg border p-6 transition-colors",
          answer?.nilai === false
            ? "border-red-500 bg-red-50 ring-1 ring-red-500"
            : "border-border hover:bg-muted"
        )}
      >
        <X className="h-5 w-5 text-red-600" />
        <span className="text-lg font-medium">Salah</span>
      </button>
    </div>
  );
}
