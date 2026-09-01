# Environment Variables Reference

Source: codebase `process.env.*`, Prisma `env("...")`, and `.env.example`.

| Variable Name | Type / Format | Environment (Local / Vercel) | Description | Secret |
|---|---|---|---|---|
| `DATABASE_URL` | PostgreSQL URL | Local + Vercel | Primary Prisma datasource URL fallback | Yes |
| `DATABASE_POOLER_URL` | PostgreSQL URL (pooler) | Vercel (preferred), Local optional | Runtime DB URL for serverless pooling | Yes |
| `SUPABASE_POOLER_URL` | PostgreSQL URL (pooler) | Vercel (preferred), Local optional | Alternate pooled runtime DB URL | Yes |
| `DIRECT_URL` | PostgreSQL URL (direct) | Local + CI/CD | Migration/direct connection URL (ops convention) | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | URL | Local + Vercel | Supabase project URL used by browser client | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Token string | Local + Vercel | Public Supabase anon key for browser auth calls | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Token string | Local + Vercel | Alternate publishable key variant in `.env.example` | No |
| `SUPABASE_URL` | URL | Local + Vercel | Server-side Supabase endpoint alias in `.env.example` | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Token string | Local + Vercel | Privileged Supabase key for server-side storage/API operations | Yes |
| `GEMINI_API_KEY` | API key | Local + Vercel | Google GenAI key for Gemini content generation | Yes |
| `TTS_PROVIDER` | Enum (`edge` / `elevenlabs`) | Local + Vercel | Provider switch contract for TTS abstraction | No |
| `ELEVENLABS_API_KEY` | API key | Local + Vercel | ElevenLabs API authentication | Yes |
| `ELEVENLABS_MODEL_ID` | Model ID string | Local + Vercel | Default ElevenLabs voice model id | No |
| `ELEVENLABS_HOST_VOICE_ID` | Voice ID string | Local + Vercel | Host voice configuration | No |
| `ELEVENLABS_COHOST_VOICE_ID` | Voice ID string | Local + Vercel | Co-host voice configuration | No |
| `ELEVENLABS_ANSWER_VOICE_ID` | Voice ID string | Local + Vercel | Q&A answer voice configuration | No |
| `GOOGLE_TTS_CLIENT_EMAIL` | Service account email | Local + Vercel | Google TTS service account identity | Yes |
| `GOOGLE_TTS_PRIVATE_KEY` | PEM private key text | Local + Vercel | Google TTS signing/private key material | Yes |
| `GOOGLE_TTS_PROJECT_ID` | GCP project id | Local + Vercel | Google TTS project context | No |
| `RESEND_API_KEY` | API key | Local + Vercel | Email delivery provider key | Yes |
| `EMAIL_FROM` | Email address | Local + Vercel | Sender identity for transactional emails | No |
| `TEACHER_SESSION_SECRET` | Long random string | Local + Vercel | HMAC secret for `sa-teacher-session` token signing | Yes |
| `CRON_SECRET` | Token string | Vercel + caller | Bearer secret for scheduled reminder endpoint | Yes |
| `SUPER_ADMIN_NAME` | String | Local bootstrap + secure env | Seed script/admin bootstrap display name | No |
| `SUPER_ADMIN_EMAIL` | Email | Local bootstrap + secure env | Seed script/admin bootstrap account email | No |
| `SUPER_ADMIN_PASSWORD` | Password string | Local bootstrap + secure env | Seed script/admin bootstrap password | Yes |
| `NEXT_PUBLIC_API_URL` | URL | Local + Vercel | Client-side base URL for API calls where needed | No |
| `NEXT_PUBLIC_APP_URL` | URL | Local + Vercel | Public app URL used for links/callbacks | No |
| `NEXT_PUBLIC_GAMIFICATION_ENABLED` | Boolean-like string (`false` disables) | Local + Vercel | Global gamification feature flag | No |
| `NODE_ENV` | Enum (`development`, `production`, `test`) | Local + Vercel | Runtime mode; affects secure cookie behavior | No |
| `PORT` | Integer | Local (Express) | Express supplemental server port | No |

## Notes
- Excluded noise sources: dependency/build outputs and tool internals (for example `.next`, `node_modules`, transpiled artifacts, and framework/runtime-injected env keys such as many `__NEXT_*` entries) were intentionally excluded from the env inventory.
- Public variables (`NEXT_PUBLIC_*`) are exposed to browser code and must never contain secrets.
- Service account keys and API keys must be rotated if exposure is suspected.
- Pooler URLs should include `pgbouncer=true`, `connection_limit=1`, and `sslmode=require` for serverless runtime stability.
