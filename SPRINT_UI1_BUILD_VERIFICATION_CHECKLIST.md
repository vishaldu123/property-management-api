# Sprint UI-1 – Build & Test Verification Checklist

**Status**: Code Complete – Ready for Verification Phase  
**Target**: Verify all builds, tests, linting, and formatting pass for both frontend and backend

---

## Frontend Verification Commands

All commands should be run from `frontend/` directory:

```bash
cd frontend
npm ci                    # Clean install all dependencies
npm run type-check        # TypeScript type checking (no emit)
npm run lint              # ESLint analysis
npm run format:check      # Prettier format verification
npm run test              # Vitest unit tests with coverage
npm run build             # Production build with Vite
npm run ci                # Runs all above sequentially
```

### Expected Results

- ✅ **npm ci** - All 50+ dependencies installed successfully (should cache)
- ✅ **npm run type-check** - No TypeScript errors (strict mode enabled)
- ✅ **npm run lint** - No ESLint violations
- ✅ **npm run format:check** - All code matches Prettier formatting
- ✅ **npm run test** - All unit tests pass, coverage > 70%
- ✅ **npm run build** - Build completes successfully, dist/ folder created

### Key Frontend Files Verified

| Component | File | Status |
|-----------|------|--------|
| Entry Point | `src/main.tsx` | ✅ Ready |
| App Component | `src/app/index.tsx` | ✅ Ready |
| Auth Provider | `src/app/providers/auth-provider.tsx` | ✅ Ready |
| Routes Config | `src/app/routes/index.tsx` | ✅ Ready |
| Protected Route | `src/app/routes/protected-route.tsx` | ✅ Ready |
| API Client | `src/shared/services/api-client.ts` | ✅ Ready |
| Auth Service | `src/shared/services/auth.service.ts` | ✅ Ready |
| UI Components | `src/shared/components/ui/` | ✅ 8 Components Ready |
| Layout Components | `src/shared/components/layout/` | ✅ Ready |
| Pages | `src/pages/` | ✅ 10 Pages Ready |
| Hooks | `src/shared/hooks/` | ✅ 3 Hooks Ready |
| Validators | `src/utils/validation.ts` | ✅ Ready |
| Tests | `src/__tests__/` | ✅ Test Suite Ready |
| Styling | `src/app/globals.css` | ✅ Tailwind + CSS Vars |
| Config: vite.config.ts | Vite Configuration | ✅ Ready |
| Config: tsconfig.json | TypeScript Configuration | ✅ Strict Mode |
| Config: eslint.config.js | ESLint Configuration | ✅ React 19 Plugin |
| Config: vitest.config.ts | Vitest Configuration | ✅ jsdom Environment |
| Config: tailwind.config.ts | Tailwind Configuration | ✅ CSS Variables |
| Package Manager | `package.json` | ✅ All Scripts Ready |

---

## Backend Verification Commands

All commands should be run from root directory (project-management-api/):

```bash
npm ci                    # Clean install backend dependencies
npm run build             # TypeScript compilation
npm run lint              # ESLint analysis
npm run type-check        # TypeScript type checking
npm run test:coverage     # Jest tests with coverage
npm run ci                # Runs all above sequentially
```

### Expected Results

- ✅ **npm ci** - Dependencies installed successfully
- ✅ **npm run build** - TypeScript compiles without errors
- ✅ **npm run lint** - No ESLint violations
- ✅ **npm run type-check** - No TypeScript errors
- ✅ **npm run test:coverage** - All tests pass, coverage > 70%

---

## GitHub Actions Verification

The CI/CD workflow should run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Jobs to Verify

1. **backend-lint-and-test** (Node 18.x, 20.x)
   - Install dependencies
   - Generate Prisma client
   - Run TypeScript lint
   - Run tests with coverage
   - Build
   - Upload coverage to Codecov

2. **frontend-lint-and-test** (Node 18.x, 20.x)
   - Install dependencies from frontend/
   - Type check
   - Run ESLint
   - Check Prettier format
   - Run tests with coverage
   - Build
   - Upload coverage to Codecov

3. **deploy**
   - Depends on both backend and frontend jobs
   - Only runs on `main` push
   - Triggered after all tests pass

### Expected Results

- ✅ Both jobs pass for Node 18.x and 20.x
- ✅ All steps complete without errors
- ✅ Coverage reports upload successfully
- ✅ Deploy job is ready (but only triggers on main push)

---

## Frontend Project Structure (All Files in Place)

