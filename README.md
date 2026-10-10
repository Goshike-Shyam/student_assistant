# School Project Workspace

Production-oriented educational LMS platform with role-based experiences for students, parents, teachers, and administrators.

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL (Supabase)
- Google Gemini integration (`@google/genai`)
- Role-scoped auth/session flows (student, parent, teacher, admin)
- Supplemental Express server for legacy/support endpoints

## Major Product Areas

- Student: dashboard, practice, assignments, progress, AI tutor
- Parent: child progress/assignments/reports/preferences
- Teacher: classes, assignments, analytics, student tracking
- Admin: users, credits, content/features, feedback moderation
- Feedback and Testimonials:
  - `/feedback` submission flow (student/parent/teacher)
  - AI tone classification
  - `/admin/feedback` moderation
  - Landing page testimonials from approved records

## Local Setup

1. Install dependencies
```bash
npm install
```

2. Configure environment variables
- Create or update `.env`/`.env.local` with required DB, auth, and API keys.
- Reference [docs/09_env_variables_reference.md](docs/09_env_variables_reference.md) for expected variables.

3. Generate Prisma client
```bash
npm run prisma:generate
```

4. Run development servers
```bash
npm run dev
```

## Useful Scripts

- `npm run dev`: run Next.js + Express concurrently
- `npm run dev:web`: run Next.js app only
- `npm run dev:api`: run Express API only
- `npm run build`: production build (Next.js)
- `npm run start`: start built Next.js app
- `npm run lint`: lint project
- `npm run format`: format repository
- `npm run prisma:generate`: regenerate Prisma client
- `npm run prisma:migrate`: create/apply dev migration
- `npm run db:studio`: open Prisma Studio
- `npm run seed:admin`: seed super-admin account

## Documentation

- Architecture: [docs/01_system_architecture.md](docs/01_system_architecture.md)
- API Reference: [docs/02_api_reference.md](docs/02_api_reference.md)
- DB Schema: [docs/03_db_schema.md](docs/03_db_schema.md)
- Security: [docs/04_security_design.md](docs/04_security_design.md)
- Deployment: [docs/05_deployment_checklist.md](docs/05_deployment_checklist.md)

## Notes

- The `feedback` attachment route currently writes to `public/uploads/feedback` for dev compatibility.
- Production rollout should migrate feedback attachments to durable object storage (Supabase Storage).
