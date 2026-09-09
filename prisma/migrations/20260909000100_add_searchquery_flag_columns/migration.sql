-- Add missing moderation columns expected by Prisma schema.
-- This is additive and safe for existing data.
ALTER TABLE "SearchQuery"
  ADD COLUMN IF NOT EXISTS "is_flagged" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "flag_reason" VARCHAR(200);
