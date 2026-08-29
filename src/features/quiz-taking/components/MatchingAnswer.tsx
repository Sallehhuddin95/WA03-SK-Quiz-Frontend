"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AnswerDataMatching } from "../types";

interface MatchingAnswerProps {
  pasangan: { kiri: string; kanan: string }[];
  answer: AnswerDataMatching | null;
  onChange: (data: AnswerDataMatching) => void;
}

export function MatchingAnswer({
  pasangan,
  answer,
  onChange,
}: Readonly<MatchingAnswerProps>) {
  const currentPasangan = answer?.pasangan ?? [];

  // Collect all unique kanan values from the question for dropdown options
  const kananOptions = Array.from(new Set(pasangan.map((p) => p.kanan)));

  function handleChangePair(index: number, kanan: string) {
    const newPasangan = [...currentPasangan];
    if (index >= newPasangan.length) {
      while (newPasangan.length <= index) {
        newPasangan.push({ kiri: "", kanan: "" });
      }
    }
    newPasangan[index] = { ...newPasangan[index], kanan };
    onChange({ pasangan: newPasangan });
  }

  if (pasangan.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Tiada data padanan tersedia.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Padankan setiap item di sebelah kiri dengan jawapan yang betul.
      </p>
      {pasangan.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border border-border p-3"
        >
          <span className="min-w-0 flex-1 text-sm font-medium">{item.kiri}</span>
          <span className="text-sm text-muted-foreground">&rarr;</span>
          <Select
            value={currentPasangan[i]?.kanan ?? undefined}
            onValueChange={(v) => { if (v) handleChangePair(i, v); }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih jawapan" />
            </SelectTrigger>
            <SelectContent>
              {kananOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
