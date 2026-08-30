"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubjects, useYears, useTopics } from "@/hooks/useReferenceData";
import { usePreviewQuestions } from "../hooks/usePreviewQuestions";
import { formatTopicLabel, formatTypeLabel, topicLabel, difficultyLabel } from "@/utils/format";

export function PreviewQuestionList() {
  const [topicId, setTopicId] = useState(0);
  const [difficulty, setDifficulty] = useState<string>("semua");

  const { data: subjects } = useSubjects();
  const subjectId = subjects?.[0]?.id ?? null;
  const { data: yearList } = useYears(subjectId);
  const yearId = yearList?.[0]?.id ?? null;
  const { data: topics, isLoading: topicsLoading } = useTopics(yearId);

  const selectedDifficulty =
    difficulty === "semua" ? undefined : difficulty;

  const {
    data: questions,
    isLoading: questionsLoading,
    isError,
    refetch,
  } = usePreviewQuestions(topicId, selectedDifficulty);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pratonton Murid</h1>
        <p className="text-muted-foreground">
          Lihat soalan seperti yang dilihat oleh murid, tanpa jawapan dan tanpa
          penghantaran.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Topik</label>
          <Select
            value={topicId > 0 ? topicId.toString() : undefined}
            onValueChange={(v) => setTopicId(Number(v))}
            disabled={topicsLoading}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Pilih topik">
                {(value: string | null) => topicLabel(value, topics, "Pilih topik")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {topics?.map((topic) => (
                <SelectItem key={topic.id} value={topic.id.toString()}>
                  {formatTopicLabel(topic.id, topic.nama)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Tahap Kesukaran
          </label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v ?? "semua")}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Semua Tahap">
                {(value: string | null) => difficultyLabel(value, "Semua Tahap")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Tahap</SelectItem>
              <SelectItem value="mudah">Mudah</SelectItem>
              <SelectItem value="sederhana">Sederhana</SelectItem>
              <SelectItem value="sukar">Sukar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {topicId === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">
            Pilih topik untuk memaparkan soalan pratonton.
          </p>
        </div>
      ) : questionsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="mb-4 text-muted-foreground">
            Gagal memuatkan soalan pratonton.
          </p>
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Cuba Semula
          </Button>
        </div>
      ) : questions && questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">Tiada soalan untuk topik ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions?.map((question, index) => (
            <Card key={question.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">
                    Soalan {index + 1}
                  </CardTitle>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {formatTypeLabel(question.jenis_soalan)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{question.teks_soalan}</p>
                {question.pilihan && (
                  <div className="mt-3 space-y-2">
                    {Object.entries(question.pilihan).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-start gap-2 rounded-md border border-border px-3 py-2 text-sm"
                      >
                        <span className="font-semibold text-muted-foreground">
                          {key}
                        </span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
