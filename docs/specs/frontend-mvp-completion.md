# Frontend MVP Completion Spec

## Purpose

This spec defines all remaining work to make the SK Quiz frontend release-ready. Tests are deferred to a separate effort. Every group below is required before the frontend can be considered MVP-complete.

## Background

The frontend implements all nine MVP routes described in `docs/mvp-requirements.md`. Core features are working: role selection, admin question bank CRUD, quiz player with four answer types, result display, history search, and performance table.

What remains is hardening. Error boundaries, loading states, not-found pages, cross-feature dependency cleanup, validation, edge-case handling, and UX polish. These gaps make the app fragile in production. Filling them is the purpose of this spec.

## Context

Key files that influence multiple groups:

- `src/features/question-bank/types/index.ts` owns `Subject`, `Year`, `Topic`, `QuestionType`, `Difficulty`, `MultipleChoiceOptions`, `QuestionStatus`
- `src/features/question-bank/hooks/useReferenceData.ts` owns `useSubjects`, `useYears`, `useTopics`
- `src/features/question-bank/services/questionApi.ts` owns `getSubjects`, `getYears`, `getTopics`
- `src/features/quiz-taking/types/index.ts` re-exports `QuestionType`, `Difficulty` by deep-importing from question-bank
- `src/features/quiz-taking/components/QuizSelector.tsx` deep-imports `useSubjects`, `useYears`, `useTopics` from question-bank
- `src/features/results/components/PerformanceTable.tsx` deep-imports `useSubjects`, `useYears`, `useTopics` from question-bank
- `src/features/quiz-taking/hooks/useQuizState.ts` has no `TOGGLE_SUBMIT_DIALOG` action
- `src/features/quiz-taking/components/QuizPlayer.tsx` uses `as unknown as never` casts to toggle the submit dialog
- `src/features/quiz-taking/components/ResultDisplay.tsx` and `ResultDetail.tsx` use `JSON.stringify` for answer display

---

## Group A: Route-Level Error Boundaries

### Purpose

Catch server-side render crashes at route boundaries. Prevent a single broken route section from taking down unrelated UI. Follow the three-layer error model from `FRONTEND_GUIDELINE.md` Section 6, Layer 1.

### Acceptance Criteria

1. `src/app/error.tsx` exists and catches crashes on the root route tree.
2. `src/app/admin/error.tsx` exists and catches crashes within `/admin/*`.
3. `src/app/murid/error.tsx` exists and catches crashes within `/murid/*`.
4. Each error boundary:
   - Uses the Next.js `"use client"` error component pattern with `reset()`.
   - Shows a retry button labelled "Cuba Semula" that calls `reset()`.
   - Explains the failure in Bahasa Malaysia. Example: "Maaf, berlaku ralat semasa memuatkan halaman ini."
   - Never displays raw error messages, stack traces, or error codes to the user.
   - Uses `useEffect` to log the error to the console for diagnostics (not shown to users).
5. Boundaries are placed at the smallest practical scope within each route group. An error in `/admin/bank-soalan` should not take down the admin sidebar.

### Implementation Notes

- Each file follows the standard Next.js `error.tsx` contract: accepts `{ error: Error; reset: () => void }` props.
- The `src/app/error.tsx` boundary catches errors at the root (including the landing page). `src/app/admin/error.tsx` and `src/app/murid/error.tsx` catch errors inside their respective layout groups because each has its own `layout.tsx`.
- Use `startTransition` from React when calling `reset()` if the retry involves a navigation or data re-fetch that could suspend.
- The fallback UI should be a centered card with an icon (use `AlertTriangle` from lucide-react), a title, a description, and the retry button. Keep it minimal and consistent across all three files.

### Affected Files

- `src/app/error.tsx` (new)
- `src/app/admin/error.tsx` (new)
- `src/app/murid/error.tsx` (new)

---

## Group B: Route-Level Loading Boundaries

### Purpose

Show meaningful skeleton or spinner UI while route-level content loads. Prevent blank flashes on navigation. Follow `FRONTEND_GUIDELINE.md` Section 8 loading strategy.

### Acceptance Criteria

1. `src/app/admin/loading.tsx` exists alongside `src/app/admin/layout.tsx`.
2. `src/app/murid/loading.tsx` exists alongside `src/app/murid/layout.tsx`.
3. Each loading boundary:
   - Render a skeleton structure that matches the layout of the corresponding route group.
   - For the admin route: show the sidebar skeleton (narrow left panel with placeholder nav items) and a main content area with skeleton card blocks.
   - For the murid route: show the top navigation bar skeleton and a centered skeleton card for the quiz selector form.
   - Use the `Skeleton` component from `@/components/ui/skeleton` (shadcn/ui already installed).

