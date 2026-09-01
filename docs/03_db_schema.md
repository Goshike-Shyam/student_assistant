# Database Schema

Source of truth: `prisma/schema.prisma`

## 1) Enums

| Enum | Values |
|---|---|
| `UserRole` | `STUDENT`, `INSTRUCTOR`, `ADMIN` |
| `AssignmentStatus` | `PENDING`, `SUBMITTED`, `GRADED` |
| `SubscriptionPlan` | `FREE`, `PREMIUM`, `ENTERPRISE` |
| `CurriculumType` | `CBSE`, `ICSE`, `STATE_BOARD`, `INTERNATIONAL` |
| `AdminRole` | `SUPER_ADMIN`, `CONTENT_MOD`, `SUPPORT`, `FINANCE` |
| `NotificationUserRole` | `STUDENT`, `TEACHER`, `PARENT`, `ADMIN` |
| `NotificationPriority` | `high`, `medium`, `low` |
| `NotificationCategory` | `assignment`, `feedback`, `reminder`, `submission`, `payment`, `report`, `system`, `progress` |

## 2) Entity Relationship Summary

| Model | Key Relations |
|---|---|
| `User` | 1:N with `Enrollment`, `Submission`, `SearchQuery`, `ConversationHistory`, `ParentReport`, `ChildSubject`, `GeneratedAssignment`, `PracticeTest`, `PracticeAttempt`, `ClassEnrollment`, `TeacherAssignmentSubmission`; instructor relation to `Course`; creator relation to `Assignment` |
| `Course` | N:1 to `User` (instructor), 1:N to `Enrollment`, `Assignment` |
| `Enrollment` | N:1 to `User`, N:1 to `Course` |
| `Assignment` | N:1 to `Course`, N:1 to `User` (creator), 1:N to `Submission` |
| `Submission` | N:1 to `Assignment`, N:1 to `User` (student) |
| `SearchQuery` | N:1 to `User`, 1:N to `SearchResponse`, `SearchAttachment`, `ConversationHistory` |
| `SearchResponse` | N:1 to `SearchQuery` |
| `SearchAttachment` | N:1 to `SearchQuery` |
| `ConversationHistory` | N:1 to `User`, N:1 to `SearchQuery` |
| `ParentReport` | N:1 to `User` |
| `ChildSubject` | N:1 to `User` |
| `GeneratedAssignment` | N:1 to `User` |
| `PracticeTest` | N:1 to `User`, 1:N to `PracticeAttempt` |
| `PracticeAttempt` | N:1 to `PracticeTest`, N:1 to `User` |
| `Admin` | Self-reference inviter/invitees, 1:N to `AdminInvite` |
| `AdminInvite` | N:1 to `Admin` |
| `Teacher` | 1:N to `TeacherClass`, `TeacherAssignment` |
| `TeacherClass` | N:1 to `Teacher`, 1:N to `TeacherClassSubject`, `ClassEnrollment`, `TeacherAssignment`, `ClassInviteToken` |
| `ClassEnrollment` | N:1 to `TeacherClass`, N:1 to `User` |
| `TeacherAssignment` | N:1 to `Teacher`, N:1 to `TeacherClass`, 1:N to `TeacherAssignmentSubmission`, `AssignmentReminder` |
| `TeacherAssignmentSubmission` | N:1 to `TeacherAssignment`, N:1 to `User` |
| `AssignmentReminder` | N:1 to `TeacherAssignment` |
| `ClassInviteToken` | N:1 to `TeacherClass` |
| `TeacherClassSubject` | N:1 to `TeacherClass` |

## 3) Data Dictionary (Complete)

Legend: `PK` primary key, `FK` foreign key, `UQ` unique, `IDX` index

### `User` (table: `User`)
- `id String PK @default(uuid())`
- `email String UQ`
- `name String`
- `password String`
- `role UserRole @default(STUDENT)`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- `grade Int?`
- `curriculum CurriculumType?`
- `location String?`
- `parentEmail String?`
- `subscriptionPlan SubscriptionPlan @default(FREE)`

### `Course` (table: `Course`)
- `id String PK @default(uuid())`
- `title String`
- `description String?`
- `code String UQ`
- `instructorId String FK -> User.id`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

