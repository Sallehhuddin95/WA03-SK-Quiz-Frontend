"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { AnswerDraft } from "../types";

interface NavigationPanelProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  answerDraft: AnswerDraft;
  answeredCount: number;
  onNavigate: (index: number) => void;
  onSubmit: () => void;
}

export function NavigationPanel({
  totalQuestions,
  currentQuestionIndex,
  answerDraft,
  answeredCount,
  onNavigate,
  onSubmit,
}: Readonly<NavigationPanelProps>) {
  // Build question ID list from answerDraft keys
  const questionIds = Object.keys(answerDraft).map(Number);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-white">
      <div className="border-b px-4 py-4">
        <p className="text-sm font-semibold text-gray-700">Soalan</p>
        <p className="mt-0.5 text-xs text-gray-400">
          {answeredCount}/{totalQuestions} dijawab
        </p>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }).map((_, i) => {
            const questionId = questionIds[i];
            const isAnswered =
              !!questionId && answerDraft[questionId]?.data_jawapan !== null;
            const isActive = i === currentQuestionIndex;

            return (
              <button
                type="button"
                key={i}
                onClick={() => onNavigate(i)}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : isAnswered
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <Button
          type="button"
          className="w-full"
          onClick={onSubmit}
          disabled={answeredCount < totalQuestions}
        >
          Hantar Semua Jawapan
        </Button>
        {answeredCount < totalQuestions && (
          <p className="mt-2 text-center text-xs text-gray-400">
            Jawab semua soalan dahulu ({totalQuestions - answeredCount} lagi)
          </p>
        )}
      </div>
    </aside>
  );
}
