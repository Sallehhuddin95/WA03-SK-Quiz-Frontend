"use client";

import { Input } from "@/components/ui/input";
import type { AnswerDataFillBlank } from "../types";

interface FillBlankAnswerProps {
  answer: AnswerDataFillBlank | null;
  onChange: (data: AnswerDataFillBlank) => void;
}

export function FillBlankAnswer({
  answer,
  onChange,
}: Readonly<FillBlankAnswerProps>) {
  return (
    <div>
      <Input
        placeholder="Taip jawapan anda..."
        value={answer?.teks ?? ""}
        onChange={(e) => onChange({ teks: e.target.value })}
        className="max-w-md"
      />
    </div>
  );
}