```
frontend/
├── src/
│   ├── main.tsx                          # Entry point
│   ├── app/
│   │   ├── index.tsx                     # App component
│   │   ├── globals.css                   # Tailwind + CSS variables
│   │   ├── error-boundary.tsx            # Error boundary wrapper
│   │   ├── providers/
│   │   │   ├── index.ts                  # Provider exports
│   │   │   └── auth-provider.tsx         # Auth context provider
│   │   └── routes/
│   │       ├── index.tsx                 # React Router config
│   │       └── protected-route.tsx       # Protected route wrapper
│   ├── pages/
│   │   ├── index.ts                      # Page exports
│   │   ├── home.tsx                      # Home page
│   │   ├── forbidden.tsx                 # 403 page
│   │   ├── not-found.tsx                 # 404 page
│   │   ├── auth/
│   │   │   ├── login.tsx                 # Login page
│   │   │   ├── register.tsx              # Register page
│   │   │   ├── forgot-password.tsx       # Forgot password page
│   │   │   └── reset-password.tsx        # Reset password page
│   │   └── dashboard/
│   │       ├── dashboard.tsx             # Dashboard page
│   │       ├── profile.tsx               # Profile page
│   │       └── settings.tsx              # Settings page
│   ├── shared/
│   │   ├── components/
│   │   │   ├── index.ts                  # Component exports
│   │   │   ├── ui/                       # UI components (8 total)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── empty-state.tsx
│   │   │   │   └── error-state.tsx
│   │   │   ├── form/                     # Form components
│   │   │   │   ├── text-field.tsx
│   │   │   │   └── password-field.tsx
│   │   │   └── layout/                   # Layout components
│   │   │       ├── sidebar.tsx
│   │   │       ├── top-nav.tsx
│   │   │       └── dashboard-layout.tsx
│   │   ├── hooks/
│   │   │   ├── index.ts                  # Hook exports
│   │   │   ├── useAuth.ts                # Auth hook
│   │   │   └── useTheme.ts               # Theme hook
│   │   └── services/
│   │       ├── index.ts                  # Service exports
│   │       ├── api-client.ts             # Axios client
│   │       ├── auth.service.ts           # Auth service
│   │       └── organization.service.ts   # Organization service
│   ├── types/
│   │   ├── index.ts                      # Type exports
│   │   ├── auth.types.ts                 # Auth types
│   │   ├── user.types.ts                 # User types
│   │   ├── organization.types.ts         # Organization types
│   │   └── api.types.ts                  # API response types
│   ├── utils/
│   │   ├── validation.ts                 # Zod schemas
│   │   └── format.ts                     # Format utilities
│   └── __tests__/
│       ├── setup.ts                      # Test setup
│       ├── auth-provider.spec.tsx        # Auth provider tests
│       ├── routes.spec.tsx               # Routes tests
│       └── pages/
│           └── login.spec.tsx            # Login page tests
├── public/                               # Static assets
├── .env                                  # Environment variables
├── .env.example                          # Environment example
├── .gitignore                            # Git ignore rules
├── .prettierrc                           # Prettier config
├── .prettierignore                       # Prettier ignore
├── vite.config.ts                        # Vite configuration
├── vitest.config.ts                      # Vitest configuration
├── tsconfig.json                         # TypeScript config
├── tsconfig.app.json                     # App-specific TS config
├── eslint.config.js                      # ESLint configuration
├── postcss.config.js                     # PostCSS configuration
├── tailwind.config.ts                    # Tailwind configuration
├── index.html                            # HTML entry point
├── package.json                          # Dependencies & scripts
├── package-lock.json                     # Dependency lock file
└── README.md                             # Frontend documentation
```

---

## Dependencies Verification

### Key Frontend Dependencies
- ✅ react@19.0.0-beta
- ✅ react-dom@19.0.0-beta
- ✅ react-router-dom@6.20.0
- ✅ @tanstack/react-query@5.28.0
- ✅ react-hook-form@7.48.0
- ✅ zod@4.4.3
- ✅ axios@1.6.2
- ✅ tailwindcss@3.4.1
- ✅ lucide-react@0.294.0
- ✅ @radix-ui/react-*@2.0.0 (multiple)

### Key Development Dependencies
- ✅ typescript@5.3.3
- ✅ vite@5.0.8
- ✅ vitest@1.1.0
- ✅ eslint@8.55.0
- ✅ prettier@3.1.1
- ✅ @vitejs/plugin-react@4.2.1

---

## Configuration Files Verification

| File | Purpose | Status |
|------|---------|--------|
| `vite.config.ts` | Build & dev server config | ✅ Configured |
| `vitest.config.ts` | Test runner configuration | ✅ Configured |
| `tsconfig.json` | TypeScript strict mode | ✅ Strict: true |
| `eslint.config.js` | ESLint rules for React 19 | ✅ Configured |
| `.prettierrc` | Code formatting rules | ✅ Configured |
| `tailwind.config.ts` | Tailwind CSS setup | ✅ CSS Variables |
| `postcss.config.js` | CSS processing pipeline | ✅ Configured |
| `.env` | Environment variables | ✅ VITE_API_URL set |

