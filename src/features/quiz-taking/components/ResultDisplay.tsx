"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatPercentage } from "@/utils/format";
import { formatAnswer, formatCorrectAnswer } from "../utils/formatAnswer";
import type { QuizResult, QuizQuestion } from "../types";

interface ResultDisplayProps {
  result: QuizResult;
  questionList: QuizQuestion[];
  onReturn: () => void;
}

export function ResultDisplay({
  result,
  questionList,
  onReturn,
}: Readonly<ResultDisplayProps>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const percentage = formatPercentage(result.skor, result.jumlah_soalan);
  const currentDetail = result.perincian[activeIndex];

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left panel: question status */}
      <div className="flex w-60 shrink-0 flex-col border-r bg-muted">
        <div className="border-b px-3 py-3">
          <p className="text-sm font-medium text-muted-foreground">Keputusan</p>
        </div>
        <ScrollArea className="flex-1 px-3 py-2">
          <div className="grid grid-cols-5 gap-1">
            {result.perincian.map((p, i) => (
              <button
                type="button"
                key={p.question_id}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors",
                  i === activeIndex && "ring-2 ring-blue-500",
                  p.adalah_betul && "bg-green-100 text-green-700",
                  !p.adalah_betul && "bg-red-100 text-red-700"
                )}
              >
                {p.adalah_betul ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right panel: detail */}
      <div className="flex flex-1 flex-col overflow-y-auto p-6">
        <Card className="mb-6">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold">
              {result.skor}/{result.jumlah_soalan}
            </CardTitle>
            <p className="text-lg text-muted-foreground">{percentage}</p>
          </CardHeader>
          <CardContent>
            <div className="h-3 w-full rounded-full bg-muted">
              <div
                className="h-3 rounded-full bg-green-500 transition-all"
                style={{ width: percentage }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Per-question detail */}
        {currentDetail && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={currentDetail.adalah_betul ? "success" : "destructive"}>
                {currentDetail.adalah_betul ? "Betul" : "Salah"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Soalan {activeIndex + 1} dari {result.jumlah_soalan}
              </span>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="text-lg">{currentDetail.teks_soalan}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground mb-1">Jawapan Anda</p>
                <p className="font-medium">
                  {formatAnswer(currentDetail.jenis_soalan, currentDetail.jawapan_murid)}
                </p>
              </div>
              {!currentDetail.adalah_betul && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-sm text-muted-foreground mb-1">Jawapan Betul</p>
                  <p className="font-medium text-green-700">
                    {formatCorrectAnswer(currentDetail.jenis_soalan, currentDetail.jawapan_betul)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button type="button" size="lg" onClick={onReturn}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
