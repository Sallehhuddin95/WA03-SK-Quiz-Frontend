import { z } from "zod";

export const createUserSchema = z
  .object({
    role: z.enum(["admin", "murid"], {
      message: "Sila pilih peranan.",
    }),
    nama_first: z.string().min(1, "Sila isi nama pertama."),
    nama_last: z.string().min(1, "Sila isi nama akhir."),
    username: z
      .string()
      .min(1, "Sila isi nama pengguna.")
      .max(50, "Nama pengguna maksimum 50 aksara."),
    kata_laluan_awal: z
      .string()
      .min(8, "Kata laluan sekurang-kurangnya 8 aksara."),
    kelas_id: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "murid" && !data.kelas_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["kelas_id"],
        message: "Sila pilih kelas.",
      });
    }
  });

export const editUserSchema = z.object({
  nama_first: z.string().min(1, "Sila isi nama pertama."),
  nama_last: z.string().min(1, "Sila isi nama akhir."),
  kelas_id: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  kata_laluan_baru: z
    .string()
    .min(8, "Kata laluan sekurang-kurangnya 8 aksara."),
});

export type CreateUserValues = z.infer<typeof createUserSchema>;
export type EditUserValues = z.infer<typeof editUserSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