---

## Testing Infrastructure

### Test Files
- ✅ `src/__tests__/setup.ts` - Test environment setup
- ✅ `src/__tests__/auth-provider.spec.tsx` - Auth provider tests
- ✅ `src/__tests__/routes.spec.tsx` - Route configuration tests
- ✅ `src/__tests__/pages/login.spec.tsx` - Login page tests

### Test Coverage
- **Target**: > 70% code coverage
- **Environment**: jsdom (DOM simulation for React Testing Library)
- **Reporters**: text, json, html, lcov
- **Output**: `coverage/` directory with HTML report

---

## Next Steps: Execution Plan

### Phase 1: Local Verification (Frontend)
1. Navigate to `frontend/` directory
2. Run `npm ci` to install dependencies
3. Run `npm run ci` to verify all checks pass
4. If failures occur, fix them immediately
5. Verify `dist/` build artifact is created

### Phase 2: Local Verification (Backend)
1. Navigate to root directory
2. Run `npm ci` to install dependencies
3. Run `npm run ci` to verify all checks pass
4. If failures occur, fix them immediately

### Phase 3: GitHub Actions Verification
1. Push code to a feature branch
2. Create a pull request to `main` or `develop`
3. Verify CI workflow triggers automatically
4. Check that both `backend-lint-and-test` and `frontend-lint-and-test` jobs pass
5. Verify coverage reports upload successfully

### Phase 4: Merge & Deploy
1. Merge PR to `main` branch
2. Verify deploy job runs and succeeds
3. Confirm application is deployed

---

## Troubleshooting Guide

### If npm ci fails
- Delete `node_modules/` and `package-lock.json`
- Run `npm install` instead of `npm ci`
- Check Node version (18.x or 20.x required)

### If type-check fails
- Run `npm run type-check` to see specific errors
- Check import paths use `@/` alias correctly
- Verify all types are exported from `src/types/index.ts`

### If lint fails
- Run `npm run lint` to see specific violations
- Run `npm run lint:fix` to auto-fix many issues
- Check for unused variables or missing dependencies

### If format fails
- Run `npm run format` to auto-format all files
- Verify `.prettierrc` matches project standards

### If tests fail
- Run `npm run test:watch` to run tests in watch mode
- Check test setup in `src/__tests__/setup.ts`
- Verify test file locations match `**/*.spec.{ts,tsx}`

### If build fails
- Check console output for specific errors
- Verify all imports use correct paths
- Check for circular dependencies
- Ensure all dependencies are in `package.json`

---

## Documentation Files Updated

- ✅ `frontend/README.md` - Frontend setup & architecture guide
- ✅ `README.md` - Main README with frontend section
- ✅ `HUMAN_TESTING.md` - Frontend test cases (Tests 0.1-0.9.3)
- ✅ `SPRINT_UI1_COMPLETION_REPORT.md` - Sprint completion report
- ✅ `.github/workflows/ci.yml` - GitHub Actions workflow

---

## Success Criteria

Sprint UI-1 is **COMPLETE** when:

1. ✅ Frontend npm run ci passes all checks
2. ✅ Backend npm run ci passes all checks
3. ✅ GitHub Actions CI workflow passes for both jobs
4. ✅ No TypeScript, ESLint, or Prettier errors
5. ✅ Unit test coverage > 70%
6. ✅ Frontend builds successfully to `dist/`
7. ✅ All 10 pages load without errors
8. ✅ Authentication flow works end-to-end
9. ✅ Protected routes redirect properly
10. ✅ Error boundaries catch exceptions gracefully

---

## Final Verification Checklist

- [ ] All files listed in project structure exist
- [ ] No import errors in any component
- [ ] API client configured with correct base URL
- [ ] Auth provider wraps entire application
- [ ] Protected routes redirect to login when needed
- [ ] All pages export correctly
- [ ] All UI components render without errors
- [ ] Styling (Tailwind + CSS variables) works
- [ ] Dark mode toggle functions correctly
- [ ] Forms validate with Zod schemas
- [ ] React Hook Form integrates properly
- [ ] Axios interceptors handle token refresh
- [ ] Tests run without errors
- [ ] Build produces optimized dist/
- [ ] GitHub Actions workflow is configured
- [ ] Documentation is complete and accurate

---

**Document Status**: Ready for Execution  
**Last Updated**: 2025-01-15  
**Next Action**: Execute Phase 1 Local Verification