### Implementation Notes

- Next.js automatically wraps the layout's `children` in a Suspense boundary when a `loading.tsx` file exists in the same directory. The loading UI shows while the route segment's async content resolves.
- The admin loading state should visually approximate the sidebar layout: a fixed-width vertical strip on the left with 3-4 skeleton lines for nav items, and a flex area on the right with a page header skeleton and 4 skeleton stat cards in a grid.
- The murid loading state should show the header bar skeleton and a single centered card skeleton (~400px wide) with placeholder lines for title, subtitle, dropdowns, and a button.
- The root route (`/`) does not need a `loading.tsx` because the landing page is a fully client-rendered role picker with no async data dependencies at the route level.

### Affected Files

- `src/app/admin/loading.tsx` (new)
- `src/app/murid/loading.tsx` (new)

---

## Group C: Route-Level Not Found Pages

### Purpose

Show a user-friendly "not found" page when a user navigates to a route that does not exist within a route group. The default Next.js 404 is minimal and does not match the app's Bahasa Malaysia UI language.

### Acceptance Criteria

1. `src/app/admin/not-found.tsx` exists and handles unknown `/admin/*` routes.
2. `src/app/murid/not-found.tsx` exists and handles unknown `/murid/*` routes.
3. Each not-found page:
   - Displays the heading "Halaman tidak dijumpai" in Bahasa Malaysia.
   - Includes a descriptive message such as "Halaman yang anda cari tidak wujud atau telah dialihkan."
   - Provides a "Kembali" button that navigates to the route group root (`/admin` or `/murid`).

### Implementation Notes

- Use the `notFound()` function import from `next/navigation` where needed, but these files are the actual `not-found.tsx` boundary components that render when `notFound()` is called or a route segment is unmatched.
- Each `not-found.tsx` must be a Client Component (`"use client"`) since it uses `useRouter` or `Link` for navigation.
- Keep the layout simple: centered content with an icon (use `FileQuestion` from lucide-react), heading, description, and the Kembali button as a `Link` to the route group root.
- Do not create a root-level `src/app/not-found.tsx` unless the root route needs custom 404 handling. The landing page handles the root path explicitly.

### Affected Files

- `src/app/admin/not-found.tsx` (new)
- `src/app/murid/not-found.tsx` (new)

---

## Group D: Cross-Feature Dependency Fixes

### Purpose

The current codebase has `quiz-taking` and `results` features importing types and hooks directly from `question-bank` internals. This violates the feature boundary rule in `FRONTEND_GUIDELINE.md` Section 3 and the architecture governance rule (Constitution Section 5). The fix is to promote genuinely shared types and hooks to global space, then have all features import from the shared sources.

### What Exists Today

Three specific violations:

1. `src/features/quiz-taking/types/index.ts` line 1:
   ```ts
   import type { QuestionType, Difficulty, MultipleChoiceOptions } from "../../question-bank/types";
   ```
2. `src/features/quiz-taking/components/QuizSelector.tsx` line 18:
   ```ts
   import { useSubjects, useYears, useTopics } from "../../question-bank/hooks/useReferenceData";
   ```
3. `src/features/results/components/PerformanceTable.tsx` lines 24-25:
   ```ts
   import { useTopics } from "../../question-bank/hooks/useReferenceData";
   import { useSubjects, useYears } from "../../question-bank/hooks/useReferenceData";
   ```

### Acceptance Criteria

#### D1: Shared Reference Types

Create `src/types/reference.ts` with these interfaces extracted from `src/features/question-bank/types/index.ts`:

```ts
export interface Subject {
  id: number;
  nama: string;
}

export interface Year {
  id: number;
  subject_id: number;
  nama: string;
}

export interface Topic {
  id: number;
  tahun_id: number;
  nama: string;
}
```

#### D2: Shared Question Types

Create `src/types/question.ts` with these types extracted from `src/features/question-bank/types/index.ts`:

```ts
export type QuestionType = "aneka_pilihan" | "isi_tempat_kosong" | "betul_salah" | "padanan";

export type Difficulty = "mudah" | "sederhana" | "sukar";

export type QuestionStatus = "aktif" | "tidak_aktif";

export interface MultipleChoiceOptions {
  A: string;
  B: string;
  C: string;
  D: string;
}
```

Note: do not move `Question`, `QuestionFilter`, `CorrectAnswer*` types, or any question-bank-specific domain types. Those stay in `question-bank/types`. Only the types used by `quiz-taking` go to shared space.

#### D3: Shared Reference Data Hook

