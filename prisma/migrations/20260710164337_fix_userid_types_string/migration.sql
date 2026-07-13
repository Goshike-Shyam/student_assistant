-- AlterTable
ALTER TABLE "ai_credit_daily_summary" ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(36);

-- AlterTable
ALTER TABLE "ai_credit_logs" ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(36),
ALTER COLUMN "session_id" SET DATA TYPE VARCHAR(36);
