# Contributing

Thanks for contributing to the Property Management platform. This guide covers local
setup, conventions, and the checks your changes must pass.

## Prerequisites

- Node.js **20+** (CI runs on 20.x and 22.x)
- npm
- PostgreSQL 15+ (or use the Docker Compose database)

## Repository layout

```
.                     # Backend (Node.js / Express / Prisma)
├── src/              # Backend source
├── prisma/           # Prisma schema & migrations
├── frontend/         # React SPA
│   └── src/
├── .github/workflows # CI/CD
├── ARCHITECTURE.md   # System design
├── DEPLOYMENT.md     # Deployment guide
└── SECURITY.md       # Security policy
```

## Local setup

### Backend

```bash
npm install
cp .env.example .env        # configure DATABASE_URL, JWT_SECRET, etc.
npm run generate            # generate Prisma client
npx prisma migrate dev      # apply migrations
npm run dev                 # start API with hot reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env        # set VITE_API_URL
npm run dev                 # start Vite dev server
```

## Coding conventions

- **Language**: TypeScript everywhere; avoid `any` (prefer precise types or `unknown`).
- **Backend structure**: routes → controllers → services → repositories. Keep business
  logic in services, data access in repositories, and HTTP concerns in controllers.
- **Frontend structure**: organise by feature module (`components`, `hooks`, `services`,
  `utils`, `types.ts`, `constants.ts`, `__tests__`).
- **Server state**: use TanStack Query hooks; do not fetch in `useEffect` directly.
- **Logging (frontend)**: use `@/shared/utils/logger`, not `console.*`.
- **Accessibility**: label interactive elements, support keyboard navigation, use ARIA
  where semantics are not implicit.
- **Comments**: explain intent/trade-offs, not what the code obviously does.

## Required checks

Run these before opening a PR. CI runs the same checks and must pass.

### Backend

```bash
npm run lint          # tsc --noEmit
npm run build         # tsc
npm test              # jest (requires a test database)
```

### Frontend

```bash
cd frontend
npm run format:check
npm run lint
npm run type-check
npm run test
npm run build
```

## Testing

- Add or update tests for any behavioural change.
- Backend: Jest unit/service/controller/middleware/E2E tests.
- Frontend: Vitest + Testing Library. Test files use the `*.spec.ts(x)` suffix and live
  in a sibling `__tests__` directory.

## Commit & PR guidelines

- Use clear, imperative commit messages (`add`, `fix`, `update`, `refactor`).
- Keep PRs focused; describe the motivation and the change.
- Do not commit secrets or `.env` files.
- Do not disable linting/tests or reduce type strictness to make checks pass.
- Update documentation (`README.md`, `frontend/README.md`, `HUMAN_TESTING.md`) when
  behaviour or setup changes.
- Only update `Property Management API.postman_collection.json` when backend APIs change.

## Line endings

Use **LF** line endings for all source files.
