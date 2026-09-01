-- Gamification infrastructure (PostgreSQL)
-- Creates new tables in public schema and adds optional columns
-- to children/parents only when those tables exist.

CREATE TABLE IF NOT EXISTS "student_xp_log" (
  "id" BIGSERIAL NOT NULL,
  "child_id" VARCHAR(64) NOT NULL,
  "action" VARCHAR(50) NOT NULL,
  "xp_earned" INTEGER NOT NULL,
  "reference_id" VARCHAR(100),
  "month_year" VARCHAR(7) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "student_xp_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_student_xp_child_month"
  ON "student_xp_log"("child_id", "month_year");

CREATE INDEX IF NOT EXISTS "idx_student_xp_action"
  ON "student_xp_log"("action");

CREATE TABLE IF NOT EXISTS "student_badges" (
  "id" BIGSERIAL NOT NULL,
  "child_id" VARCHAR(64) NOT NULL,
  "badge_id" VARCHAR(50) NOT NULL,
  "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "student_badges_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "uq_child_badge" UNIQUE ("child_id", "badge_id")
);

CREATE TABLE IF NOT EXISTS "student_preferences" (
  "child_id" VARCHAR(64) NOT NULL,
  "dashboard_theme" VARCHAR(30) NOT NULL DEFAULT 'classic',
  "comic_theme" VARCHAR(30) NOT NULL DEFAULT 'none',
  "avatar_json" TEXT,
  "gamification_on" BOOLEAN NOT NULL DEFAULT true,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "student_preferences_pkey" PRIMARY KEY ("child_id")
);

DO $$
BEGIN
  IF to_regclass('public.parents') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'parents'
        AND column_name = 'gamification_disabled'
    ) THEN
      ALTER TABLE "parents"
      ADD COLUMN "gamification_disabled" BOOLEAN NOT NULL DEFAULT false;
    END IF;
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.children') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'children'
        AND column_name = 'login_streak'
    ) THEN
      ALTER TABLE "children"
      ADD COLUMN "login_streak" INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'children'
        AND column_name = 'last_login_date'
    ) THEN
      ALTER TABLE "children"
      ADD COLUMN "last_login_date" DATE;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'children'
        AND column_name = 'longest_streak'
    ) THEN
      ALTER TABLE "children"
      ADD COLUMN "longest_streak" INTEGER NOT NULL DEFAULT 0;
    END IF;
  END IF;
END
$$;