Create `src/hooks/useReferenceData.ts` with the exact hook implementations from `src/features/question-bank/hooks/useReferenceData.ts`, but importing `getSubjects`, `getYears`, `getTopics` from `src/lib/referenceApi.ts` (see D4) and `Subject`, `Year`, `Topic` from `src/types/reference.ts`.

```ts
import { useQuery } from "@tanstack/react-query";
import { getSubjects, getYears, getTopics } from "@/lib/referenceApi";

export function useSubjects() {
  return useQuery({
    queryKey: ["reference", "subjects"],
    queryFn: getSubjects,
    staleTime: Infinity,
  });
}

export function useYears(subjectId: number | null) {
  return useQuery({
    queryKey: ["reference", "years", subjectId],
    queryFn: () => getYears(subjectId!),
    enabled: subjectId !== null,
    staleTime: Infinity,
  });
}

export function useTopics(yearId: number | null) {
  return useQuery({
    queryKey: ["reference", "topics", yearId],
    queryFn: () => getTopics(yearId!),
    enabled: yearId !== null,
    staleTime: Infinity,
  });
}
```

#### D4: Shared Reference API Functions

Create `src/lib/referenceApi.ts` with the three API functions extracted from `src/features/question-bank/services/questionApi.ts`:

```ts
import { apiGet } from "@/lib/api-client";
import type { Subject, Year, Topic } from "@/types/reference";

export async function getSubjects(): Promise<Subject[]> {
  return apiGet<Subject[]>("/subjects");
}

export async function getYears(subjectId: number): Promise<Year[]> {
  return apiGet<Year[]>(`/subjects/${subjectId}/tahun`);
}

export async function getTopics(yearId: number): Promise<Topic[]> {
  return apiGet<Topic[]>(`/tahun/${yearId}/topics`);
}
```

#### D5: Update question-bank to Re-export from Shared

Update `src/features/question-bank/types/index.ts`:
- Replace the inline definitions of `QuestionType`, `Difficulty`, `QuestionStatus`, `MultipleChoiceOptions`, `Subject`, `Year`, `Topic` with re-exports from `@/types/question` and `@/types/reference`.
- Keep `Question`, `QuestionFilter`, `CorrectAnswer*` types (those are question-bank-specific).

Update `src/features/question-bank/hooks/useReferenceData.ts`:
- Replace the inline implementations with re-exports from `@/hooks/useReferenceData`.

Update `src/features/question-bank/services/questionApi.ts`:
- Update imports of `Subject`, `Year`, `Topic` to come from `@/types/reference` instead of `../types`.

#### D6: Fix Cross-Feature Imports

Update `src/features/quiz-taking/types/index.ts` line 1:
- Change to `import type { QuestionType, Difficulty, MultipleChoiceOptions } from "@/types/question";`

Update `src/features/quiz-taking/components/QuizSelector.tsx` line 18:
- Change to `import { useSubjects, useYears, useTopics } from "@/hooks/useReferenceData";`

Update `src/features/results/components/PerformanceTable.tsx` lines 24-25:
- Change both imports to `import { useSubjects, useYears, useTopics } from "@/hooks/useReferenceData";`

#### D7: Verify No Broken Imports

After all changes, verify that:
- No file outside `question-bank` imports from `@/features/question-bank/hooks/useReferenceData` or `@/features/question-bank/types` for the shared types.
- The question-bank feature still compiles and works (its types and hooks re-export from shared).
- `src/features/question-bank/index.ts` barrel exports still work (it exports `QuestionType` and `Difficulty`, now via re-export chain from shared types).

### Implementation Notes

- This is a pure refactor. No behavior should change. All existing API calls, query keys, cache behavior, and UI rendering must remain identical.
- The `staleTime: Infinity` setting is preserved because reference data (subjects, years, topics) changes very rarely.
- After this refactor, any future feature that needs subjects/years/topics should import from `@/hooks/useReferenceData` and `@/types/reference`, never from question-bank internals.
- The question-bank service file `questionApi.ts` still exports `getSubjects`, `getYears`, `getTopics` for backward compatibility with question-bank hooks that re-export from shared. No consumer should rely on this path going forward.

### Affected Files

- `src/types/reference.ts` (new)
- `src/types/question.ts` (new)
- `src/hooks/useReferenceData.ts` (new)
- `src/lib/referenceApi.ts` (new)
- `src/features/question-bank/types/index.ts` (edit: re-export from shared)
- `src/features/question-bank/hooks/useReferenceData.ts` (edit: re-export from shared)
- `src/features/question-bank/services/questionApi.ts` (edit: update imports)
- `src/features/quiz-taking/types/index.ts` (edit: fix import)
- `src/features/quiz-taking/components/QuizSelector.tsx` (edit: fix import)
- `src/features/results/components/PerformanceTable.tsx` (edit: fix import)