### `Enrollment` (table: `Enrollment`)
- `id String PK @default(uuid())`
- `userId String FK -> User.id ON DELETE CASCADE`
- `courseId String FK -> Course.id ON DELETE CASCADE`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- Constraints: `@@unique([userId, courseId])`

### `Assignment` (table: `Assignment`)
- `id String PK @default(uuid())`
- `title String`
- `description String?`
- `courseId String FK -> Course.id ON DELETE CASCADE`
- `createdBy String FK -> User.id`
- `dueDate DateTime?`
- `status AssignmentStatus @default(PENDING)`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

### `Submission` (table: `Submission`)
- `id String PK @default(uuid())`
- `assignmentId String FK -> Assignment.id ON DELETE CASCADE`
- `studentId String FK -> User.id ON DELETE CASCADE`
- `contents String`
- `grade Float?`
- `feedback String?`
- `submittedAt DateTime @default(now())`
- `gradedAt DateTime?`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- Constraints: `@@unique([assignmentId, studentId])`

### `SearchQuery` (table: `SearchQuery`)
- `id String PK @default(uuid())`
- `studentId String FK -> User.id ON DELETE CASCADE`
- `query String`
- `subject String?`
- `conversationId String?`
- `attachmentIds String[] @default([])`
- `voiceInput Boolean @default(false)`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

### `SearchResponse` (table: `SearchResponse`)
- `id String PK @default(uuid())`
- `queryId String FK -> SearchQuery.id ON DELETE CASCADE`
- `response String`
- `resourceLinks String[] @default([])`
- `sourceLinks String[] @default([])`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

### `SearchAttachment` (table: `SearchAttachment`)
- `id String PK @default(uuid())`
- `queryId String FK -> SearchQuery.id ON DELETE CASCADE`
- `fileName String`
- `fileType String`
- `fileUrl String`
- `fileSize Int`
- `uploadedAt DateTime @default(now())`

### `ConversationHistory` (table: `ConversationHistory`)
- `id String PK @default(uuid())`
- `studentId String FK -> User.id ON DELETE CASCADE`
- `initialQueryId String FK -> SearchQuery.id ON DELETE CASCADE`
- `followUpQueries String[] @default([])`
- `conversationLog String`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

### `ParentReport` (table: `ParentReport`)
- `id String PK @default(uuid())`
- `parentId String FK -> User.id ON DELETE CASCADE`
- `reportDate DateTime @default(now())`
- `weekStartDate DateTime`
- `weekEndDate DateTime`
- `totalSearches Int @default(0)`
- `searchSummary String`
- `topicsExplored String[] @default([])`
- `reportUrl String?`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

### `ChildSubject` (table: `ChildSubject`)
- `id String PK @default(uuid())`
- `childId String FK -> User.id ON DELETE CASCADE`
- `subjectName String @db.VarChar(100)`
- `createdAt DateTime @default(now())`
- Constraints: `@@unique([childId, subjectName])`

### `GeneratedAssignment` (table: `GeneratedAssignment`)
- `id String PK @default(uuid())`
- `childId String FK -> User.id ON DELETE CASCADE`
- `subject String`
- `topic String`
- `title String`
- `instructions String`
- `board String`
- `grade Int`
- `complexity String`
- `questionsJson String`
- `submittedAnswersJson String?`
- `feedbackJson String?`
- `score Float?`
- `totalMarks Int`
- `estimatedMinutes Int`
- `submittedAt DateTime?`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

### `AiCreditLog` (table: `ai_credit_logs`)
- `id BigInt PK @default(autoincrement())`
- `userId String @map("user_id") @db.VarChar(36)`
- `userRole String @map("user_role") @db.VarChar(20)`
- `sessionId String? @map("session_id") @db.VarChar(36)`
- `feature String @db.VarChar(100)`
- `modelProvider String @default("GOOGLE") @map("model_provider") @db.VarChar(50)`
- `modelName String @default("gemini-2.5-flash") @map("model_name") @db.VarChar(100)`
- `promptTokens Int @default(0) @map("prompt_tokens")`
- `completionTokens Int @default(0) @map("completion_tokens")`
- `totalTokens Int @default(0) @map("total_tokens")`
- `costUsd Decimal @default(0) @map("cost_usd") @db.Decimal(10,6)`
- `latencyMs Int? @map("latency_ms")`
- `wasFallback Boolean @default(false) @map("was_fallback")`
- `fallbackReason String? @map("fallback_reason") @db.VarChar(255)`
- `createdAt DateTime @default(now()) @map("created_at")`
- Indexes: `idx_user(userId)`, `idx_date(createdAt)`, `idx_feature(feature)`

