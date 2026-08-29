"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface StudentViewState {
  aktif: boolean;
  masukkan: () => void;
  keluar: () => void;
}

export const useStudentView = create<StudentViewState>()(
  persist(
    (set) => ({
      aktif: false,
      masukkan: () => set({ aktif: true }),
      keluar: () => set({ aktif: false }),
    }),
    {
      name: "sk_quiz_mod_pratonton",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