---

## Group E: Zod Validation for Quiz Selector

### Purpose

Per MVP spec Laluan 7 (Section 3.7), the quiz start form must validate input with Zod before submission. Currently `QuizSelector.tsx` uses manual `useState`-based error strings. This group brings it in line with the `QuestionForm` pattern which already uses `react-hook-form` with `@hookform/resolvers/zod`.

### Acceptance Criteria

1. `src/features/quiz-taking/schemas/kuiz.ts` exists with a Zod schema:
   ```ts
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
   ```
2. `QuizSelector.tsx` is refactored to use `react-hook-form` with `zodResolver`:
   - Remove manual `nameError`, `topicError`, `difficultyError` state variables.
   - Replace with `useForm<KuizStartValues>({ resolver: zodResolver(kuizStartSchema) })`.
   - Use `register` and `setValue` for form fields instead of `useState`.
   - Use `formState.errors` for error display.
   - Use `handleSubmit` to trigger validation before calling `startMutation.mutate`.
3. `localStorage` behavior is preserved:
   - On mount, read `sk_quiz_nama_murid` from localStorage and call `setValue("nama_peserta", savedName)` if found.
   - In the submit handler (after successful validation), call `localStorage.setItem("sk_quiz_nama_murid", data.nama_peserta.trim())`.
4. The topic dropdown still needs `setValue` because `Select` from shadcn/ui works with `onValueChange`, not `register`. Use `Controller` from react-hook-form or manually call `setValue("topic_id", Number(value))`.
5. The difficulty dropdown works the same way: `setValue("tahap_kesukaran", value)` where value is the enum string.

### Implementation Notes

- The `topic_id` type in the Zod schema is `number`, but the shadcn `Select` works with strings. Use `Controller` and convert on change: `field.onChange(Number(value))`.
- Pre-fill the name from localStorage in a `useEffect` similar to the current code (lines 38-41), but use `setValue` from `useForm` instead of `setName`.
- Remove the manual `valid` flag and per-field error state. The schema handles all three fields.
- Keep the `startMutation.isError` display below the button. Add form-level error display from `formState.errors.root` if needed.
- The `startMutation.isPending` check is still used to disable the button during submission.

### Affected Files

- `src/features/quiz-taking/schemas/kuiz.ts` (new)
- `src/features/quiz-taking/components/QuizSelector.tsx` (edit: refactor to react-hook-form + zod)

---

## Group F: Pending Attempt Detection

### Purpose

Per MVP spec Laluan 7 edge case: if a student already has a `dalam_progres` attempt for the same topic and difficulty combination, show a choice between continuing the existing attempt and starting a new one.

### Acceptance Criteria

1. `src/features/quiz-taking/hooks/usePendingAttempt.ts` exists with:
   ```ts
   import { useQuery } from "@tanstack/react-query";
   import { getAttemptList } from "@/features/results/services/resultApi";

   export function usePendingAttempt(namaPeserta: string, topicId: number, tahapKesukaran: string) {
     return useQuery({
       queryKey: ["pending-attempt", namaPeserta, topicId, tahapKesukaran],
       queryFn: () =>
         getAttemptList({
           participant_name: namaPeserta,
           topic_id: topicId,
           difficulty: tahapKesukaran,
           status: "dalam_progres",
           page: 1,
           page_size: 1,
         }),
       enabled: namaPeserta.length > 0 && topicId > 0 && tahapKesukaran.length > 0,
     });
   }
   ```
2. `QuizSelector.tsx` integrates the hook:
   - After form submission (valid Zod data available), call `usePendingAttempt` with the form values.
   - If a pending attempt exists (response has `data.length > 0`), show a dialog or card with:
     - Message: "Anda mempunyai kuiz yang belum diselesaikan."
     - "Sambung" button: navigates to `/murid/kuiz/{pendingAttempt.id}`
     - "Mula Baru" button: proceeds with `startMutation.mutate` to create a new attempt
   - If no pending attempt, proceed directly with `startMutation.mutate`.
3. The pending attempt check must be reactive: it should re-check when the user changes topic or difficulty and has entered a name.

### Implementation Notes

- The hook depends on `getAttemptList` from the results feature. This is acceptable because the function is a thin wrapper over `apiGet`. If this creates a dependency concern, the API function can be extracted later, but for now the import path is direct.
- The pending attempt dialog can reuse the existing `SubmitDialog` component pattern or be a simpler inline `Alert` component.
- The check should only trigger after the form is valid. Do not poll for pending attempts while the user is still filling the form with invalid data.
- Consider implementing this as a two-step flow: user clicks "Mula Kuiz", form validates, then pending check runs. If pending found, show the choice dialog. If not, proceed.

