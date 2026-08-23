"use client";

import Link from "next/link";
import { BookOpen, Users, CheckCircle2, TrendingUp, Plus, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";

interface QuestionSummary {
  id: number;
  status: string;
}

interface AttemptSummary {
  id: number;
  skor: number | null;
  jumlah_soalan: number;
}

export default function AdminDashboardPage() {
  const {
    data: questionData,
    isLoading: questionLoading,
    isError: questionError,
    refetch: questionRefetch,
  } = useQuery({
    queryKey: ["admin", "dashboard", "questions"],
    queryFn: () =>
      apiGet<PaginatedResponse<QuestionSummary>>("/questions", {
        page: 1,
        page_size: 1,
      }),
  });

  const {
    data: activeQuestionData,
    isLoading: activeQuestionLoading,
    isError: activeQuestionError,
  } = useQuery({
    queryKey: ["admin", "dashboard", "active-questions"],
    queryFn: () =>
      apiGet<PaginatedResponse<QuestionSummary>>("/questions", {
        status: "aktif",
        page: 1,
        page_size: 1,
      }),
  });

  const {
    data: attemptData,
    isLoading: attemptLoading,
    isError: attemptError,
  } = useQuery({
    queryKey: ["admin", "dashboard", "attempts"],
    queryFn: () =>
      apiGet<PaginatedResponse<AttemptSummary>>("/quiz-attempts", {
        page: 1,
        page_size: 1,
      }),
  });

  const {
    data: completedAttemptData,
    isLoading: completedLoading,
    isError: completedError,
  } = useQuery({
    queryKey: ["admin", "dashboard", "completed-attempts"],
    queryFn: () =>
      apiGet<PaginatedResponse<AttemptSummary>>("/quiz-attempts", {
        status: "selesai",
        page: 1,
        page_size: 100,
      }),
  });

  const totalQuestions = questionData?.meta?.total_items ?? 0;
  const activeQuestions = activeQuestionData?.meta?.total_items ?? 0;
  const totalAttempts = attemptData?.meta?.total_items ?? 0;

  const completedScores = completedAttemptData?.data ?? [];
  const averageScore =
    completedScores.length > 0
      ? Math.round(
          completedScores.reduce(
            (sum, p) => sum + ((p.skor ?? 0) / (p.jumlah_soalan || 1)) * 100,
            0
          ) / completedScores.length
        )
      : 0;

  const isLoading =
    questionLoading || activeQuestionLoading || attemptLoading || completedLoading;
  const isError =
    questionError || activeQuestionError || attemptError || completedError;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-500 mb-4">
          Gagal memuatkan statistik. Sila cuba lagi.
        </p>
        <Button type="button" variant="outline" onClick={() => questionRefetch()}>
          Cuba Semula
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500">
            Selamat datang ke panel pentadbiran SK Quiz.
          </p>
        </div>
        <Link href="/admin/bank-soalan/baru">
          <Button type="button">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Soalan Baru
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Jumlah Soalan
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{totalQuestions}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Soalan Aktif
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{activeQuestions}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Jumlah Percubaan
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{totalAttempts}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Purata Skor
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">
                {completedScores.length > 0 ? `${averageScore}%` : "-"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pautan Pantas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/admin/bank-soalan">
              <Button type="button" variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Urus Bank Soalan
              </Button>
            </Link>
            <Link href="/admin/prestasi">
              <Button type="button" variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Lihat Prestasi Murid
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
