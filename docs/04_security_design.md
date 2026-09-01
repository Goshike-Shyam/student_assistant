# Security Design

## 1) Authentication and Session Lifecycle

### 1.1 Student
- Primary client auth is Supabase client-side session usage.
- API identity is often resolved from `x-user-id` header or `userId/childId` query params.
- Middleware does not enforce student cookie auth.
- Logout endpoint clears broad cookie set, and client is expected to clear local/session storage.

### 1.2 Teacher
- Cookie: `sa-teacher-session`.
- Token design: signed payload (`base64url.payload.signature`) using HMAC-SHA256.
- Secret: `TEACHER_SESSION_SECRET`.
- Session payload: `teacherId`, `name`, `email`, `exp`.
- Lifetime: 7 days.

### 1.3 Admin
- Cookie: `sa-admin-session`.
- Stored value is JSON session blob and re-validated against DB (`isActive`, role/email consistency).
- Lifetime: 24 hours on login route.

### 1.4 Middleware Enforcement
- Protected admin pages require `sa-admin-session` except `admin/login` and `admin/accept-invite`.
- Protected teacher pages require `sa-teacher-session` except login/register/verify paths.

## 2) Authorization / RBAC Matrix

| Resource Area | Student | Teacher | Parent | Admin | Internal |
|---|---:|---:|---:|---:|---:|
| Student progress/preferences/gamification | Allow own data | Deny | Parent view via separate routes | Operational visibility only | Deny |
| Teacher classes/assignments/analytics | Deny | Allow own scope | Deny | Oversight through admin routes | Deny |
| Parent preferences/notifications | Deny | Deny | Allow own scope | Oversight optional | Deny |
| Admin users/credits/feature toggles | Deny | Deny | Deny | Allow | Deny |
| Podcast generation | Feature-gated | Feature-gated | N/A | Manage access | Deny |
| Cron reminders | Deny | Deny | Deny | Deny | Allow with `CRON_SECRET` |

## 3) OWASP-Oriented Controls

### 3.1 Input Validation
- Current pattern is mostly manual validation (`if (!field)`, type checks, parsing).
- Zod-specific schema validation is not present in scanned handlers.
- Security implication: inconsistent validation coverage across endpoints.

### 3.2 SQL Injection Defense
- Primary data access uses Prisma query builder (strong baseline against SQL injection).
- Risk surface exists where `$queryRawUnsafe` / `$executeRawUnsafe` are used.
- Existing usage passes bind params, which reduces risk, but unsafe APIs still increase audit burden.

### 3.3 Brute Force / Rate Limiting
- Teacher login: in-memory lockout (`5 attempts / 15 minutes`).
- Admin login: in-memory lockout keyed by IP + email + user-agent (`5 attempts / 15 minutes`).
- Podcast endpoint translates provider quota/rate errors to controlled responses (`429`).

### 3.4 Secrets Hygiene
- Env-based secret loading for DB, AI, TTS, email, and session signing.
- `.env*` and service account filename are listed in ignore file.
- Operational caution: repository contains a service account file path (`service-account-tts.json`) in workspace; ensure it is never committed and rotate if exposure is suspected.

## 4) Security Strengths
- Clear admin/teacher middleware boundaries.
- Signed teacher session token with expiry and timing-safe signature comparison.
- Login routes use generic auth failure messages (reduce account enumeration leakage).
- Feature gating for premium resources via DB-backed access table.

## 5) Security Gaps and Hardening Priorities

| Priority | Gap | Recommended Action |
|---|---|---|
| High | Student identity can be query/header based without strong server-side session assertion | Add server-validated student session/JWT checks for protected student APIs |
| High | Unsafe raw SQL methods in gamification/streak paths | Migrate to `prisma.$queryRaw` / typed queries where possible |
| Medium | In-memory login rate limit is not distributed | Move to Redis/edge KV for multi-instance consistency |
| Medium | No centralized schema validation layer | Adopt Zod schemas per route and shared validation middleware |
| Medium | Mixed cookie/session paradigms increase attack surface | Standardize token lifecycle and rotation strategy across roles |

## 6) Standard Error Security Posture
- 400: validation failures, missing parameters.
- 401: missing/invalid auth context.
- 403: authorization or feature-access denial.
- 429: lockout or upstream rate-limit conditions.
- 500: internal failures with server-side logging.
