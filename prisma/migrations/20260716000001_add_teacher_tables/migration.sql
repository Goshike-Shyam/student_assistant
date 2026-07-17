-- ============================================================
-- Migration: add_teacher_tables
-- Adds all Teacher-role tables and updates User relations
-- ============================================================

-- CreateTable: teachers
CREATE TABLE "teachers" (
    "id"             BIGSERIAL    NOT NULL,
    "name"           VARCHAR(255) NOT NULL,
    "email"          VARCHAR(320) NOT NULL,
    "password_hash"  VARCHAR(255) NOT NULL,
    "school_name"    VARCHAR(255) NOT NULL,
    "mobile"         VARCHAR(512),
    "is_active"      BOOLEAN      NOT NULL DEFAULT true,
    "email_verified" BOOLEAN      NOT NULL DEFAULT false,
    "last_login"     TIMESTAMP(3),
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: teacher_classes
CREATE TABLE "teacher_classes" (
    "id"            BIGSERIAL    NOT NULL,
    "teacher_id"    BIGINT       NOT NULL,
    "class_name"    VARCHAR(100) NOT NULL,
    "grade"         VARCHAR(5)   NOT NULL,
    "board"         VARCHAR(20)  NOT NULL,
    "academic_year" VARCHAR(20)  NOT NULL DEFAULT '2024-25',
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: teacher_class_subjects
CREATE TABLE "teacher_class_subjects" (
    "id"           BIGSERIAL    NOT NULL,
    "teacher_id"   BIGINT       NOT NULL,
    "class_id"     BIGINT       NOT NULL,
    "subject_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "teacher_class_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable: class_enrollments
CREATE TABLE "class_enrollments" (
    "id"          BIGSERIAL    NOT NULL,
    "class_id"    BIGINT       NOT NULL,
    "child_id"    VARCHAR(36)  NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: teacher_assignments
CREATE TABLE "teacher_assignments" (
    "id"             BIGSERIAL    NOT NULL,
    "teacher_id"     BIGINT       NOT NULL,
    "class_id"       BIGINT       NOT NULL,
    "subject"        VARCHAR(100) NOT NULL,
    "topic"          VARCHAR(255) NOT NULL,
    "complexity"     VARCHAR(20)  NOT NULL,
    "instructions"   TEXT,
    "questions_json" JSONB        NOT NULL,
    "total_marks"    INTEGER      NOT NULL,
    "due_date"       TIMESTAMP(3) NOT NULL,
    "is_published"   BOOLEAN      NOT NULL DEFAULT true,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: teacher_assignment_submissions
CREATE TABLE "teacher_assignment_submissions" (
    "id"                    BIGSERIAL    NOT NULL,
    "teacher_assignment_id" BIGINT       NOT NULL,
    "child_id"              VARCHAR(36)  NOT NULL,
    "answers_json"          JSONB,
    "ai_feedback_json"      JSONB,
    "teacher_feedback_json" JSONB,
    "teacher_reviewed_at"   TIMESTAMP(3),
    "teacher_released_at"   TIMESTAMP(3),
    "score"                 DECIMAL(5,2),
    "status"                VARCHAR(20)  NOT NULL DEFAULT 'NOT_STARTED',
    "submitted_at"          TIMESTAMP(3),
    "reminder_sent_at"      TIMESTAMP(3),
    "created_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"            TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: assignment_reminders
CREATE TABLE "assignment_reminders" (
    "id"                    BIGSERIAL    NOT NULL,
    "teacher_assignment_id" BIGINT       NOT NULL,
    "child_id"              VARCHAR(36)  NOT NULL,
    "parent_email"          VARCHAR(320) NOT NULL,
    "sent_at"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel"               VARCHAR(20)  NOT NULL DEFAULT 'EMAIL',

    CONSTRAINT "assignment_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable: class_invite_tokens
CREATE TABLE "class_invite_tokens" (
    "id"         BIGSERIAL    NOT NULL,
    "class_id"   BIGINT       NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used"    BOOLEAN      NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_invite_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable: teacher_question_bank
CREATE TABLE "teacher_question_bank" (
    "id"            BIGSERIAL    NOT NULL,
    "teacher_id"    BIGINT       NOT NULL,
    "subject"       VARCHAR(100) NOT NULL,
    "grade"         VARCHAR(5)   NOT NULL,
    "board"         VARCHAR(20)  NOT NULL,
    "question_json" JSONB        NOT NULL,
    "used_count"    INTEGER      NOT NULL DEFAULT 0,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_question_bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable: parent_communication_logs
CREATE TABLE "parent_communication_logs" (
    "id"           BIGSERIAL    NOT NULL,
    "teacher_id"   BIGINT       NOT NULL,
    "child_id"     VARCHAR(36)  NOT NULL,
    "parent_email" VARCHAR(320) NOT NULL,
    "message_type" VARCHAR(50)  NOT NULL,
    "subject"      VARCHAR(255) NOT NULL,
    "sent_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parent_communication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: teacher_verification_tokens
CREATE TABLE "teacher_verification_tokens" (
    "id"         BIGSERIAL    NOT NULL,
    "teacher_id" BIGINT       NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- ─── Unique Indexes ───────────────────────────────────────────────────────────

CREATE UNIQUE INDEX "teachers_email_key"
    ON "teachers"("email");

CREATE UNIQUE INDEX "uq_tcs"
    ON "teacher_class_subjects"("class_id", "subject_name");

CREATE UNIQUE INDEX "uq_enrollment"
    ON "class_enrollments"("class_id", "child_id");

CREATE UNIQUE INDEX "uq_submission"
    ON "teacher_assignment_submissions"("teacher_assignment_id", "child_id");

CREATE UNIQUE INDEX "teacher_verification_tokens_token_hash_key"
    ON "teacher_verification_tokens"("token_hash");

-- ─── Regular Indexes ─────────────────────────────────────────────────────────

CREATE INDEX "idx_tc_teacher"
    ON "teacher_classes"("teacher_id");

CREATE INDEX "idx_ce_class"
    ON "class_enrollments"("class_id");

CREATE INDEX "idx_ce_child"
    ON "class_enrollments"("child_id");

CREATE INDEX "idx_ta_teacher"
    ON "teacher_assignments"("teacher_id");

CREATE INDEX "idx_ta_class"
    ON "teacher_assignments"("class_id");

CREATE INDEX "idx_ta_due"
    ON "teacher_assignments"("due_date");

CREATE INDEX "idx_sub_assignment"
    ON "teacher_assignment_submissions"("teacher_assignment_id");

CREATE INDEX "idx_sub_child"
    ON "teacher_assignment_submissions"("child_id");

CREATE INDEX "idx_sub_status"
    ON "teacher_assignment_submissions"("status");

CREATE INDEX "idx_reminder_assignment"
    ON "assignment_reminders"("teacher_assignment_id", "child_id");

CREATE INDEX "idx_cit_token"
    ON "class_invite_tokens"("token_hash");

CREATE INDEX "idx_qb_teacher_subject"
    ON "teacher_question_bank"("teacher_id", "subject");

CREATE INDEX "idx_pcl_teacher_child"
    ON "parent_communication_logs"("teacher_id", "child_id");

CREATE INDEX "idx_tvt_token"
    ON "teacher_verification_tokens"("token_hash");

-- ─── Foreign Keys ────────────────────────────────────────────────────────────

-- teacher_classes → teachers
ALTER TABLE "teacher_classes"
    ADD CONSTRAINT "teacher_classes_teacher_id_fkey"
    FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- teacher_class_subjects → teacher_classes
ALTER TABLE "teacher_class_subjects"
    ADD CONSTRAINT "teacher_class_subjects_class_id_fkey"
    FOREIGN KEY ("class_id") REFERENCES "teacher_classes"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- class_enrollments → teacher_classes
ALTER TABLE "class_enrollments"
    ADD CONSTRAINT "class_enrollments_class_id_fkey"
    FOREIGN KEY ("class_id") REFERENCES "teacher_classes"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- class_enrollments → User (student)
ALTER TABLE "class_enrollments"
    ADD CONSTRAINT "class_enrollments_child_id_fkey"
    FOREIGN KEY ("child_id") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- teacher_assignments → teachers
ALTER TABLE "teacher_assignments"
    ADD CONSTRAINT "teacher_assignments_teacher_id_fkey"
    FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- teacher_assignments → teacher_classes
ALTER TABLE "teacher_assignments"
    ADD CONSTRAINT "teacher_assignments_class_id_fkey"
    FOREIGN KEY ("class_id") REFERENCES "teacher_classes"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- teacher_assignment_submissions → teacher_assignments
ALTER TABLE "teacher_assignment_submissions"
    ADD CONSTRAINT "teacher_assignment_submissions_teacher_assignment_id_fkey"
    FOREIGN KEY ("teacher_assignment_id") REFERENCES "teacher_assignments"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- teacher_assignment_submissions → User (student)
ALTER TABLE "teacher_assignment_submissions"
    ADD CONSTRAINT "teacher_assignment_submissions_child_id_fkey"
    FOREIGN KEY ("child_id") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- assignment_reminders → teacher_assignments
ALTER TABLE "assignment_reminders"
    ADD CONSTRAINT "assignment_reminders_teacher_assignment_id_fkey"
    FOREIGN KEY ("teacher_assignment_id") REFERENCES "teacher_assignments"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- class_invite_tokens → teacher_classes
ALTER TABLE "class_invite_tokens"
    ADD CONSTRAINT "class_invite_tokens_class_id_fkey"
    FOREIGN KEY ("class_id") REFERENCES "teacher_classes"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- teacher_verification_tokens → teachers
ALTER TABLE "teacher_verification_tokens"
    ADD CONSTRAINT "teacher_verification_tokens_teacher_id_fkey"
    FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- teacher_question_bank → teachers
ALTER TABLE "teacher_question_bank"
    ADD CONSTRAINT "teacher_question_bank_teacher_id_fkey"
    FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- parent_communication_logs → teachers
ALTER TABLE "parent_communication_logs"
    ADD CONSTRAINT "parent_communication_logs_teacher_id_fkey"
    FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
