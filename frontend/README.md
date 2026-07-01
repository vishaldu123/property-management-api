# Property Management Frontend

Enterprise React 19 frontend for the Property Management SaaS platform.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Radix UI** - Headless UI components
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide Icons** - Icon library
- **Vitest** - Testing framework
- **React Testing Library** - Component testing

## Project Structure

```
src/
├── app/                          # Application root
│   ├── index.tsx                # Main App component
│   ├── globals.css              # Global styles
│   ├── error-boundary.tsx       # Global error handler
│   ├── providers/               # Context providers
│   │   ├── auth-provider.tsx   # Auth context and provider
│   │   └── index.ts            # Export providers
│   └── routes/                  # Routing
│       ├── index.tsx           # Route configuration
│       └── protected-route.tsx # Protected route wrapper
├── features/                     # Feature modules
├── shared/                       # Shared utilities
│   ├── components/              # Reusable components
│   │   ├── ui/                 # Base UI components
│   │   ├── form/               # Form components
│   │   ├── layout/             # Layout components
│   │   └── index.ts            # Export all components
│   ├── hooks/                  # Custom hooks
│   │   ├── use-auth.ts        # Auth hook
│   │   ├── use-theme.ts       # Theme hook
│   │   └── index.ts           # Export hooks
│   └── services/               # API services
│       ├── api-client.ts      # Axios instance with interceptors
│       ├── auth.service.ts    # Auth API calls
│       ├── organization.service.ts  # Organization API calls
│       └── index.ts           # Export services
├── features/                     # Feature modules (property, unit, tenant, dashboard)
├── pages/                       # Page components
│   ├── home.tsx               # Home page
│   ├── auth/                  # Auth pages
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── dashboard/             # Dashboard page shell
│   │   ├── dashboard.tsx
│   │   ├── profile.tsx
│   │   └── settings.tsx
│   ├── not-found.tsx
│   ├── forbidden.tsx
│   └── index.ts
├── types/                       # TypeScript type definitions
├── utils/                       # Utility functions
│   ├── cn.ts                   # Class name merging
│   ├── token.ts                # JWT token utilities
│   ├── validation.ts           # Zod schemas
│   └── index.ts
├── assets/                      # Static assets
├── __tests__/                   # Tests
│   └── setup.ts                # Test setup
└── main.tsx                     # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ or npm 9+
- Backend API running on `http://localhost:5000`

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your backend URL
# VITE_API_URL=http://localhost:5000
# VITE_API_BASE_PATH=/api/v1
```

### Development

```bash
# Start development server
npm run dev

# The application will be available at http://localhost:5173
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run preview` - Preview production build

### Building & Type Checking

- `npm run build` - Build for production
- `npm run type-check` - Check TypeScript types

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing

- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

### CI/CD

- `npm run ci` - Run all checks (lint, format, type-check, test, build)

## API Integration

### Authentication Flow

1. **Login/Register** → Backend returns `{ success, message, data }`; the API client unwraps `data` automatically
2. **Tokens** → `accessToken` and `refreshToken` are stored in localStorage
3. **API Requests** → `Authorization: Bearer <accessToken>` attached to each request
4. **Token Expiry** → Automatic refresh via `POST /api/v1/auth/refresh-token`
5. **Session Persistence** → Tokens restored from localStorage on page reload
6. **Logout** → Sends `refreshToken` to `POST /api/v1/auth/logout`, then clears local storage

### API Client Usage

```typescript
import { apiClient, authService } from '@/shared/services'

// Responses are unwrapped — services receive the payload directly
const response = await apiClient.get('/organizations')