### `AiCreditDailySummary` (table: `ai_credit_daily_summary`)
- `id BigInt PK @default(autoincrement())`
- `summaryDate DateTime @map("summary_date") @db.Date`
- `userId String @map("user_id") @db.VarChar(36)`
- `userRole String @map("user_role") @db.VarChar(20)`
- `feature String @db.VarChar(100)`
- `modelName String @map("model_name") @db.VarChar(100)`
- `callCount Int @default(0) @map("call_count")`
- `totalTokens BigInt @default(0) @map("total_tokens")`
- `totalCostUsd Decimal @default(0) @map("total_cost_usd") @db.Decimal(12,6)`
- `updatedAt DateTime @updatedAt @map("updated_at")`
- Constraints: `@@unique([summaryDate, userId, feature, modelName], name: "uq_daily")`, `@@index([summaryDate, userId], name: "idx_date_user")`

### `Admin` (table: `admins`)
- `id BigInt PK @default(autoincrement())`
- `name String @db.VarChar(255)`
- `email String UQ @db.VarChar(320)`
- `passwordHash String @map("password_hash") @db.VarChar(255)`
- `role AdminRole @default(SUPPORT)`
- `isActive Boolean @default(true) @map("is_active")`
- `invitedBy BigInt? @map("invited_by")`
- `lastLogin DateTime? @map("last_login")`
- `createdAt DateTime @default(now()) @map("created_at")`
- `updatedAt DateTime @updatedAt @map("updated_at")`
- Self relation: inviter/invitees (`onDelete: SetNull`)

### `AdminInvite` (table: `admin_invites`)
- `id BigInt PK @default(autoincrement())`
- `email String @db.VarChar(320)`
- `role AdminRole`
- `tokenHash String @map("token_hash") @db.VarChar(255)`
- `invitedBy BigInt FK -> Admin.id ON DELETE CASCADE`
- `isUsed Boolean @default(false) @map("is_used")`
- `expiresAt DateTime @map("expires_at")`
- `usedAt DateTime? @map("used_at")`
- `createdAt DateTime @default(now()) @map("created_at")`
- Indexes: `idx_token(tokenHash)`, `idx_email(email)`

### `PracticeTest` (table: `practice_tests`)
- `id String PK @default(uuid())`
- `childId String @map("child_id") FK -> User.id ON DELETE CASCADE`
- `subject String`
- `topic String`
- `complexity String`
- `questionsJson String @map("questions_json")`
- `totalMarks Int @map("total_marks")`
- `durationMins Int @default(15) @map("duration_mins")`
- `createdAt DateTime @default(now()) @map("created_at")`
- Indexes: `idx_pt_child(childId)`, `idx_pt_child_subject(childId,subject)`

### `PracticeAttempt` (table: `practice_attempts`)
- `id String PK @default(uuid())`
- `practiceTestId String @map("practice_test_id") FK -> PracticeTest.id ON DELETE CASCADE`
- `childId String @map("child_id") FK -> User.id ON DELETE CASCADE`
- `answersJson String @map("answers_json")`
- `feedbackJson String? @map("feedback_json")`
- `score Float?`
- `marksAwarded Int? @map("marks_awarded")`
- `marksPossible Int? @map("marks_possible")`
- `timeTakenSecs Int? @map("time_taken_secs")`
- `completedAt DateTime? @map("completed_at")`
- `createdAt DateTime @default(now()) @map("created_at")`
- Indexes: `idx_pa_child_test(childId,practiceTestId)`, `idx_pa_child_date(childId,createdAt)`

### `Teacher` (table: `teachers`)
- `id BigInt PK @default(autoincrement())`
- `name String @db.VarChar(255)`
- `email String UQ @db.VarChar(320)`
- `passwordHash String @map("password_hash") @db.VarChar(255)`
- `schoolName String @map("school_name") @db.VarChar(255)`
- `mobile String? @db.VarChar(512)`
- `isActive Boolean @default(true) @map("is_active")`
- `emailVerified Boolean @default(false) @map("email_verified")`
- `lastLogin DateTime? @map("last_login")`
- `createdAt DateTime @default(now()) @map("created_at")`
- `updatedAt DateTime @updatedAt @map("updated_at")`

