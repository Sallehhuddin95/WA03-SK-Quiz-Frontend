"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuizStart } from "../hooks/useQuizStart";
import { usePendingAttempt } from "../hooks/usePendingAttempt";
import { useSubjects, useYears, useTopics } from "@/hooks/useReferenceData";
import { kuizStartSchema } from "../schemas/kuiz";
import type { KuizStartValues } from "../schemas/kuiz";

const NAME_STORAGE_KEY = "sk_quiz_nama_murid";

export function QuizSelector() {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<KuizStartValues>({
    resolver: zodResolver(kuizStartSchema),
    defaultValues: {
      nama_peserta: "",
      topic_id: 0,
      tahap_kesukaran: undefined,
    },
  });

  const startMutation = useQuizStart();
  const { data: subjects } = useSubjects();
  const subjectId = subjects?.[0]?.id ?? null;
  const { data: yearList } = useYears(subjectId);
  const yearId = yearList?.[0]?.id ?? null;
  const { data: topics, isLoading: topicsLoading } = useTopics(yearId);

  const [validatedData, setValidatedData] = useState<KuizStartValues | null>(null);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const hasProceededRef = useRef(false);

  const pendingAttempt = usePendingAttempt(
    validatedData?.nama_peserta ?? "",
    validatedData?.topic_id ?? 0,
    validatedData?.tahap_kesukaran ?? ""
  );

  const pendingAttemptExists =
    pendingAttempt.data?.data && pendingAttempt.data.data.length > 0;
  const pendingAttemptId = pendingAttempt.data?.data?.[0]?.id;

  useEffect(() => {
    const savedName = localStorage.getItem(NAME_STORAGE_KEY);
    if (savedName) setValue("nama_peserta", savedName);
  }, [setValue]);

  const proceedWithMutation = useCallback(
    (data: KuizStartValues) => {
      if (hasProceededRef.current) return;
      hasProceededRef.current = true;

      startMutation.mutate(
        {
          topic_id: data.topic_id,
          tahap_kesukaran: data.tahap_kesukaran,
          nama_peserta: data.nama_peserta.trim(),
        },
        {
          onSuccess: (result) => {
            router.push(`/murid/kuiz/${result.id}`);
          },
        }
      );
    },
    [startMutation, router]
  );

  useEffect(() => {
    if (!validatedData || pendingAttempt.isLoading || hasProceededRef.current) return;

    if (pendingAttemptExists && pendingAttemptId) {
      setShowPendingDialog(true);
    } else {
      proceedWithMutation(validatedData);
    }
  }, [validatedData, pendingAttempt.isLoading, pendingAttemptExists, pendingAttemptId, proceedWithMutation]);

  function onSubmit(data: KuizStartValues) {
    localStorage.setItem(NAME_STORAGE_KEY, data.nama_peserta.trim());
    hasProceededRef.current = false;
    setValidatedData(data);
  }

  function handleContinueExisting() {
    setShowPendingDialog(false);
    if (pendingAttemptId) {
      router.push(`/murid/kuiz/${pendingAttemptId}`);
    }
  }

  function handleStartNew() {
    setShowPendingDialog(false);
    if (validatedData) {
      proceedWithMutation(validatedData);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Selamat Datang ke Kuiz Matematik</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Pilih topik dan tahap untuk memulakan kuiz.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Kamu</Label>
            <Input
              id="nama"
              placeholder="Masukkan nama anda"
              maxLength={50}
              {...register("nama_peserta")}
            />
            {errors.nama_peserta && (
              <p className="text-sm text-destructive">{errors.nama_peserta.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Pilih Topik</Label>
            <Controller
              control={control}
              name="topic_id"
              render={({ field }) => (
                <Select
                  value={field.value > 0 ? field.value.toString() : undefined}
                  onValueChange={(v) => field.onChange(Number(v))}
                  disabled={topicsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih topik" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics?.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.topic_id && (
              <p className="text-sm text-destructive">{errors.topic_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Pilih Tahap</Label>
            <Controller
              control={control}
              name="tahap_kesukaran"
              render={({ field }) => (
                <Select
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahap" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mudah">Mudah</SelectItem>
                    <SelectItem value="sederhana">Sederhana</SelectItem>
                    <SelectItem value="sukar">Sukar</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tahap_kesukaran && (
              <p className="text-sm text-destructive">{errors.tahap_kesukaran.message}</p>
            )}
          </div>

          {startMutation.isError && (
            <p className="text-sm text-destructive text-center">
              {startMutation.error?.message || "Gagal memulakan kuiz. Sila cuba lagi."}
            </p>
          )}

          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={handleSubmit(onSubmit)}
            disabled={startMutation.isPending || pendingAttempt.isLoading}
          >
            {(startMutation.isPending || pendingAttempt.isLoading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Mula Kuiz!
          </Button>
        </CardContent>
      </Card>

      {/* Pending attempt dialog */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kuiz Belum Diselesaikan</DialogTitle>
            <DialogDescription>
              Anda mempunyai kuiz yang belum diselesaikan untuk topik dan tahap
              yang sama.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleStartNew}
            >
              Mula Baru
            </Button>
            <Button type="button" onClick={handleContinueExisting}>
              Sambung
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