### Affected Files

- `src/features/quiz-taking/hooks/usePendingAttempt.ts` (new)
- `src/features/quiz-taking/components/QuizSelector.tsx` (edit: add pending attempt check)

---

## Group G: 24-Hour Quiz Warning

### Purpose

Per MVP spec Laluan 8 edge case: if `masa_mula` exceeds 24 hours from the current time, show a warning banner in the QuizPlayer to inform the user the quiz is old.

### Acceptance Criteria

1. In `QuizPlayer.tsx`, after successfully loading an attempt with `status === "dalam_progres"`, check:
   ```ts
   const isOver24Hours = attempt && new Date(attempt.masa_mula).getTime() < Date.now() - 24 * 60 * 60 * 1000;
   ```
2. If `isOver24Hours` is true, render a warning banner at the top of the quiz content area (below the quiz header bar). The banner should:
   - Use a yellow/amber background to indicate a warning (not an error).
   - Show the message: "Kuiz ini dimulakan lebih 24 jam lalu."
   - Use the `AlertTriangle` icon from lucide-react.
   - Be dismissible or simply informational (non-blocking).
3. The warning does not prevent the user from continuing or submitting the quiz. It is purely informational.

### Implementation Notes

- Place the banner between the quiz header bar (line 160 in current code) and the question display area (line 173).
- Use a styled `div` with amber background classes rather than a shadcn `Alert` component if simpler. The existing codebase uses Tailwind directly for most layout.
- The check should happen inside the rendering path after the loading and error states are handled but before the quiz answer UI.

### Affected Files

- `src/features/quiz-taking/components/QuizPlayer.tsx` (edit: add 24-hour warning)

---

## Group H: SubmitDialog Dispatch Fix

### Purpose

Currently `QuizPlayer.tsx` uses `as unknown as never` casts to toggle the `showSubmitDialog` state in the reducer. This is a type-safety violation. The fix adds a proper `TOGGLE_SUBMIT_DIALOG` action to the reducer and removes the unsafe casts.

### Acceptance Criteria

1. In `src/features/quiz-taking/types/index.ts`, add to the `QuizAction` union type:
   ```ts
   | { type: "TOGGLE_SUBMIT_DIALOG"; open: boolean }
   ```
2. In `src/features/quiz-taking/hooks/useQuizState.ts`, add a case to the `quizReducer`:
   ```ts
   case "TOGGLE_SUBMIT_DIALOG":
     return { ...state, showSubmitDialog: action.open };
   ```
3. In `QuizPlayer.tsx`, replace the two `as unknown as never` dispatch calls:
   - Line 155: Change `dispatch({ ...state, showSubmitDialog: true } as unknown as never)` to `dispatch({ type: "TOGGLE_SUBMIT_DIALOG", open: true })`
   - Lines 203-206: Change the `onOpenChange` handler from:
     ```ts
     dispatch({ ...state, showSubmitDialog: open } as unknown as never);
     ```
     to:
     ```ts
     dispatch({ type: "TOGGLE_SUBMIT_DIALOG", open });
     ```

### Implementation Notes

- The `SubmitDialog` component uses `onOpenChange` to close itself and `onSubmit` from `NavigationPanel` to open itself. This is a clean two-way pattern.
- After this fix, there should be zero `as unknown as never` casts in the entire codebase.
- The `NavigationPanel` already receives `onSubmit` as a prop and calls it directly (line 65). No change needed there.

### Affected Files

- `src/features/quiz-taking/types/index.ts` (edit: add action type)
- `src/features/quiz-taking/hooks/useQuizState.ts` (edit: add reducer case)
- `src/features/quiz-taking/components/QuizPlayer.tsx` (edit: replace casts)

---

## Group I: History Debounce

### Purpose

Per MVP spec Laluan 9: the search input in `HistoryList.tsx` fires an API call on every keystroke. With `participant_name` using `ILIKE` on the backend, this means a full table scan per character. Add a 500ms debounce to reduce server load.

### Acceptance Criteria

1. `src/hooks/useDebounce.ts` exists with:
   ```ts
   import { useState, useEffect } from "react";

   export function useDebounce<T>(value: T, delay: number): T {
     const [debouncedValue, setDebouncedValue] = useState<T>(value);

     useEffect(() => {
       const timer = setTimeout(() => setDebouncedValue(value), delay);
       return () => clearTimeout(timer);
     }, [value, delay]);

     return debouncedValue;
   }
   ```
