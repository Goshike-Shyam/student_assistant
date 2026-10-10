# Tech Stack Decisions (ADR)

## ADR-001: Next.js App Router

### Context
The product needs role-based UI surfaces (student, teacher, parent, admin), server-rendered routes, and colocated API handlers.

### Decision
Adopt Next.js App Router as primary web framework and runtime boundary for UI plus API route handlers.

### Consequences
- Positive:
  - Unified routing and data layer in one codebase.
  - Easy role-segmented routes under `app/**`.
  - Native support for middleware-based route protection.
- Trade-offs:
  - Mixed server/client component model increases cognitive load.
  - Requires strict separation of browser-only logic and server-only secrets.

## ADR-002: Prisma ORM Over Direct SQL

### Context
The platform has multi-domain relational data (learning, assignments, teacher workflows, notifications, gamification) and needs type-safe access.

### Decision
Use Prisma ORM and generated client for all primary DB interactions.

### Consequences
- Positive:
  - Typed schema and query API.
  - Better maintainability for evolving domain models.
  - Mapping support (`@@map`, `@map`) for legacy/table naming compatibility.
- Trade-offs:
  - Some flows still rely on `$queryRawUnsafe`, creating localized security/maintenance risk.
  - BigInt serialization must be normalized in API responses.

## ADR-003: Supabase PostgreSQL + Pooler-First Runtime

### Context
Serverless deployment can exhaust DB connections without pooling.

### Decision
Use Supabase PostgreSQL as primary DB and prefer pooled runtime connections (`DATABASE_POOLER_URL` or `SUPABASE_POOLER_URL`) with `pgbouncer=true`.

### Consequences
- Positive:
  - Better connection stability in serverless environments.
  - SSL and low connection fan-out enforced by Prisma client URL normalization.
- Trade-offs:
  - Migration flows still require direct connection planning.
  - Operational complexity around multiple DB URL variants.

## ADR-004: Multi-Provider TTS (Edge/ElevenLabs) With Optional Google TTS Utility

### Context
The product requires podcast/answer audio generation with cost and availability flexibility.

### Decision
Use provider-switch abstraction (`lib/tts-provider.ts`) that can route to Edge TTS (dev/cost-aware) or ElevenLabs (production-quality), while retaining Google TTS utility support in codebase.

### Consequences
- Positive:
  - Vendor flexibility and graceful failover path by configuration/code switch.
  - Feature-gated access to control premium cost footprint.
- Trade-offs:
  - Current hardcoded provider (`edge`) diverges from env-driven contract.
  - Multiple provider implementations increase testing matrix.

## ADR-005: Hybrid Auth (Supabase + Custom Role Cookies)

### Context
Different role areas evolved with distinct auth requirements and timelines.

### Decision
Keep teacher/parent/admin on dedicated session cookies and maintain student-side Supabase/local identity flow with gradual migration toward stronger server-side session checks.

### Consequences
- Positive:
  - Fast role-isolated implementation for teacher/admin controls.
  - Middleware checks for privileged portals.
- Trade-offs:
  - Inconsistent auth mechanism across roles.
  - Some student APIs still rely on header/query identity and need stronger server-side verification roadmap.