// Auth service
const user = await authService.getCurrentUser()
await authService.logout()
```

## Features

### ✅ Authentication

- Login with email/password
- Register new account
- Forgot password flow
- Reset password flow
- Token refresh on expiry
- Session persistence
- Protected routes
- Role-aware navigation

### ✅ Layout Components

- Responsive Sidebar navigation
- Top Navigation bar
- Theme switcher (light/dark/system)
- User menu with logout
- Notifications placeholder
- Organization switcher placeholder
- Breadcrumb support ready

### ✅ Design System

- Button (multiple variants and sizes)
- Input field
- Card with header/footer/content
- Label
- Alert with title and description
- Form field with error handling
- Loading spinner
- Empty state
- Error state

### ✅ Executive Dashboard (Sprint UI-5)

- Eight KPI cards with loading, error, empty states, and click-through navigation
- Recharts analytics: occupancy, monthly revenue, payment status, maintenance status
- Activity feed for tenants, leases, payments, and maintenance
- Widgets: upcoming lease expirations, recent payments, open maintenance, recent tenants
- RBAC-gated quick actions (new property, unit, tenant, lease, payment, maintenance)
- Auto-refresh every 60 seconds with manual refresh
- Responsive layout (desktop grid, tablet, mobile stacked)
- Accessible charts with ARIA labels and keyboard-navigable KPI cards

### ✅ Payment Workspace (Sprint UI-7)

- Payment list with server-side pagination, search, filters, sorting, and bulk actions
- Payment detail page with balance summary, timeline, lease payment history, and receipt preview
- Record / edit payment forms with lease selector and automatic net/outstanding calculations
- Mark paid, partial payment, and refund workflows with confirmation dialogs
- Printable receipt view (lazy-loaded) with company branding and QR placeholder
- RBAC-gated create, edit, delete, refund, mark paid, export, and receipt actions
- React Query hooks with caching, prefetch on row hover, and query invalidation
- Dashboard integration: Outstanding Payments KPI → filtered list; Revenue chart → paid payments

### ✅ Maintenance Workspace (Sprint UI-8)

- Maintenance list with server-side pagination, search, filters, sorting, and bulk actions
- Request detail page with cost tracking, timeline, and audit information
- Create / edit forms with property, unit, tenant selectors
- Technician assignment dialog with org member lookup
- Full status workflow (assign, schedule, start, pause, complete, cancel, reopen) with transition validation
- RBAC-gated create, edit, assign, delete, restore, and status actions
- React Query hooks with caching and prefetch on row hover
- Dashboard integration: Open Maintenance KPI → open requests; Status chart → filtered list

### ✅ Reports & Analytics Workspace (Sprint UI-9)

- Reports home with RBAC-gated report cards
- Occupancy, Revenue, Payment, Lease, Tenant, Maintenance, and Property Performance reports
- Global filters: organization, property, unit, tenant, lease, date range, status, category, search
- Saved filter presets persisted in local storage
- Recharts visualizations: bar, line, area, pie, donut, and stacked bar charts
- Export toolbar: CSV, Excel/PDF placeholders, and print
- React Query data layer with memoized report calculations
- Dashboard integration: KPI cards link to relevant report pages

### ✅ Pages

- Home page (public landing)
- Login page
- Register page
- Forgot password page
- Reset password page
- Dashboard (protected, live executive metrics)
- Profile page (protected)
- Settings page (protected)
- 404 Not Found
- 403 Forbidden

### ✅ Error Handling

- Global error boundary
- API error handling with retry
- Form validation with Zod
- Error state UI
- User-friendly error messages

### ✅ Testing

- Vitest configuration
- React Testing Library setup
- Component test examples (property, tenant, unit, payment, maintenance, reports)
- Payment workspace tests: utils (9), list (3), detail integration (1)
- Maintenance workspace tests: utils (7), list (3), detail integration (1)
- Reports workspace tests: utils (10), filters hook (2), home page (1)
- Utility function tests
- Coverage reporting

## Configuration

### Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_API_BASE_PATH=/api/v1

# App Configuration
VITE_APP_NAME=Property Management
VITE_APP_DESCRIPTION=Enterprise Property Management SaaS
```

### Tailwind CSS

Custom color scheme with CSS variables for easy theming. Light and dark mode support.

### TypeScript

Strict mode enabled with path aliases for cleaner imports:

```typescript
import { Button } from '@/shared/components'
import { useAuth } from '@/shared/hooks'
import { apiClient } from '@/shared/services'
```

## Security

- **CORS** - Environment-aware CORS policies
- **XSS Protection** - React's default escaping
- **CSRF** - Handled by backend
- **Token Security** - Secure refresh token rotation
- **Rate Limiting** - Configured on backend
- **Input Validation** - Zod schema validation

## Performance

- Code splitting with Vite
- Lazy route loading ready
- React Query caching
- Tailwind CSS purging
- Image optimization ready
- Bundle analysis setup

## Testing Strategy

### Unit Tests

- Component rendering
- Utility functions
- Hook behavior

### Integration Tests

- Form submission
- API interactions
- Route protection

### Component Tests

- UI behavior
- User interactions
- Error states

Run tests with:

```bash
npm run test
npm run test:watch
npm run test:coverage
```

## Deployment

### Sprint UI-4 - Enterprise Admin Application (Latest)

**New Features & Pages:**
- ✅ Organization Team Members page (`/organization/members`)
- ✅ Roles & Permissions page (`/rbac`)
- ✅ Leases management page (`/leases`)
- ✅ Payments workspace (`/payments`, `/payments/create`, `/payments/:id`, `/payments/:id/edit`)
- ✅ Maintenance workspace (`/maintenance`, `/maintenance/create`, `/maintenance/:id`, `/maintenance/:id/edit`)
- ✅ Maintenance requests page (`/maintenance`)
- ✅ Enhanced TopNav with user profile dropdown
- ✅ Improved Sidebar with complete navigation
- ✅ Mobile-responsive admin layout
- ✅ Fixed authentication flow with proper token refresh
- ✅ RBAC-aware navigation (role-based menu visibility)

**Authentication Improvements:**
- Fixed API URL configuration (localhost:5000)
- Improved token refresh interceptor
- Better session persistence
- Enhanced error handling for 401 responses
- Proper redirection on logout

### Production Build

```bash
npm run build
```

This generates an optimized build in the `dist/` directory.

### Deployment Checklist

- [ ] Environment variables configured
- [ ] API URL points to production backend
- [ ] All tests passing
- [ ] Build succeeds
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Code coverage acceptable

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the project structure
2. Use TypeScript for type safety
3. Create tests for new features
4. Run `npm run ci` before committing
5. Update documentation

## Troubleshooting

### Port already in use

```bash
# Use a different port
npm run dev -- --port 5174
```

### Module not found

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Build fails

```bash
# Clear build cache
rm -rf dist
npm run build
```

## License

ISC

## Support

For issues and questions, contact the development team.
