**Vercel KV / Upstash Redis — Setup & Deployment**

This document explains how to configure Vercel KV (or Upstash Redis) env variables locally and in your Vercel project so `lib/rate-limit.ts` can use the store.

1) Local dev

- Copy `.env.local.example` to `.env.local` and paste your secret values (never commit `.env.local`).

  ```bash
  cp .env.local.example .env.local
  # then edit .env.local and paste values
  ```

2) Vercel (recommended for production)

- Option A — Vercel dashboard
  - Open your Vercel project -> Settings -> Environment Variables.
  - Add the following variables for `Production`, `Preview` and `Development` as appropriate:
    - `VERCEL_KV_REST_URL` = <your KV REST URL>
    - `VERCEL_KV_REST_TOKEN` = <your KV token>
  - (Optional) If you're using Upstash Redis, instead set:
    - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, and map them to the names your code expects.

- Option B — Vercel CLI

  ```bash
  # install vercel CLI if needed
  npm i -g vercel

  # add production values (you will be prompted to paste the secret)
  vercel env add VERCEL_KV_REST_URL production
  vercel env add VERCEL_KV_REST_TOKEN production

  # repeat for preview and development
  vercel env add VERCEL_KV_REST_URL preview
  vercel env add VERCEL_KV_REST_TOKEN preview

  vercel env add VERCEL_KV_REST_URL development
  vercel env add VERCEL_KV_REST_TOKEN development
  ```

3) Using Upstash Redis (alternative)

- Create a REST API redis database at https://upstash.com and copy the `REST_URL` and `REST_TOKEN`.
- In Vercel, set `VERCEL_KV_REST_URL` = `UPSTASH_REDIS_REST_URL` and `VERCEL_KV_REST_TOKEN` = `UPSTASH_REDIS_REST_TOKEN` (or set the UPSTASH variables and adapt code to read them).

4) Notes & troubleshooting

- The repo currently imports `@vercel/kv` and the library will read REST credentials from environment variables. If you prefer Upstash, either:
  - Set the Upstash REST vars into the `VERCEL_KV_REST_URL/TOKEN` names above, or
  - Swap the Redis client implementation to `@upstash/redis` and update `lib/rate-limit.ts` accordingly.
- The `@vercel/kv` package may show a deprecation warning. For new projects, Upstash + Vercel Redis integration is recommended.
- After setting env vars on Vercel, redeploy the project (or `vercel --prod`) so the runtime picks up new envs.

5) Quick deploy commands

```bash
# deploy preview
vercel --prod

# redeploy after changing envs
vercel --prod --force
```

If you'd like, I can:
- add a small helper that falls back to `UPSTASH_REDIS_REST_URL` if `VERCEL_KV_REST_URL` is missing, or
- switch `lib/rate-limit.ts` to use `@upstash/redis` instead. Tell me which you prefer.
