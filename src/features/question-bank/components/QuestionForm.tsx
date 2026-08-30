"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTopicLabel, topicLabel, difficultyLabel } from "@/utils/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { questionSchema } from "../schemas/question";
import { useQuestionCreate } from "../hooks/useQuestionCreate";
import { useQuestionEdit } from "../hooks/useQuestionEdit";
import { useSubjects, useYears, useTopics } from "../hooks/useReferenceData";
import { getQuestionById } from "../services/questionApi";
import { MultipleChoiceForm } from "./MultipleChoiceForm";
import { FillBlankForm } from "./FillBlankForm";
import { TrueFalseForm } from "./TrueFalseForm";
import { MatchingForm } from "./MatchingForm";
import type { QuestionType } from "../types";

const QUESTION_TYPE_OPTIONS: {
  value: QuestionType;
  label: string;
}[] = [
  { value: "aneka_pilihan", label: "Aneka Pilihan" },
  { value: "isi_tempat_kosong", label: "Isi Tempat Kosong" },
  { value: "betul_salah", label: "Betul/Salah" },
  { value: "padanan", label: "Padanan" },
];

const DIFFICULTY_OPTIONS = [
  { value: "mudah", label: "Mudah" },
  { value: "sederhana", label: "Sederhana" },
  { value: "sukar", label: "Sukar" },
];

interface QuestionFormProps {
  mode: "cipta" | "edit";
  questionId?: number;
}