2. In `HistoryList.tsx`:
   - Import `useDebounce` from `@/hooks/useDebounce`.
   - Keep the `searchName` state for the input value (controlled input, instant feedback).
   - Create `const debouncedSearchName = useDebounce(searchName, 500);`.
   - Pass `debouncedSearchName` to `useHistoryList` instead of `searchName`.
   - The `useHistoryList` hook's `queryKey` will now change only when `debouncedSearchName` changes, triggering a fetch after 500ms of inactivity.

### Implementation Notes

- The user sees characters appear instantly in the input. The API call is delayed. This is the standard debounce pattern for search inputs.
- `useDebounce` is placed in `src/hooks/` because it is a generic utility hook with no domain dependency. Other features may reuse it later.
- The `useEffect` cleanup clears the timer, ensuring only the final value after the user stops typing triggers a fetch.

### Affected Files

- `src/hooks/useDebounce.ts` (new)
- `src/features/results/components/HistoryList.tsx` (edit: apply debounce)

---

## Group J: Human-Readable Answer Display

### Purpose

`ResultDisplay.tsx` (lines 99 and 106) and `ResultDetail.tsx` display raw JSON objects via `JSON.stringify` for student answers and correct answers. This is not user-friendly. Replace with formatted text specific to each question type.

### Acceptance Criteria

1. `src/features/quiz-taking/utils/formatAnswer.ts` exists with:
   ```ts
   import type { AnswerData } from "../types";

   function formatAnswer(jenisSoalan: string, jawapan: AnswerData | Record<string, unknown> | null): string {
     if (!jawapan) return "Tiada jawapan";

     switch (jenisSoalan) {
       case "aneka_pilihan": {
         const data = jawapan as { pilihan?: string };
         return data.pilihan && data.pilihan.length > 0 ? data.pilihan : "Tiada jawapan";
       }
       case "isi_tempat_kosong": {
         const data = jawapan as { teks?: string };
         return data.teks && data.teks.trim().length > 0 ? data.teks : "Tiada jawapan";
       }
       case "betul_salah": {
         const data = jawapan as { nilai?: boolean };
         if (data.nilai === undefined || data.nilai === null) return "Tiada jawapan";
         return data.nilai ? "Betul" : "Salah";
       }
       case "padanan": {
         const data = jawapan as { pasangan?: { kiri: string; kanan: string }[] };
         if (!data.pasangan || data.pasangan.length === 0) return "Tiada jawapan";
         return data.pasangan.map((p) => `${p.kiri} → ${p.kanan}`).join("; ");
       }
       default:
         return "Jenis soalan tidak dikenali";
     }
   }

   function formatCorrectAnswer(jenisSoalan: string, jawapanBetul: Record<string, unknown> | null): string {
     if (!jawapanBetul) return "Tiada jawapan betul";

     switch (jenisSoalan) {
       case "aneka_pilihan": {
         const data = jawapanBetul as { pilihan?: string };
         return data.pilihan ?? "Tiada data";
       }
       case "isi_tempat_kosong": {
         const data = jawapanBetul as { jawapan_diterima?: string[] };
         if (!data.jawapan_diterima || data.jawapan_diterima.length === 0) return "Tiada data";
         return data.jawapan_diterima.join(" / ");
       }
       case "betul_salah": {
         const data = jawapanBetul as { nilai?: boolean };
         return data.nilai ? "Betul" : "Salah";
       }
       case "padanan": {
         const data = jawapanBetul as { pasangan?: { kiri: string; kanan: string }[] };
         if (!data.pasangan || data.pasangan.length === 0) return "Tiada data";
         return data.pasangan.map((p) => `${p.kiri} → ${p.kanan}`).join("; ");
       }
       default:
         return "Jenis soalan tidak dikenali";
     }
   }

   export { formatAnswer, formatCorrectAnswer };
   ```
2. In `ResultDisplay.tsx`:
   - Import `formatAnswer` and `formatCorrectAnswer` from `../utils/formatAnswer`.
   - Replace `JSON.stringify(currentDetail.jawapan_murid)` on line 99 with `formatAnswer(currentDetail.jenis_soalan, currentDetail.jawapan_murid)`.
   - Replace `JSON.stringify(currentDetail.jawapan_betul)` on line 106 with `formatCorrectAnswer(currentDetail.jenis_soalan, currentDetail.jawapan_betul)`.
