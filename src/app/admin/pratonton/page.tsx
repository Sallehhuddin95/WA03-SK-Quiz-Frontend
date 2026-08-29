"use client";

import { useEffect } from "react";
import { useStudentView } from "@/features/auth";
import { PreviewQuestionList } from "@/features/pengguna";

export default function PratontonPage() {
  const masukkan = useStudentView((state) => state.masukkan);
  const keluar = useStudentView((state) => state.keluar);

  useEffect(() => {
    masukkan();
    return () => keluar();
  }, [masukkan, keluar]);

  return <PreviewQuestionList />;
}