export function QuestionForm({ mode, questionId }: Readonly<QuestionFormProps>) {
  const router = useRouter();
  const createMutation = useQuestionCreate();
  const editMutation = useQuestionEdit();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data: subjects } = useSubjects();
  const subjectId = subjects?.[0]?.id ?? null;

  const { data: yearList } = useYears(subjectId);
  const yearId = yearList?.[0]?.id ?? null;

  const { data: topics, isLoading: topicsLoading } = useTopics(yearId);

  const {
    data: existingQuestion,
    isLoading: questionLoading,
    isError: questionError,
  } = useQuery({
    queryKey: ["questions", questionId],
    queryFn: () => getQuestionById(questionId!),
    enabled: mode === "edit" && questionId !== undefined,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    resolver: zodResolver(questionSchema),
    defaultValues:
      mode === "cipta"
        ? {
            jenis_soalan: "aneka_pilihan",
            topic_id: undefined,
            tahap_kesukaran: undefined,
            status: "aktif",
            teks_soalan: "",
            pilihan: { A: "", B: "", C: "", D: "" },
            jawapan_betul: { pilihan: undefined },
          }
        : {
            jenis_soalan: "aneka_pilihan",
          },
  });

  const watchedQuestionType = form.watch("jenis_soalan") as QuestionType | undefined;

  useEffect(() => {
    if (mode === "edit" && existingQuestion) {
      const question = existingQuestion;

      const baseValues: Record<string, unknown> = {
        jenis_soalan: question.jenis_soalan,
        topic_id: question.topic_id,
        tahap_kesukaran: question.tahap_kesukaran,
        status: question.status,
        teks_soalan: question.teks_soalan,
      };

      if (question.jenis_soalan === "aneka_pilihan") {
        baseValues.pilihan = question.pilihan ?? { A: "", B: "", C: "", D: "" };
        baseValues.jawapan_betul = question.jawapan_betul;
      } else if (question.jenis_soalan === "isi_tempat_kosong") {
        baseValues.pilihan = null;
        baseValues.jawapan_betul = question.jawapan_betul;
      } else if (question.jenis_soalan === "betul_salah") {
        baseValues.pilihan = null;
        baseValues.jawapan_betul = question.jawapan_betul;
      } else if (question.jenis_soalan === "padanan") {
        baseValues.pilihan = null;
        baseValues.jawapan_betul = question.jawapan_betul;
      }

      form.reset(baseValues);
    }
  }, [mode, existingQuestion, form]);

  const typeSubForm = useMemo(() => {
    switch (watchedQuestionType) {
      case "aneka_pilihan":
        return <MultipleChoiceForm />;
      case "isi_tempat_kosong":
        return <FillBlankForm />;
      case "betul_salah":
        return <TrueFalseForm />;
      case "padanan":
        return <MatchingForm />;
      default:
        return null;
    }
  }, [watchedQuestionType]);

  const isPending = createMutation.isPending || editMutation.isPending;

  function handleCancel() {
    if (form.formState.isDirty) {
      setShowCancelDialog(true);
    } else {
      router.push("/admin/bank-soalan");
    }
  }

  async function onSubmit(values: Record<string, unknown>) {
    const payload = { ...values };

    if (mode === "cipta") {
      await createMutation.mutateAsync(payload);
      router.push("/admin/bank-soalan");
    } else if (questionId) {
      await editMutation.mutateAsync({
        id: questionId,
        data: payload,
      });
      router.push("/admin/bank-soalan");
    }
  }

  // Loading state for edit mode
  if (mode === "edit" && questionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Error state for edit mode
  if (mode === "edit" && questionError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-4">Soalan tidak dijumpai.</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/bank-soalan")}
        >
          Kembali ke Bank Soalan
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/bank-soalan")}
          className="mb-2"
        >
          &larr; Kembali ke Bank Soalan
        </Button>
        <h1 className="text-2xl font-bold">
          {mode === "cipta" ? "Tambah Soalan Baharu" : "Edit Soalan"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Topic Dropdown */}
          <FormField
            control={form.control}
            name="topic_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Pilih Topik</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString() ?? undefined}
                  disabled={topicsLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih topik">
                        {(value: string | null) => topicLabel(value, topics, "Pilih topik")}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {topicsLoading ? (
                      <SelectItem value="loading" disabled>
                        Memuatkan...
                      </SelectItem>
                    ) : (
                      topics?.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {formatTopicLabel(t.id, t.nama)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Difficulty */}
          <FormField
            control={form.control}
            name="tahap_kesukaran"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Pilih Tahap Kesukaran</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tahap kesukaran">
                        {(value: string | null) => difficultyLabel(value, "Pilih tahap kesukaran")}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Question Type */}
          <FormField
            control={form.control}
            name="jenis_soalan"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Pilih Jenis Soalan</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                    disabled={mode === "edit"}
                    className="grid grid-cols-2 gap-3"
                  >
                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                      <div key={opt.value} className="flex items-center gap-2">
                        <RadioGroupItem
                          value={opt.value}
                          id={`jenis-${opt.value}`}
                          disabled={mode === "edit"}
                        />
                        <FormLabel
                          htmlFor={`jenis-${opt.value}`}
                          className="cursor-pointer font-normal"
                        >
                          {opt.label}
                        </FormLabel>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                {mode === "edit" && (
                  <FormDescription>
                    Jenis soalan tidak boleh ditukar semasa mengedit.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Question Text */}
          <FormField
            control={form.control}
            name="teks_soalan"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Teks Soalan</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tulis soalan anda di sini..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length ?? 0}/500 aksara
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type-specific form fields */}
          {typeSubForm}

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="aktif" id="status-aktif" />
                      <FormLabel
                        htmlFor="status-aktif"
                        className="cursor-pointer font-normal"
                      >
                        Aktif
                      </FormLabel>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value="tidak_aktif"
                        id="status-tidak-aktif"
                      />
                      <FormLabel
                        htmlFor="status-tidak-aktif"
                        className="cursor-pointer font-normal"
                      >
                        Tidak Aktif
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Error display */}
          {(createMutation.isError || editMutation.isError) && (
            <p className="text-sm text-destructive">
              {createMutation.error?.message ||
                editMutation.error?.message ||
                "Gagal menyimpan soalan. Sila cuba lagi."}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "cipta" ? "Simpan Soalan" : "Simpan Perubahan"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Batal
            </Button>
          </div>
        </form>
      </Form>

      {/* Cancel confirmation dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan Perubahan?</DialogTitle>
            <DialogDescription>
              Adakah anda pasti mahu batalkan? Data yang diisi akan hilang.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Kekal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setShowCancelDialog(false);
                router.push("/admin/bank-soalan");
              }}
            >
              Tinggalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