3. In `ResultDetail.tsx` (the dialog in `results/components/ResultDetail.tsx`):
   - The current code only shows `teks_soalan`, `jenis_soalan`, and `adalah_betul`. It does not show `jawapan_murid` or `jawapan_betul`. If the MVP spec requires per-question detail in the history dialog, add `jawapan_murid` and `jawapan_betul` display using the same formatters. Otherwise, leave `ResultDetail.tsx` as-is for now and verify with the MVP spec.
   - Actually, check: `ResultDetail.tsx` in `results/components` renders `ResultDetail` (the dialog version). This component does NOT currently show `jawapan_murid` or `jawapan_betul`. It shows `teks_soalan` and correctness. The `ResultDisplay.tsx` in `quiz-taking/components` is the one that shows after submit. Only `ResultDisplay.tsx` uses `JSON.stringify`. So the fix is only needed in `ResultDisplay.tsx`.

### Implementation Notes

- The utility file is placed in `quiz-taking/utils` because it depends on types from `quiz-taking/types`. It formats quiz-taking-specific answer data. If needed by `results` later, it can be promoted to `src/utils/`.
- `ResultDetail.tsx` in `quiz-taking/components/ResultDisplay.tsx` is a post-submit result view shown within the quiz flow. It uses `QuizResult` and `QuestionDetail` types from `quiz-taking/types`.
- The `results/components/ResultDetail.tsx` is the dialog shown in the admin performance table and student history. It uses `AttemptDetail` and `DetailItem` types from `results/types`. These types have `jenis_soalan: string` which is compatible with the formatters.
- Both `jawapan_murid` and `jawapan_betul` fields in the detail types are typed as `Record<string, unknown> | null`. The formatters accept this shape.

### Affected Files

- `src/features/quiz-taking/utils/formatAnswer.ts` (new)
- `src/features/quiz-taking/components/ResultDisplay.tsx` (edit: use formatters)

---

## Group K: Verifications

### Purpose

Walk through the application to verify critical UX paths are complete and consistent. These are manual checks, not code changes, but any gaps found must be fixed as part of this group.

### K1: Answer Component State Coverage

Verify all four answer component types handle all states:

| Component             | States to Verify                                                   |
| --------------------- | ------------------------------------------------------------------ |
| `MultipleChoiceAnswer` | null answer (no selection), single selection, re-selection (A to B) |
| `FillBlankAnswer`      | null answer (empty input), text entered, whitespace-only entry      |
| `TrueFalseAnswer`      | null answer (neither selected), Betul selected, Salah selected      |
| `MatchingAnswer`       | Currently shows "Ciri padanan dalam pembangunan." Verify this is acceptable for MVP or needs implementation |

**Acceptance criteria:**
- All components render without console errors in all states.
- Selections are properly stored in the answer draft and survive navigation between questions.
- SessionStorage persistence works: refresh the page during a quiz, answers should be restored.
- The `MatchingAnswer` placeholder is acceptable for MVP. If not, implement a basic dropdown-based matching UI where each `kiri` item has a `kanan` dropdown.

### K2: "Kembali" Navigation Links

Verify navigation links exist on all sub-pages:

| Page                                | Expected Navigation                                     | Status     |
| ----------------------------------- | ------------------------------------------------------- | ---------- |
| `/admin/`                           | Sidebar nav to Dashboard, Bank Soalan, Prestasi Murid   | Exists     |
| `/admin/bank-soalan/`               | Sidebar nav. "Tambah Soalan" button at top              | Exists     |
| `/admin/bank-soalan/baru/`          | "Kembali ke Bank Soalan" link at top                    | To verify  |
| `/admin/bank-soalan/[id]/` (edit)   | "Kembali ke Bank Soalan" link at top                    | To verify  |
| `/admin/prestasi/`                  | Sidebar nav                                             | Exists     |
| `/murid/`                           | Header nav: Sejarah, Tukar Peranan                      | Exists     |
| `/murid/kuiz/[attemptId]/`          | Result view: "Kembali ke Dashboard" button              | Exists     |
| `/murid/sejarah/`                   | Header nav. "Mula Kuiz Pertama" button if empty         | Exists     |

**Acceptance criteria:**
- The "Kembali ke Bank Soalan" link exists on both the create and edit question pages. Check `QuestionForm.tsx`.
- If missing, add a `Link` component at the top of `QuestionForm.tsx` pointing to `/admin/bank-soalan` with label "← Kembali ke Bank Soalan".

### K3: Admin Dashboard Quick Links

Verify the admin dashboard has quick links as specified in MVP Laluan 2:

- "Tambah Soalan Baru" button at top right (linking to `/admin/bank-soalan/baru`)
- "Urus Bank Soalan" card/button (linking to `/admin/bank-soalan`)
- "Lihat Prestasi Murid" card/button (linking to `/admin/prestasi`)