### `TeacherClass` (table: `teacher_classes`)
- `id BigInt PK @default(autoincrement())`
- `teacherId BigInt FK -> Teacher.id ON DELETE CASCADE`
- `className String @map("class_name") @db.VarChar(100)`
- `grade String @db.VarChar(5)`
- `board String @db.VarChar(20)`
- `academicYear String @default("2024-25") @map("academic_year")`
- `createdAt DateTime @default(now()) @map("created_at")`
- Index: `idx_tc_teacher(teacherId)`

### `TeacherClassSubject` (table: `teacher_class_subjects`)
- `id BigInt PK @default(autoincrement())`
- `teacherId BigInt @map("teacher_id")`
- `classId BigInt FK -> TeacherClass.id ON DELETE CASCADE`
- `subjectName String @map("subject_name") @db.VarChar(100)`
- Constraints: `@@unique([classId, subjectName], name: "uq_tcs")`

### `ClassEnrollment` (table: `class_enrollments`)
- `id BigInt PK @default(autoincrement())`
- `classId BigInt FK -> TeacherClass.id ON DELETE CASCADE`
- `childId String FK -> User.id ON DELETE CASCADE`
- `enrolledAt DateTime @default(now())`
- Constraints: `@@unique([classId, childId], name: "uq_enrollment")`
- Indexes: `idx_ce_class(classId)`, `idx_ce_child(childId)`

### `TeacherAssignment` (table: `teacher_assignments`)
- `id BigInt PK @default(autoincrement())`
- `teacherId BigInt FK -> Teacher.id ON DELETE CASCADE`
- `classId BigInt FK -> TeacherClass.id ON DELETE CASCADE`
- `subject String @db.VarChar(100)`
- `topic String @db.VarChar(255)`
- `complexity String @db.VarChar(20)`
- `instructions String? @db.Text`
- `questionsJson Json @map("questions_json")`
- `totalMarks Int @map("total_marks")`
- `dueDate DateTime @map("due_date")`
- `isPublished Boolean @default(true) @map("is_published")`
- `createdAt DateTime @default(now()) @map("created_at")`
- `updatedAt DateTime @updatedAt @map("updated_at")`
- Indexes: `idx_ta_teacher(teacherId)`, `idx_ta_class(classId)`, `idx_ta_due(dueDate)`

### `TeacherAssignmentSubmission` (table: `teacher_assignment_submissions`)
- `id BigInt PK @default(autoincrement())`
- `teacherAssignmentId BigInt FK -> TeacherAssignment.id ON DELETE CASCADE`
- `childId String FK -> User.id ON DELETE CASCADE`
- `answersJson Json?`
- `aiFeedbackJson Json?`
- `teacherFeedbackJson Json?`
- `teacherReviewedAt DateTime?`
- `teacherReleasedAt DateTime?`
- `score Decimal? @db.Decimal(5,2)`
- `status String @default("NOT_STARTED") @db.VarChar(20)`
- `submittedAt DateTime?`
- `reminderSentAt DateTime?`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- Constraints: `@@unique([teacherAssignmentId, childId], name: "uq_submission")`
- Indexes: `idx_sub_assignment(teacherAssignmentId)`, `idx_sub_child(childId)`, `idx_sub_status(status)`

### `AssignmentReminder` (table: `assignment_reminders`)
- `id BigInt PK @default(autoincrement())`
- `teacherAssignmentId BigInt FK -> TeacherAssignment.id ON DELETE CASCADE`
- `childId String`
- `parentEmail String @db.VarChar(320)`
- `sentAt DateTime @default(now())`
- `channel String @default("EMAIL") @db.VarChar(20)`
- Index: `idx_reminder_assignment(teacherAssignmentId,childId)`

### `ClassInviteToken` (table: `class_invite_tokens`)
- `id BigInt PK @default(autoincrement())`
- `classId BigInt FK -> TeacherClass.id ON DELETE CASCADE`
- `tokenHash String @db.VarChar(255)`
- `expiresAt DateTime`
- `isUsed Boolean @default(false)`
- `createdAt DateTime @default(now())`
- Index: `idx_cit_token(tokenHash)`

