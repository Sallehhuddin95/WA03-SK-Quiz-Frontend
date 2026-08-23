# SK Quiz Frontend

Next.js (App Router) frontend for the Matematik Tahun 6 quiz application.

The app uses Next.js as a Backend-for-Frontend (BFF). Route handlers in `src/app/api/v1/` receive browser requests and forward them to the FastAPI backend. The frontend and backend must run together for full functionality.

## Prerequisites

- Node.js (a version that supports Next.js 16)
- npm
- The SK Quiz backend (FastAPI) running at `http://localhost:8000`

## Setup

```powershell
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

App: http://localhost:3000

To run alongside the backend, see `.vscode/tasks.json` (or `launch.json`), which includes the "Run Frontend + Backend" task.

## Configuration

All settings come from environment variables:

| Env | Default | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `/api/v1` | API base URL. Default points to the BFF (Next.js itself). Set this only for dev debugging to bypass the BFF and hit the backend directly |

The BFF reads `API_URL` (server-side only) from the backend `.env` to locate the actual FastAPI instance. Do not expose `API_URL` to client JavaScript.

## Application Routes

| Route | Description |
| --- | --- |
| `/` | Landing page + role picker |
| `/admin` | Admin dashboard |
| `/admin/bank-soalan` | Question list |
| `/admin/bank-soalan/baru` | Add question |
| `/admin/bank-soalan/[id]/edit` | Edit question |
| `/admin/prestasi` | Student performance |
| `/murid` | Student dashboard (quiz picker) |
| `/murid/kuiz/[attemptId]` | Quiz player |
| `/murid/sejarah` | Quiz history |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` / `npm run test:watch` | Run Vitest |
| `npm run test:unit` | Vitest unit tests |
| `npm run test:integration` | Integration tests (RTL + MSW) |
| `npm run test:e2e` | Playwright end-to-end tests |

## Structure

```text
src/
├── app/                  # Next.js App Router: routing & layouts only
│   └── api/v1/           # BFF route handlers (proxy to the FastAPI backend)
├── components/ui/        # shadcn/ui primitives
├── features/             # Business domains
│   ├── auth/
│   ├── question-bank/    # Question bank (admin)
│   ├── quiz-taking/      # Quiz player (student)
│   └── results/          # Results & history
├── hooks/                # Global reusable hooks
├── lib/                  # Shared infra (api-client, bff-proxy, query-client)
├── types/                # Shared type contracts
├── utils/                # Pure helper functions
└── tests/                # Test suites (unit, integration)
```

## Architecture

- **Feature-driven**: each domain has its own folder (`components`, `hooks`, `services`, `types`).
- **BFF**: the Next.js App Router proxies API calls to FastAPI in `src/app/api/v1/`.
- **Data fetching**: TanStack Query (v5) for server state.
- **Styling**: Tailwind CSS + shadcn/ui.
- **Validation**: Zod (e.g. question forms, quiz picker).
