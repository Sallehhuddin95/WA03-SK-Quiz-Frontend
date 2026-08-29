import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Sila isi nama pengguna."),
  kata_laluan: z.string().min(1, "Sila isi kata laluan."),
});

export const changePasswordSchema = z.object({
  kata_laluan_semasa: z.string().min(1, "Sila isi kata laluan semasa."),
  kata_laluan_baru: z.string().min(1, "Sila isi kata laluan baru."),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
