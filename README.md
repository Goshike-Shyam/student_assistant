# School Project Workspace

Next.js 14 App Router starter with React, Tailwind CSS, shadcn-style UI components, Supabase client integration, Prisma ORM, and a basic Express API server.

## Setup

1. Copy `.env.example` to `.env` and fill in your Supabase and database credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Start the dev environment:
   ```bash
   npm run dev
   ```

## Structure

- `app/` — Next.js App Router pages and layout
- `components/` — UI components
- `lib/` — shared helpers and Supabase client
- `server/` — Express API server for supplemental endpoints
- `prisma/` — database schema and migrations
- `app/login` — Supabase magic-link sign-in flow
- `app/profile` — authenticated session preview

## Scripts

- `npm run dev`: start both Next.js and Express servers
- `npm run dev:web`: run only the Next.js app
- `npm run dev:api`: run only the Express API
- `npm run build`: build the Next.js app
- `npm run lint`: run Next.js ESLint
- `npm run format`: format files with Prettier

## Notes

This starter is configured for Supabase-authenticated users and Prisma-backed data storage. After installing dependencies, sign in via `/login` and verify your session at `/profile`.

Replace the example schema and API routes with your custom application logic.
