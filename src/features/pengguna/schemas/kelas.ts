import { z } from "zod";

export const kelasFormSchema = z.object({
  nama: z
    .string()
    .min(1, "Sila isi nama kelas.")
    .max(50, "Nama kelas maksimum 50 aksara."),
  darjah: z.string().min(1, "Sila pilih darjah."),
});

export type KelasFormValues = z.infer<typeof kelasFormSchema>;
