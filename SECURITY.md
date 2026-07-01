# Security Policy

## Supported versions

Version 1.0 (Release Candidate) is the currently supported line.

## Reporting a vulnerability

Please report security vulnerabilities privately to the maintainers rather than opening
a public issue. Include:

- a description of the vulnerability and its impact,
- steps to reproduce or a proof of concept,
- affected component (API or frontend) and version.

You can expect an acknowledgement within a few business days.

## Security posture

### Authentication & session management

- JWT access tokens (short-lived) plus refresh tokens (rotated on use).
- Refresh flow uses single-flight rotation on the client to avoid race conditions; a
  failed refresh clears the session and redirects to `/login`.
- Passwords are hashed with bcrypt (configurable cost via `BCRYPT_ROUNDS`).
- Brute-force protection locks accounts after repeated failed logins.

### Authorization

- Role-Based Access Control (RBAC) is enforced server-side by middleware on protected
  routes and re-checked in the UI via permission gates. UI gating is a UX convenience;
  the API is the source of truth.
- Requests are scoped to the caller's organization (multi-tenant isolation).

### Transport & headers

- Helmet sets secure HTTP headers on API responses.
- The frontend nginx image sets `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, and `X-XSS-Protection`.
- CORS uses an explicit allow-list (`CORS_ORIGIN`); avoid `*` in production.

### Rate limiting

- Global API rate limiting plus stricter limits for auth and password-reset endpoints.

### Input validation

- All API inputs are validated with Zod schemas before reaching business logic.

### Logging

- The frontend uses a production-safe logger that suppresses debug/info logs in
  production builds and never logs credentials or tokens.
- Backend logging is structured (Winston) with a configurable level; avoid logging
  secrets or full tokens.

## Known trade-offs / limitations

- **Token storage**: Access and refresh tokens are stored in `localStorage` for SPA
  convenience. This is susceptible to XSS token theft. Mitigations in place: strict
  input handling, no `dangerouslySetInnerHTML` on untrusted data, security headers, and
  CSP-friendly nginx config. Migrating to `HttpOnly` cookies + CSRF tokens would require
  coordinated backend changes and is tracked as a future hardening item.
- **CSRF**: Because the API is token-based (bearer header) rather than cookie-based, it
  is not vulnerable to classic CSRF. If cookie-based auth is adopted, CSRF protection
  must be added.

## Secure configuration checklist

- [ ] Strong, unique `JWT_SECRET`
- [ ] `CORS_ORIGIN` restricted to trusted origins
- [ ] TLS enforced end-to-end
- [ ] Rate-limit and brute-force thresholds reviewed for expected traffic
- [ ] Secrets provided via environment/secret manager, never committed
- [ ] `NODE_ENV=production`
