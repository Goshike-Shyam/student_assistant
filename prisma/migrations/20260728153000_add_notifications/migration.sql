-- Create enum types only if they do not already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationUserRole') THEN
    CREATE TYPE "NotificationUserRole" AS ENUM ('STUDENT', 'TEACHER', 'PARENT', 'ADMIN');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationPriority') THEN
    CREATE TYPE "NotificationPriority" AS ENUM ('high', 'medium', 'low');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationCategory') THEN
    CREATE TYPE "NotificationCategory" AS ENUM ('assignment', 'feedback', 'reminder', 'submission', 'payment', 'report', 'system', 'progress');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" BIGSERIAL NOT NULL,
  "user_id" VARCHAR(64) NOT NULL,
  "user_role" "NotificationUserRole" NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "body" TEXT NOT NULL,
  "href" VARCHAR(500),
  "priority" "NotificationPriority" NOT NULL DEFAULT 'medium',
  "category" "NotificationCategory" NOT NULL DEFAULT 'system',
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_notif_user"
  ON "notifications"("user_id", "user_role", "is_read");

CREATE INDEX IF NOT EXISTS "idx_notif_created"
  ON "notifications"("created_at");
