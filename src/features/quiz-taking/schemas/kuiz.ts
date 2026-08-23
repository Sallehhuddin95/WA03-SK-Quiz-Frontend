import { z } from "zod";

export const kuizStartSchema = z.object({
  nama_peserta: z
    .string()
    .min(1, "Sila isi nama anda.")
    .max(50, "Nama maksimum 50 aksara.")
    .refine((v) => v.trim().length > 0, "Nama tidak boleh kosong."),
  topic_id: z.number().int().positive("Sila pilih topik."),
  tahap_kesukaran: z.enum(["mudah", "sederhana", "sukar"], {
    message: "Sila pilih tahap kesukaran.",
  }),
});

export type KuizStartValues = z.infer<typeof kuizStartSchema>;