### `TeacherQuestionBank` (table: `teacher_question_bank`)
- `id BigInt PK @default(autoincrement())`
- `teacherId BigInt`
- `subject String @db.VarChar(100)`
- `grade String @db.VarChar(5)`
- `board String @db.VarChar(20)`
- `questionJson Json`
- `usedCount Int @default(0)`
- `createdAt DateTime @default(now())`
- Index: `idx_qb_teacher_subject(teacherId,subject)`

### `ParentCommunicationLog` (table: `parent_communication_logs`)
- `id BigInt PK @default(autoincrement())`
- `teacherId BigInt`
- `childId String`
- `parentEmail String @db.VarChar(320)`
- `messageType String @db.VarChar(50)`
- `subject String @db.VarChar(255)`
- `sentAt DateTime @default(now())`
- Index: `idx_pcl_teacher_child(teacherId,childId)`

### `Notification` (table: `notifications`)
- `id BigInt PK @default(autoincrement())`
- `userId String @db.VarChar(64)`
- `userRole NotificationUserRole`
- `title String @db.VarChar(255)`
- `body String @db.Text`
- `href String? @db.VarChar(500)`
- `priority NotificationPriority @default(medium)`
- `category NotificationCategory @default(system)`
- `isRead Boolean @default(false)`
- `createdAt DateTime @default(now())`
- Indexes: `idx_notif_user(userId,userRole,isRead)`, `idx_notif_created(createdAt)`

### `TeacherVerificationToken` (table: `teacher_verification_tokens`)
- `id BigInt PK @default(autoincrement())`
- `teacherId BigInt`
- `tokenHash String UQ @db.VarChar(255)`
- `expiresAt DateTime`
- `createdAt DateTime @default(now())`
- Index: `idx_tvt_token(tokenHash)`

### `StudentSession` (table: `student_sessions`)
- `id BigInt PK @default(autoincrement())`
- `childId String @db.VarChar(36)`
- `startedAt DateTime @default(now())`
- `endedAt DateTime?`
- `durationSecs Int?`
- `pageViews Int @default(0)`

### `Podcast` (table: `podcasts`)
- `id BigInt PK @default(autoincrement())`
- `queryId String? @db.VarChar(36)`
- `audioUrl String @db.VarChar(2048)`
- `segmentsJson String? @db.Text`
- `durationSecs Int?`
- `filePath String? @db.VarChar(500)`
- `createdAt DateTime @default(now())`

### `UserFeatureAccess` (table: `user_feature_access`)
- `id BigInt PK @default(autoincrement())`
- `userId String @db.VarChar(64)`
- `userRole String @db.VarChar(20)`
- `feature String @db.VarChar(50)`
- `isEnabled Boolean @default(false)`
- `enabledBy BigInt?`
- `enabledAt DateTime?`
- `notes String? @db.VarChar(500)`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- Constraints: `@@unique([userId, userRole, feature], name: "uq_user_feature")`
- Index: `@@index([feature, isEnabled])`

### `StudentXpLog` (table: `student_xp_log`)
- `id BigInt PK @default(autoincrement())`
- `childId String @db.VarChar(64)`
- `action String @db.VarChar(50)`
- `xpEarned Int`
- `referenceId String? @db.VarChar(100)`
- `monthYear String @db.VarChar(7)`
- `createdAt DateTime @default(now())`
- Indexes: `idx_student_xp_child_month(childId,monthYear)`, `idx_student_xp_action(action)`

### `StudentBadge` (table: `student_badges`)
- `id BigInt PK @default(autoincrement())`
- `childId String @db.VarChar(64)`
- `badgeId String @db.VarChar(50)`
- `awardedAt DateTime @default(now())`
- Constraint: `@@unique([childId, badgeId], name: "uq_child_badge")`

### `StudentPreferences` (table: `student_preferences`)
- `childId String PK @db.VarChar(64)`
- `dashboardTheme String @default("classic") @db.VarChar(30)`
- `comicTheme String @default("none") @db.VarChar(30)`
- `avatarJson String? @db.Text`
- `gamificationOn Boolean @default(true)`
- `updatedAt DateTime @updatedAt`