**Acceptance criteria:**
- All three links exist and navigate to the correct routes.
- Links are accessible and clearly labeled in Bahasa Malaysia.

### Implementation Notes for K1-K3

- These are verification tasks. Do not rewrite components that are working. Only fix gaps.
- For K1, the `MatchingAnswer` component currently shows a placeholder. Check the MVP requirements doc (Laluan 8) to see if matching UI is required. The answer section says "Senarai item kiri dengan dropdown pemilih kanan untuk setiap satu. Atau antaramuka drag-and-drop ringkas." The placeholder should be replaced with at least a dropdown-based UI if time permits. If deferred, note it as a known limitation.
- For K2, `QuestionForm.tsx` is shared between create and edit flows. One "Kembali" link at the top serves both pages.

### Affected Files (if gaps found)

- `src/features/question-bank/components/QuestionForm.tsx` (possible edit: add Kembali link)
- `src/features/quiz-taking/components/MatchingAnswer.tsx` (possible edit: implement basic matching UI)

---

## Summary of All New Files

| File                                                   | Group |
| ------------------------------------------------------ | ----- |
| `src/app/error.tsx`                                    | A     |
| `src/app/admin/error.tsx`                              | A     |
| `src/app/murid/error.tsx`                              | A     |
| `src/app/admin/loading.tsx`                            | B     |
| `src/app/murid/loading.tsx`                            | B     |
| `src/app/admin/not-found.tsx`                          | C     |
| `src/app/murid/not-found.tsx`                          | C     |
| `src/types/reference.ts`                               | D     |
| `src/types/question.ts`                                | D     |
| `src/hooks/useReferenceData.ts`                        | D     |
| `src/lib/referenceApi.ts`                              | D     |
| `src/features/quiz-taking/schemas/kuiz.ts`             | E     |
| `src/features/quiz-taking/hooks/usePendingAttempt.ts`  | F     |
| `src/hooks/useDebounce.ts`                             | I     |
| `src/features/quiz-taking/utils/formatAnswer.ts`       | J     |

## Summary of All Edited Files

| File                                                   | Group | Change                          |
| ------------------------------------------------------ | ----- | ------------------------------- |
| `src/features/question-bank/types/index.ts`            | D     | Re-export from shared types     |
| `src/features/question-bank/hooks/useReferenceData.ts` | D     | Re-export from shared hook      |
| `src/features/question-bank/services/questionApi.ts`   | D     | Update type imports             |
| `src/features/quiz-taking/types/index.ts`              | D, H  | Fix import, add action type     |
| `src/features/quiz-taking/hooks/useQuizState.ts`       | H     | Add TOGGLE_SUBMIT_DIALOG case   |
| `src/features/quiz-taking/components/QuizSelector.tsx` | E, F  | Zod refactor, pending attempt   |
| `src/features/quiz-taking/components/QuizPlayer.tsx`   | G, H  | 24h warning, dispatch fix       |
| `src/features/quiz-taking/components/ResultDisplay.tsx`| J     | Human-readable answer display   |
| `src/features/results/components/PerformanceTable.tsx` | D     | Fix import path                 |
| `src/features/results/components/HistoryList.tsx`      | I     | Apply debounce                  |

## Execution Order

1. **Group D** first. All other changes depend on clean types. Do this before any other group.
2. **Group H** second. The dispatch fix is a type-safety improvement that overlaps with Group D's type changes.
3. **Groups A, B, C** in any order. These are independent route-level files.
4. **Group E** after Groups D and H. The Zod refactor touches QuizSelector which is also affected by Group F.
5. **Group F** after Group E. The pending attempt check integrates into the already-refactored QuizSelector.
6. **Group G** after Group H. The 24-hour warning touches QuizPlayer, which is cleaned up by Group H.
7. **Group I** independently. The debounce hook has no dependencies.
8. **Group J** independently. The format utility has no dependencies.
9. **Group K** last. Walk through the app and fix remaining gaps.

## Definition of Done

- All 14 new files created and working.
- All 10 existing files edited and verified.
- Zero `as unknown as never` casts in the codebase.
- Zero cross-feature deep imports (no `../../feature-name/` paths between features).
- All error boundaries, loading states, and not-found pages render correctly when triggered.
- The quiz start form validates with Zod and shows localized errors.
- Pending attempt detection shows the choice dialog when a `dalam_progres` attempt exists.
- The 24-hour warning banner appears for old quizzes.
- History search debounces at 500ms.
- Answer display uses human-readable text instead of raw JSON.
- All navigation links and quick links verified.
