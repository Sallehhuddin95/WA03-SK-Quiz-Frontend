"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Play } from "lucide-react";
import { formatDate, formatScore, formatPercentage } from "@/utils/format";
import type { AttemptSummary } from "../types";

interface AttemptCardProps {
  attempt: AttemptSummary;
  onViewDetail: () => void;
  onContinue?: () => void;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  mudah: "Mudah",
  sederhana: "Sederhana",
  sukar: "Sukar",
};

export function AttemptCard({
  attempt,
  onViewDetail,
  onContinue,
}: Readonly<AttemptCardProps>) {
  const isCompleted = attempt.status === "selesai";
  const date = isCompleted ? attempt.masa_hantar : attempt.masa_mula;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {attempt.topic_nama} - {DIFFICULTY_LABELS[attempt.tahap_kesukaran] ?? attempt.tahap_kesukaran}
            </CardTitle>
            <p className="text-sm text-gray-500">
              {date ? formatDate(date) : "-"}
            </p>
          </div>
          {!isCompleted && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              Belum Selesai
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            {isCompleted && attempt.skor !== null ? (
              <p className="text-xl font-bold">
                {formatScore(attempt.skor, attempt.jumlah_soalan)} -{" "}
                {formatPercentage(attempt.skor, attempt.jumlah_soalan)}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                {attempt.jumlah_soalan} soalan
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {isCompleted && (
              <Button type="button" variant="outline" size="sm" onClick={onViewDetail}>
                <Eye className="mr-1 h-4 w-4" />
                Lihat Butiran
              </Button>
            )}
            {!isCompleted && onContinue && (
              <Button type="button" size="sm" onClick={onContinue}>
                <Play className="mr-1 h-4 w-4" />
                Sambung
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
