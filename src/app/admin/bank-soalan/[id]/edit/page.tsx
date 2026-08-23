"use client";

import { useParams } from "next/navigation";
import { QuestionForm } from "@/features/question-bank";

export default function EditQuestionPage() {
  const params = useParams();
  const id = Number(params.id);

  return <QuestionForm mode="edit" questionId={id} />;
}
