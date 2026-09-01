# Deployment Checklist

## 1) Pre-Deployment Checks

### 1.1 Install and Build
- `npm ci`
- `npm run prisma:generate`
- `npm run build`
- Optional quality gate: `npm run lint`

### 1.2 Database Readiness
- Confirm `DATABASE_URL` (or pooler URL envs) points to target environment.
- Run production migration command before release:
  - `npx prisma migrate deploy`
- If schema changes were made, verify generated Prisma client is up-to-date.

### 1.3 Secrets and Environment
- Verify required env vars are set in Vercel project settings.
- Confirm sensitive keys are set only in secure environment storage.
- Confirm `CRON_SECRET` is set and matches cron caller header.

## 2) Vercel and Build Config

### 2.1 Vercel Cron
- `vercel.json` defines:
  - path: `/api/cron/assignment-reminders`
  - schedule: `0 8 * * *`

### 2.2 Next.js Build
- Project uses Next.js App Router and Turbopack config in `next.config.mjs`.
- Validate all route handlers compile during `next build`.

## 3) Supabase Pooler Setup (Supavisor / PgBouncer)

### 3.1 Runtime URL Strategy
- Preferred runtime env: `DATABASE_POOLER_URL` (or `SUPABASE_POOLER_URL`) with:
  - `pgbouncer=true`
  - `connection_limit=1`
  - `sslmode=require`
- Fallback: `DATABASE_URL`.

### 3.2 Prisma Runtime Behavior
- `lib/prismaClient.ts` auto-enforces:
  - `sslmode=require` if missing.
  - pooler params for `*.pooler.supabase.com` hosts.

### 3.3 Migrations URL
- Keep direct non-transaction URL for migrations (`DIRECT_URL`) in ops playbook even if not currently wired in schema.

## 4) Release Execution Steps

1. Merge approved changes to release branch.
2. Ensure Vercel environment variables are updated.
3. Execute DB migration (`prisma migrate deploy`).
4. Trigger Vercel deployment.
5. Verify deployment logs for route/build errors.

## 5) Post-Deployment Smoke Tests

### 5.1 Core Availability
- `GET /api/status` returns `200`.
- Load primary routes: student dashboard, practice, resources, progress.

### 5.2 Auth and Session
- Teacher login/logout flow works.
- Admin login and session verification works.
- Student logout endpoint clears auth cookies.

### 5.3 Feature Workflows
- Practice generate and submit endpoints return expected payloads.
- Assignment generate and submit flows succeed.
- Podcast access check and generation flow works for enabled users.
- Notifications endpoints return data for each role.

### 5.4 Data Integrity
- New submissions/attempts persist to database.
- XP logs and badge writes occur after practice/assignment actions.
- No BigInt serialization errors in API responses.

### 5.5 Scheduled Jobs
- Trigger or wait for cron execution and verify reminder sending metrics/logs.

## 6) Rollback Readiness
- Keep previous Vercel deployment ready for instant rollback.
- Keep DB backup/restore strategy documented before schema-changing releases.
- In incident mode, disable optional premium flows with feature flags/access table while root cause is fixed.
