import { z } from "zod";

export const kuizStartSchema = z.object({
  topic_id: z.number().int().positive("Sila pilih topik."),
  tahap_kesukaran: z.enum(["mudah", "sederhana", "sukar"], {
    message: "Sila pilih tahap kesukaran.",
  }),
});

export type KuizStartValues = z.infer<typeof kuizStartSchema>;
