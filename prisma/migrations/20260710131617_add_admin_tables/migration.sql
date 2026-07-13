-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'CONTENT_MOD', 'SUPPORT', 'FINANCE');

-- CreateTable
CREATE TABLE "ai_credit_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "user_role" VARCHAR(20) NOT NULL,
    "session_id" BIGINT,
    "feature" VARCHAR(100) NOT NULL,
    "model_provider" VARCHAR(50) NOT NULL DEFAULT 'GOOGLE',
    "model_name" VARCHAR(100) NOT NULL DEFAULT 'gemini-2.5-flash',
    "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
    "completion_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "cost_usd" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "latency_ms" INTEGER,
    "was_fallback" BOOLEAN NOT NULL DEFAULT false,
    "fallback_reason" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_credit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_credit_daily_summary" (
    "id" BIGSERIAL NOT NULL,
    "summary_date" DATE NOT NULL,
    "user_id" BIGINT NOT NULL,
    "user_role" VARCHAR(20) NOT NULL,
    "feature" VARCHAR(100) NOT NULL,
    "model_name" VARCHAR(100) NOT NULL,
    "call_count" INTEGER NOT NULL DEFAULT 0,
    "total_tokens" BIGINT NOT NULL DEFAULT 0,
    "total_cost_usd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_credit_daily_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'SUPPORT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "invited_by" BIGINT,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_invites" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "role" "AdminRole" NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "invited_by" BIGINT NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_user" ON "ai_credit_logs"("user_id");

-- CreateIndex
CREATE INDEX "idx_date" ON "ai_credit_logs"("created_at");

-- CreateIndex
CREATE INDEX "idx_feature" ON "ai_credit_logs"("feature");

-- CreateIndex
CREATE INDEX "idx_date_user" ON "ai_credit_daily_summary"("summary_date", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_credit_daily_summary_summary_date_user_id_feature_model__key" ON "ai_credit_daily_summary"("summary_date", "user_id", "feature", "model_name");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "idx_token" ON "admin_invites"("token_hash");

-- CreateIndex
CREATE INDEX "idx_email" ON "admin_invites"("email");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_invites" ADD CONSTRAINT "admin_invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
