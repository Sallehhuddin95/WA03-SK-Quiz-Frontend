# Frontend Auth Implementation Spec

## Purpose

This spec defines the frontend work for the approved authentication and RBAC design (ADR 0006 and ADR 0007 in `docs/adr/`, backend contracts in the backend repo's `specs/api/`). It replaces the client-side role picker with real session authentication, adds the auth feature folder, rewrites routing and proxy, and updates quiz-taking and results to the new session model.

The backend is the security authority. Every rule in this spec assumes the backend enforces sessions, permissions, and kelas scope. Frontend behavior is UX support, not access control.

## Context

Current state that this spec changes:

- `src/hooks/useRole.tsx` stores the role in `localStorage` under `sk_quiz_peranan` and writes a `sk_quiz_peranan` cookie for the proxy.
- `src/proxy.ts` reads that cookie and blocks routes by role.
- `src/app/page.tsx` is a role picker with "Saya Guru" and "Saya Murid" cards.
- `src/lib/bff-proxy.ts` forwards requests upstream without cookies and drops upstream `set-cookie` headers.
- `src/features/quiz-taking/schemas/kuiz.ts` requires `nama_peserta`; `QuizSelector.tsx` reads and writes `sk_quiz_nama_murid` in localStorage.
- `src/features/quiz-taking/hooks/usePendingAttempt.ts` takes `namaPeserta` as an argument.

Target state: sessions come from the backend (`sk_quiz_sesi` cookie), roles come from `GET /auth/me`, and the murid name is derived server-side from the account. All staff and murid surfaces use session data.

## Related Documents

- `docs/adr/0006-use-db-backed-sessions-with-bff-cookie-relay.md`
- `docs/adr/0007-adopt-rbac-with-kelas-scoping.md`
- `docs/shared/authentication.md`
- `docs/frontend/FRONTEND_GUIDELINE.md` Sections 3, 6, 7
- Backend specs: `specs/api/auth.md`, `specs/api/users.md`, `specs/api/kelas.md`, `specs/api/quiz-attempts.md`

---

## Group A: Auth Feature Folder

### Purpose

Create `src/features/auth/` as the single owner of session behavior: session state, login, logout, password change, and the student view mode. This follows ADR 0001 feature-driven structure.

### Acceptance Criteria

1. `src/features/auth/types/index.ts` exists with:

   ```ts
   export type Role = "super_admin" | "admin" | "murid";

   export interface KelasInfo {
     id: number;
     nama: string;
     darjah: number;
   }

   export interface SessionUser {
     id: number;
     username: string;
     nama_first: string;
     nama_last: string;
     role: Role;
     mesti_tukar_kata_laluan: boolean;
     kelas: KelasInfo | null;
   }
   ```

   Note: `Role` is defined here and re-exported from `src/types/role.ts` after Group D.

2. `src/features/auth/schemas/auth.ts` exists with Zod schemas:

   ```ts
   export const loginSchema = z.object({
     username: z.string().min(1, "Sila isi nama pengguna."),
     kata_laluan: z.string().min(1, "Sila isi kata laluan."),
   });

   export const changePasswordSchema = z.object({
     kata_laluan_semasa: z.string().min(1, "Sila isi kata laluan semasa."),
     kata_laluan_baru: z
       .string()
       .min(1, "Sila isi kata laluan baru."),
   });

   export type LoginValues = z.infer<typeof loginSchema>;
   export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
   ```

3. `src/features/auth/services/authApi.ts` exists with:

   - `login(username, kata_laluan): Promise<SessionUser>` via `POST /api/v1/auth/login`
   - `logout(): Promise<void>` via `POST /api/v1/auth/logout`
   - `getMe(): Promise<SessionUser>` via `GET /api/v1/auth/me`
   - `changePassword(kata_laluan_semasa, kata_laluan_baru): Promise<void>` via `POST /api/v1/auth/change-password`

   File naming follows the existing `questionApi.ts` convention.

4. `src/features/auth/hooks/useSession.ts` exists:

   - TanStack Query with key `["auth", "session"]`, `queryFn: getMe`, `retry: false`, `staleTime: 0`.
   - Returns `{ user, isLoading, hasSession }`.
   - `user` is `undefined` when the session is absent or expired.

5. `src/features/auth/hooks/useLogin.ts`, `useLogout.ts`, `useChangePassword.ts` exist as mutations:

   - `useLogin`: on success, invalidates `["auth", "session"]`.
   - `useLogout`: on success, clears the auth query and all server-state caches, then navigates to `/login`.
   - `useChangePassword`: on success, invalidates `["auth", "session"]` (the response clears `mesti_tukar_kata_laluan`).

6. `src/features/auth/hooks/useStudentView.ts` exists:

   - Zustand store with `persist` middleware using `sessionStorage` and storage key `sk_quiz_mod_pratonton`.
   - State: `{ aktif: boolean; masukkan: () => void; keluar: () => void }`.
   - This is the in-app student view mode. It is UI state only. It never changes identity, and it never grants access to murid routes.

7. `src/features/auth/components/` exists:

   - `LoginForm.tsx`: username and kata laluan fields, Zod validation, error display from `useLogin`, BM labels ("Nama Pengguna", "Kata Laluan", "Log Masuk"). On a login response with `mesti_tukar_kata_laluan=true`, switches to `ChangePasswordForm` instead of navigating.
   - `LogoutButton.tsx`: renders user name (`nama_first` + `nama_last`) plus a "Log Keluar" button that calls `useLogout`.
   - `ChangePasswordForm.tsx`: kata laluan semasa and baru fields, BM labels ("Kata Laluan Semasa", "Kata Laluan Baru", "Tukar Kata Laluan"). On success, navigates to the role home (`/admin` for staff, `/murid` for murid).
   - `StudentViewBanner.tsx`: visible when `useStudentView` reports `aktif`. Shows "Mod Pratonton Murid" and a "Keluar Mod Pratonton" button that calls `keluar`.

### Implementation Notes

- All hooks use `src/lib/api-client.ts` helpers, which already wrap the BFF base URL and error envelope.
- `useSession` is the replacement for `useRole` everywhere: admin layout, murid layout, pages, and components.
- Do not store the session in localStorage. Session state lives in TanStack Query cache only, and the truth is the `sk_quiz_sesi` cookie.

### Affected Files

- `src/features/auth/types/index.ts` (new)
- `src/features/auth/schemas/auth.ts` (new)
- `src/features/auth/services/authApi.ts` (new)
- `src/features/auth/hooks/useSession.ts` (new)
- `src/features/auth/hooks/useLogin.ts` (new)
- `src/features/auth/hooks/useLogout.ts` (new)
- `src/features/auth/hooks/useChangePassword.ts` (new)
- `src/features/auth/hooks/useStudentView.ts` (new)
- `src/features/auth/components/LoginForm.tsx` (new)
- `src/features/auth/components/LogoutButton.tsx` (new)
- `src/features/auth/components/ChangePasswordForm.tsx` (new)
- `src/features/auth/components/StudentViewBanner.tsx` (new)
- `src/features/auth/index.ts` (new, feature barrel)

---

## Group B: Session Plumbing

### Purpose

Make the BFF a correct cookie relay per ADR 0006, add route handlers for the new auth, users, kelas, and gurus endpoints, and centralize session invalidation on `401`.

### Acceptance Criteria

1. `src/lib/bff-proxy.ts` forwards the session cookie:

   - Reads `request.cookies.get("sk_quiz_sesi")`.
   - When present, sends it upstream as the `cookie` header.
   - Never forwards any other client cookie.
   - Relays upstream `set-cookie` headers onto the `NextResponse` unchanged.
   - All other behavior (timeouts, error mapping, body passthrough) stays as is.

2. BFF route handlers exist for the new endpoints, following the existing thin-handler pattern (`forwardRequest`):

   - `src/app/api/v1/auth/login/route.ts` (POST)
   - `src/app/api/v1/auth/logout/route.ts` (POST)
   - `src/app/api/v1/auth/me/route.ts` (GET)
   - `src/app/api/v1/auth/change-password/route.ts` (POST)
   - `src/app/api/v1/users/route.ts` (GET, POST)
   - `src/app/api/v1/users/[id]/route.ts` (GET, PATCH, DELETE)
   - `src/app/api/v1/users/[id]/reset-password/route.ts` (POST)
   - `src/app/api/v1/kelas/route.ts` (GET, POST)
   - `src/app/api/v1/kelas/[id]/route.ts` (PATCH)
   - `src/app/api/v1/kelas/[id]/share/route.ts` (PUT)
   - `src/app/api/v1/gurus/route.ts` (GET)
   - `src/app/api/v1/kuiz/pratonton/route.ts` (GET)

3. Session invalidation on 401 is centralized:

   - `src/lib/query-client.tsx` `QueryCache` and `MutationCache` `onError` callbacks check for `ApiClientError` with `status === 401`.
   - On 401, the auth query (`["auth", "session"]`) is invalidated and the app navigates to `/login`.
   - The callback runs once per burst; repeated 401s from parallel requests do not stack redirects.

### Implementation Notes

- The BFF remains a dumb relay. It does not decode the cookie, check expiry, or compare roles. If the backend rejects the session, the BFF passes the `401 SESI_TAMAT` response through.
- Login and logout handlers exist precisely because they set and clear the cookie. The relay of `set-cookie` is what makes them work through the BFF.
- Route handler files are `route.ts` in kebab-case paths, matching the existing BFF handlers.

### Affected Files

- `src/lib/bff-proxy.ts` (edit: cookie forward + set-cookie relay)
- `src/lib/query-client.tsx` (edit: 401 invalidation callbacks)
- 12 new BFF route handler files listed above

---

## Group C: Routes, Middleware, and Landing Page

### Purpose

Replace the role-picker landing page with session-aware routing. Users without a session go to `/login`; users with a session go to their role home.

### Acceptance Criteria

1. `src/app/login/page.tsx` exists:

   - Client component rendering `LoginForm`.
   - If a session already exists (`useSession` reports a user), redirects to the role home (`/admin` for staff, `/murid` for murid).
   - After login, navigates to the role home. When `mesti_tukar_kata_laluan` is true, the page shows `ChangePasswordForm` before any navigation.

2. `src/app/page.tsx` is rewritten as a role-based redirect:

   - Server component.
   - No `sk_quiz_sesi` cookie: `redirect("/login")`.
   - Cookie present: fetches `GET /api/v1/auth/me` (same-origin, cookie included).
   - `401` response: `redirect("/login")`.
   - `role` is `super_admin` or `admin`: `redirect("/admin")`. `role` is `murid`: `redirect("/murid")`.
   - `mesti_tukar_kata_laluan` is true: `redirect("/login")` so the password change step runs first.

3. `src/proxy.ts` is rewritten:

   - Matcher stays `["/admin/:path*", "/murid/:path*"]`.
   - Checks only whether `sk_quiz_sesi` exists.
   - Missing cookie: `NextResponse.redirect(new URL("/login", request.url))`.
   - Present cookie: allow through.
   - No role decoding, no cookie reading beyond existence.

### Implementation Notes

- The proxy is UX only. The backend rejects every request without a valid session, so a stale or forged cookie that passes the proxy still fails at the API with `401 SESI_TAMAT` and the Group B invalidation takes over.
- The root page needs a real `/auth/me` round trip because the session cookie is opaque. The role is never readable from the cookie.

### Affected Files

- `src/app/login/page.tsx` (new)
- `src/app/page.tsx` (rewrite)
- `src/proxy.ts` (rewrite)

---

## Group D: Role Model Cleanup

### Purpose

Remove the client-side role model: `useRole.tsx`, the role picker, and both localStorage keys. Replace them with the session model and a UX permission mirror.

### Acceptance Criteria

1. `src/hooks/useRole.tsx` is deleted, along with `RoleProvider` usage in the root layout.

2. `src/types/role.ts` is extended:

   ```ts
   export type Role = "super_admin" | "admin" | "murid";

   export type Permission =
     | "user:create"
     | "user:read"
     | "user:update"
     | "user:reset_password"
     | "user:delete"
     | "kelas:create"
     | "kelas:read"
     | "kelas:update"
     | "kelas:share"
     | "guru:directory"
     | "attempt:create"
     | "attempt:submit"
     | "attempt:read_own"
     | "attempt:read_all"
     | "attempt:preview";

   export function can(role: Role, permission: Permission): boolean;
   ```

   `can` mirrors the ADR 0007 permission matrix. It drives UI visibility only. The backend is the enforcement boundary.

3. `ROLE_STORAGE_KEY` and the `sk_quiz_peranan` cookie are removed. No code writes, reads, or clears them.

4. `sk_quiz_nama_murid` is removed. No code reads or writes it.

5. All `useRole` consumers are migrated to `useSession`:

   - Admin layout and murid layout render nav from session role.
   - The murid header "Tukar Peranan" navigation item is replaced with user name plus `LogoutButton`.

### Implementation Notes

- Keep the type in `src/types/role.ts` as the global tier-1 location, and re-export `Role` from `src/features/auth/types` for feature-local imports. Global type file stays the single source of truth for the role union and the permission matrix mirror.
- The role picker cards on the landing page are replaced by the Group C redirect; nothing renders role choice to the user anymore.

### Affected Files

- `src/hooks/useRole.tsx` (delete)
- `src/types/role.ts` (edit: role union, Permission, `can`)
- `src/features/auth/types/index.ts` (edit: re-export `Role`)
- `src/app/layout.tsx` (edit: remove `RoleProvider`)
- `src/app/admin/layout.tsx` (edit: session-based nav, `LogoutButton`)
- `src/app/murid/layout.tsx` (edit: session-based header, `LogoutButton`)

---

## Group E: Pengguna Management (`/admin/pengguna`)

### Purpose

Provide the staff user and class management surface behind the new RBAC. Super admins manage gurus, classes, and murid. Gurus manage class-scoped murid and share their own classes.

### Acceptance Criteria

1. `src/app/admin/pengguna/page.tsx` exists and renders different surfaces by session role:

   - `super_admin`: guru management (create guru, rename, reset password, deactivate), kelas management (create, rename, change darjah), murid management across all classes, share management for any class.
   - `admin`: class-scoped murid management (create murid in own classes, rename, reset password, deactivate), share own classes, read-only display for murid rows from shared classes.

2. Management UI lives in `src/features/pengguna/` following the feature folder convention:

   - Services call the Group B BFF handlers (`/api/v1/users`, `/api/v1/kelas`, `/api/v1/gurus`).
   - Hooks wrap the services with TanStack Query, keyed domain-first (for example `["users", { role, carian, page }]`, `["kelas"]`, `["gurus"]`).
   - Components cover: user table with role and status columns, user create form, user edit dialog, reset password dialog, kelas create and rename forms, share dialog with guru picker.

3. Scope rules are respected in the UI:

   - Guru create forms only offer role `murid` and a kelas selector limited to own classes.
   - Super admin forms offer `admin` and `murid` targets.
   - Shared-class murid rows show a read-only badge (BM: "Berkongsi (baca sahaja)") and hide edit, reset, and deactivate actions.
   - Guru share dialogs list candidate gurus from `GET /gurus` and send `PUT /kelas/{id}/share` with the selected `guru_ids`; deselecting everyone sends an empty list.

4. Error states map backend codes to BM messages:

   - `NAMA_PENGGUNA_WUJUD` (409): "Nama pengguna sudah wujud."
   - `TIADA_KEBENARAN` (403): "Anda tiada kebenaran untuk tindakan ini."
   - `SESI_TAMAT` (401): handled by Group B invalidation, redirect to `/login`.

### Implementation Notes

- The page is a route shell. All logic lives in `src/features/pengguna/`; the page imports feature components.
- Mutations invalidate the affected query keys on success so the table reflects the change.
- No client-side write is attempted for shared classes; the backend rejects it anyway, but the UI must not offer it.

### Affected Files

- `src/app/admin/pengguna/page.tsx` (new)
- `src/features/pengguna/components/*` (new: user table, forms, dialogs)
- `src/features/pengguna/hooks/*` (new: user, kelas, gurus queries and mutations)
- `src/features/pengguna/services/*` (new: usersApi, kelasApi, gurusApi)
- `src/features/pengguna/types/*` (new)
- `src/app/admin/layout.tsx` (edit: add "Pengguna" nav item)

---

## Group F: Student View Preview (`/admin/pratonton`)

### Purpose

Let staff preview the student quiz experience without impersonation. The preview shows questions without answers and cannot submit anything.

### Acceptance Criteria

1. `src/app/admin/pratonton/page.tsx` exists:

   - Topic and difficulty selector (same reference data hooks as the murid flow: `useTopics`, `useYears`, `useSubjects` from `@/hooks/useReferenceData`).
   - Fetches `GET /api/v1/kuiz/pratonton` for the selected topic and difficulty.
   - Renders each question with its options. No answer fields are displayed, no submission UI exists.

2. Entering the page activates the student view mode (`useStudentView.masukkan`); leaving the admin route group deactivates it (`keluar`).

3. `StudentViewBanner` renders while the mode is active, with "Mod Pratonton Murid" and the exit control.

4. The preview never navigates into `/murid/*`. Murid routes stay murid-only; the proxy and the backend enforce this.

5. Preview components do not import quiz-taking feature internals. Question rendering is a small read-only list owned by the preview feature, keeping feature boundaries intact.

### Implementation Notes

- The student view mode is sessionStorage-backed so a refresh inside the preview keeps the mode active for the session. It is UI state only and carries no privileges.
- The backend `GET /kuiz/pratonton` never includes answer fields, so even a buggy client cannot render answers it was not given.

### Affected Files

- `src/app/admin/pratonton/page.tsx` (new)
- `src/features/pengguna/components/PreviewQuestionList.tsx` (new, read-only question rendering)
- `src/app/admin/layout.tsx` (edit: add "Pratonton Murid" nav item)

---

## Group G: Quiz Taking and Results Updates

### Purpose

Align the murid quiz flow with the session model: no name input, server-derived participant name, and attempt scoping by `user_id`.

### Acceptance Criteria

1. `src/features/quiz-taking/schemas/kuiz.ts` drops `nama_peserta`:

   ```ts
   export const kuizStartSchema = z.object({
     topic_id: z.number().int().positive("Sila pilih topik."),
     tahap_kesukaran: z.enum(["mudah", "sederhana", "sukar"], {
       message: "Sila pilih tahap kesukaran.",
     }),
   });
   ```

2. `QuizSelector.tsx`:

   - Removes the name input field and its validation errors.
   - Displays the participant name from `useSession` (`nama_first` + `nama_last`) as static text.
   - Removes the `sk_quiz_nama_murid` localStorage read on mount and write on submit.
   - Submits `{ topic_id, tahap_kesukaran }` only.

3. `usePendingAttempt.ts` drops `namaPeserta`:

   ```ts
   export function usePendingAttempt(topicId: number, tahapKesukaran: string) {
     return useQuery({
       queryKey: ["pending-attempt", topicId, tahapKesukaran],
       queryFn: () =>
         getAttemptList({
           topic_id: topicId,
           difficulty: tahapKesukaran,
           status: "dalam_progres",
           page: 1,
           page_size: 1,
         }),
       enabled: topicId > 0 && tahapKesukaran.length > 0,
     });
   }
   ```

   The backend scopes the pending-attempt lookup to the murid's `user_id`; no name is sent.

4. Murid history (`/murid/sejarah`, `HistoryList`):

   - Removes the participant name search input. The list is own attempts only.
   - Empty state keeps the "Mula Kuiz Pertama" call to action.

5. Admin prestasi (`/admin/prestasi`, `PerformanceTable`):

   - Scoped to visible classes by the backend; the UI adds no scope controls.
   - Keeps the participant name search for staff, since staff search across visible classes is part of the contract.

6. Session expiry during a quiz follows Group B: a `401` from any attempt request invalidates the session and redirects to `/login`. The in-progress attempt is preserved server-side and can be continued after re-login.

### Implementation Notes

- `nama_peserta` still exists in API responses as a server-derived snapshot; the frontend just never sends it.
- The pending attempt continue-or-restart dialog behavior from the MVP spec is unchanged, only the hook signature and query key change.

### Affected Files

- `src/features/quiz-taking/schemas/kuiz.ts` (edit: drop `nama_peserta`)
- `src/features/quiz-taking/components/QuizSelector.tsx` (edit: remove name field, session name display)
- `src/features/quiz-taking/hooks/usePendingAttempt.ts` (edit: drop `namaPeserta`)
- `src/features/results/components/HistoryList.tsx` (edit: remove name search)
- `src/features/results/hooks/useHistoryList.ts` (edit: drop name filter param)

---

## Definition of Done

- `src/hooks/useRole.tsx` is gone. Zero references to `sk_quiz_peranan` and `sk_quiz_nama_murid` remain.
- Login, logout, session restore, and password change work through the BFF with the `sk_quiz_sesi` cookie.
- The BFF forwards only the session cookie and relays `set-cookie`; no other cookie crosses the BFF.
- A `401` response anywhere invalidates session state and lands on `/login`.
- `/` redirects by session role; `/login` handles unauthenticated users; the proxy is a presence check only.
- The quiz selector has no name input; `usePendingAttempt` sends no name; murid history is own attempts only.
- `/admin/pengguna` implements the super admin and guru surfaces with scope-aware controls and read-only badges.
- `/admin/pratonton` renders questions without answers, uses the student view mode, and never enters `/murid/*`.
- All user-facing strings are Bahasa Malaysia; technical prose in the code follows the naming conventions in `docs/frontend/naming.md`.