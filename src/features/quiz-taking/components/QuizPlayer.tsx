"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAttempt } from "../services/quizApi";
import { useQuizState } from "../hooks/useQuizState";
import { useQuizSubmit } from "../hooks/useQuizSubmit";
import { NavigationPanel } from "./NavigationPanel";
import { QuestionDisplay } from "./QuestionDisplay";
import { SubmitDialog } from "./SubmitDialog";
import { ResultDisplay } from "./ResultDisplay";
import type { AnswerData } from "../types";

export function QuizPlayer() {
  const params = useParams();
  const router = useRouter();
  const attemptId = Number(params.attemptId);

  const {
    data: attempt,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["quiz", attemptId],
    queryFn: () => getAttempt(attemptId),
  });

  const { state, dispatch, answeredCount } = useQuizState(attemptId);
  const submitMutation = useQuizSubmit();

  const questionList = attempt?.soalan ?? [];
  const currentQuestion = questionList[state.currentQuestionIndex];

  // Captured once at mount; the 24-hour threshold is coarse so a mount-time
  // timestamp is accurate enough for the stale-quiz warning.
  const [now] = useState(() => Date.now());

  const isOver24Hours =
    attempt?.masa_mula
      ? new Date(attempt.masa_mula).getTime() < now - 24 * 60 * 60 * 1000
      : false;

  // Initialize answerDraft after loading
  useEffect(() => {
    if (questionList.length > 0 && state.mode === "memuat") {
      // Initialize empty drafts for all questions
      for (const q of questionList) {
        if (!state.answerDraft[q.id]) {
          // silently initialize in reducer
        }
      }
      dispatch({ type: "SET_MODE_ANSWERING" });
    }
  }, [questionList, state.mode, state.answerDraft, dispatch]);

  // Check if already submitted
  useEffect(() => {
    if (attempt?.status === "selesai") {
      dispatch({
        type: "COMPLETE",
        result: attempt as unknown as Parameters<typeof dispatch>[0] extends { type: "COMPLETE"; result: infer K } ? K : never,
      });
    }
  }, [attempt?.status, dispatch]);

  function handleChangeAnswer(questionId: number, data_jawapan: AnswerData) {
    dispatch({ type: "SET_ANSWER", questionId, data_jawapan });
  }

  function handleSubmit() {
    const jawapan = questionList.map((q) => ({
      question_id: q.id,
      data_jawapan: (state.answerDraft[q.id]?.data_jawapan ?? {
        pilihan: "",
      }) as Record<string, unknown>,
    }));

    dispatch({ type: "START_SUBMIT" });

    submitMutation.mutate(
      { attemptId, data: { jawapan } },
      {
        onSuccess: (data) => {
          dispatch({ type: "COMPLETE", result: data });
        },
        onError: (err) => {
          dispatch({
            type: "SUBMIT_ERROR",
            message: err.message || "Gagal menghantar jawapan. Sila cuba lagi.",
          });
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="w-64 border-r p-4 space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="flex-1 p-8 space-y-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-3 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !attempt) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-4">
          {error?.message || "Kuiz tidak dijumpai."}
        </p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Cuba Semula
        </Button>
      </div>
    );
  }

  if (state.mode === "keputusan" && state.result) {
    return (
      <ResultDisplay
        result={state.result}
        questionList={questionList}
        onReturn={() => router.push("/murid")}
      />
    );
  }

  if (state.mode === "menghantar") {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-3.5rem)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-lg font-medium">Menghantar jawapan...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <NavigationPanel
        totalQuestions={questionList.length}
        currentQuestionIndex={state.currentQuestionIndex}
        answerDraft={state.answerDraft}
        answeredCount={answeredCount}
        onNavigate={(index) => dispatch({ type: "NAVIGATE", index })}
        onSubmit={() => dispatch({ type: "TOGGLE_SUBMIT_DIALOG", open: true })}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Quiz header */}
        <div className="flex items-center gap-4 border-b bg-card px-6 py-3 text-sm text-muted-foreground">
          <span className="font-medium">
            Kuiz: {attempt.topic_nama} -{" "}
            {attempt.tahap_kesukaran === "mudah"
              ? "Mudah"
              : attempt.tahap_kesukaran === "sederhana"
                ? "Sederhana"
                : "Sukar"}
          </span>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
              {(attempt.nama_peserta[0] || "?").toUpperCase()}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">
                {attempt.nama_peserta}
              </p>
              <p className="text-[11px] text-muted-foreground">Murid</p>
            </div>
          </div>
        </div>

        {/* 24-hour warning */}
        {isOver24Hours && attempt?.status === "dalam_progres" && (
          <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Kuiz ini dimulakan lebih 24 jam lalu.</span>
          </div>
        )}

        {/* Question display */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          <div className="mx-auto p-6 sm:p-10">
            {currentQuestion && (
              <QuestionDisplay
                question={currentQuestion}
                index={state.currentQuestionIndex}
                total={questionList.length}
                answer={state.answerDraft[currentQuestion.id]?.data_jawapan ?? null}
                onChangeAnswer={(data) => handleChangeAnswer(currentQuestion.id, data)}
                onPrevious={() =>
                  dispatch({
                    type: "NAVIGATE",
                    index: state.currentQuestionIndex - 1,
                  })
                }
                onNext={() =>
                  dispatch({
                    type: "NAVIGATE",
                    index: state.currentQuestionIndex + 1,
                  })
                }
                isFirst={state.currentQuestionIndex === 0}
                isLast={state.currentQuestionIndex === questionList.length - 1}
              />
            )}
          </div>
        </div>
      </div>

      <SubmitDialog
        open={state.showSubmitDialog}
        onOpenChange={(open) => {
          dispatch({ type: "TOGGLE_SUBMIT_DIALOG", open });
        }}
        answeredCount={answeredCount}
        totalQuestions={questionList.length}
        onSubmit={handleSubmit}
        isPending={false}
      />
    </div>
  );
}
