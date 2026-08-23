import { z } from "zod";

const questionTextSchema = z
  .string()
  .min(5, "Teks soalan mesti sekurang-kurangnya 5 aksara.")
  .max(500, "Teks soalan maksimum 500 aksara.")
  .refine((v) => v.trim().length > 0, "Teks soalan tidak boleh kosong.");

const baseQuestionSchema = z.object({
  topic_id: z.number().int().positive("Pilih topik."),
  tahap_kesukaran: z.enum(["mudah", "sederhana", "sukar"], {
    message: "Pilih tahap kesukaran.",
  }),
  status: z.enum(["aktif", "tidak_aktif"]).default("aktif"),
  teks_soalan: questionTextSchema,
});

export const multipleChoiceSchema = baseQuestionSchema.extend({
  jenis_soalan: z.literal("aneka_pilihan"),
  pilihan: z.object({
    A: z.string().min(1, "Pilihan A tidak boleh kosong."),
    B: z.string().min(1, "Pilihan B tidak boleh kosong."),
    C: z.string().min(1, "Pilihan C tidak boleh kosong."),
    D: z.string().min(1, "Pilihan D tidak boleh kosong."),
  }),
  jawapan_betul: z.object({
    pilihan: z.enum(["A", "B", "C", "D"], {
      message: "Pilih jawapan betul.",
    }),
  }),
});

export const fillBlankSchema = baseQuestionSchema.extend({
  jenis_soalan: z.literal("isi_tempat_kosong"),
  pilihan: z.null().optional(),
  teks_soalan: questionTextSchema.refine(
    (v) => v.includes("______"),
    "Teks soalan mesti mengandungi penanda tempat kosong '______'."
  ),
  jawapan_betul: z.object({
    jawapan_diterima: z
      .array(
        z
          .string()
          .min(1, "Jawapan tidak boleh kosong.")
          .max(100, "Jawapan maksimum 100 aksara.")
      )
      .min(1, "Sekurang-kurangnya satu jawapan diperlukan.")
      .max(10, "Maksimum 10 jawapan diterima.")
      .refine(
        (arr) => {
          const normalized = arr.map((v) => v.trim().toLowerCase());
          return new Set(normalized).size === normalized.length;
        },
        "Jawapan diterima tidak boleh mempunyai duplikasi."
      ),
  }),
});

export const trueFalseSchema = baseQuestionSchema.extend({
  jenis_soalan: z.literal("betul_salah"),
  pilihan: z.null().optional(),
  jawapan_betul: z.object({
    nilai: z.boolean({ message: "Pilih Betul atau Salah." }),
  }),
});

export const matchingSchema = baseQuestionSchema.extend({
  jenis_soalan: z.literal("padanan"),
  pilihan: z.null().optional(),
  jawapan_betul: z.object({
    pasangan: z
      .array(
        z.object({
          kiri: z.string().min(1, "Item kiri tidak boleh kosong."),
          kanan: z.string().min(1, "Item kanan tidak boleh kosong."),
        })
      )
      .min(2, "Sekurang-kurangnya 2 pasangan diperlukan.")
      .max(6, "Maksimum 6 pasangan dibenarkan.")
      .refine(
        (arr) => {
          const kiriSet = new Set(arr.map((p) => p.kiri.trim().toLowerCase()));
          return kiriSet.size === arr.length;
        },
        "Semua item kiri mesti unik."
      )
      .refine(
        (arr) => {
          const kananSet = new Set(
            arr.map((p) => p.kanan.trim().toLowerCase())
          );
          return kananSet.size === arr.length;
        },
        "Semua item kanan mesti unik."
      ),
  }),
});

export const questionSchema = z.discriminatedUnion("jenis_soalan", [
  multipleChoiceSchema,
  fillBlankSchema,
  trueFalseSchema,
  matchingSchema,
]);

export type QuestionFormValues = z.infer<typeof questionSchema>;
