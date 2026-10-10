# API Reference

## 1) Conventions

- Base path: `/api`
- Content type: JSON unless noted.
- Dynamic route params use bracket notation in this document (example: `/teacher/assignments/[id]`).
- Auth labels:
  - `Public`
  - `Student`
  - `Teacher`
  - `Parent`
  - `Admin`
  - `Internal` (cron/secret-based)

## 2) Endpoint Catalog

| Method | Route | Auth | Request Payload / Params | Success Response (sample) |
|---|---|---|---|---|
| GET | `/api/status` | Public | none | `{ "status": "ok", "message": "Next.js API route is active" }` |
| POST | `/api/auth/logout` | Public | none | `{ "ok": true }` |
| POST | `/api/auth/signin` | Public | `{ "email": "string", "password": "string" }` | `{ "ok": true, "user": { "id": "uuid", "email": "...", "name": "...", "role": "STUDENT" } }` |
| POST | `/api/auth/signup` | Public | `{ "name": "string", "email": "string", "password": "string", "grade"?: number, "curriculum"?: "string", "location"?: "string", "parentEmail"?: "string" }` | `{ "ok": true, "message": "Account created" }` |
| POST | `/api/auth/verify-password` | Public | `{ "email": "string", "password": "string" }` | `{ "ok": true }` |
| POST | `/api/feedback` | Student/Parent/Teacher | `{ "displayName": "string", "feedbackText": "string", "attachmentUrl"?: "string", "attachmentName"?: "string" }` | `{ "ok": true, "id": "123", "tone": "Appreciation|Improvement|Frustration" }` |
| POST | `/api/feedback/upload` | Student/Parent/Teacher | `multipart/form-data` with file field `attachment` (jpg/jpeg/png/doc/docx, max 5MB) | `{ "url": "/uploads/feedback/<file>", "name": "original.doc" }` |
| GET | `/api/feedback/public` | Public | none | `{ "items": [{ "id": "1", "displayName": "Priya", "userRole": "parent", "feedbackText": "...", "tone": "Appreciation", "createdAt": "..." }] }` |
| POST | `/api/ai-tutor` | Student | `{ "query": "string", "childId"?: "uuid", "grade"?: "string", "board"?: "string", "subject"?: "string", "format"?: "summary|step-by-step|flashcards", "depth"?: "simple|medium|detailed", "activeTab"?: "solution|examples|practice" }` | `{ "text": "...", "confidence": 82, "format": "summary", "flashcards": [], "sources": [] }` |
| GET | `/api/subjects` | Public/Student | Query: `userId?`, `board?`, `grade?` | `{ "subjects": ["Math"], "source": "database" }` |
| POST | `/api/sessions/start` | Student | `{ "userId": "uuid", "role": "STUDENT", "board": "string" }` | `{ "ok": true, "sessionId": "uuid" }` |
| POST | `/api/sessions/end` | Student | `{ "sessionId": "string", "durationSecs": number, "pageViews"?: number }` | `{ "ok": true }` |
| GET | `/api/cron/assignment-reminders` | Internal | Header: `Authorization: Bearer <CRON_SECRET>` | `{ "message": "completed", "sent": 3 }` |
| POST | `/api/assignments/generate` | Student | `{ "childId": "uuid", "subject": "string", "topic": "string", "complexity": "Easy|Medium|Hard|Mixed", "grade": number, "board": "string", "instructions"?: "string" }` | `{ "id": "uuid", "questions": [], "totalMarks": 50, "estimatedMinutes": 20 }` |
| GET | `/api/assignments/history` | Student | Query: `childId` | `{ "assignments": [] }` |
| POST | `/api/assignments/submit` | Student | `{ "assignmentId": "uuid", "answers": [{ "questionId": "q1", "answer": "..." }] }` | `{ "ok": true, "feedback": { "overall_feedback": "..." } }` |
| GET | `/api/practice/history` | Student | Query: `childId` (required), `page?` | `{ "attempts": [], "total": 0, "page": 1, "pageSize": 10, "hasMore": false }` |
| GET | `/api/practice/metrics` | Student | Query: `childId` (required) | `{ "totalAttempts": 0, "averageScore": "0.0", "totalTests": 0, "subjectBreakdown": [], "recentAttempts": [], "streak": 0 }` |
| GET | `/api/practice/search` | Student | Query: `childId`, `subject?`, `complexity?`, `query?` | `{ "results": [] }` |
| GET | `/api/practice/subjects` | Student | Query: `childId` | `{ "subjects": ["Science"] }` |
| POST | `/api/practice/generate` | Student | `{ "childId": "uuid", "subject": "string", "topic": "string", "complexity": "Easy|Medium|Hard|Mixed" }` | `{ "id": "uuid", "questions": [], "totalMarks": 40, "durationMins": 15 }` |
| POST | `/api/practice/submit` | Student | `{ "childId": "uuid", "practiceTestId": "uuid", "answers": [{ "questionId": "q1", "answer": "..." }] }` | `{ "ok": true, "feedback": { "overall_feedback": "..." } }` |
| POST | `/api/podcasts/generate` | Student/Teacher | Mode `podcast`: `{ topic, subject, response, queryId?, role, userId?, mode: "podcast" }`; Mode `answer`: `{ question, response, topic?, subject?, role, userId?, mode: "answer" }` | Podcast mode: `{ "podcastId": "1", "segments": [], "durationSecs": 64, "cached": false }`; Answer mode: `{ "answerText": "...", "audioUrl": "https://...", "durationSecs": 12 }` |
| GET | `/api/podcasts/generate` | Student/Teacher | Query: `role=TEACHER|STUDENT`, `userId?` | `{ "hasAccess": true }` |
| GET | `/api/student/progress` | Student | Query: `userId`, `days?` | `{ "metrics": { "testsTaken": 0, "avgScore": 0, "currentStreak": 0 } }` |
| GET | `/api/student/research-history` | Student | Query: `userId`, `limit?` | `{ "queries": [] }` |
| GET | `/api/student/preferences` | Student | Query: `childId?` | `{ "dashboardTheme": "classic", "comicTheme": "none", "avatarJson": null, "gamificationOn": true }` |
| POST | `/api/student/preferences` | Student | `{ "dashboardTheme"?: "string", "comicTheme"?: "string", "avatarJson"?: object, "gamificationOn"?: boolean }` | `{ "ok": true }` |
| GET | `/api/student/profile` | Student | Query/header `userId` | `{ "id": "uuid", "name": "...", "email": "..." }` |
| PUT | `/api/student/profile` | Student | `{ "name"?: "string", "grade"?: number, "curriculum"?: "string", "location"?: "string", "parentEmail"?: "string" }` | `{ "ok": true }` |
| GET | `/api/student/notifications` | Student | Query/header `userId` | `{ "notifications": [] }` |
| POST | `/api/student/notifications/read` | Student | `{ "ids": ["1", "2"] }` | `{ "ok": true }` |
| GET | `/api/student/gamification/stats` | Student | Query/header: `childId?`, `userId?` | `{ "monthlyXP": 120, "streak": 4, "enabled": true }` |
| GET | `/api/student/gamification/badges` | Student | Query/header: `childId?`, `userId?` | `{ "badges": [{ "badgeId": "first_research", "awardedAt": "..." }] }` |
| GET | `/api/student/gamification/leaderboard` | Student | Query: `classId`, `userId?` | `{ "entries": [{ "rank": 1, "name": "A", "xp": 240, "isCurrentUser": false }] }` |
| POST | `/api/student/link-parent` | Student | `{ "code": "string" }` | `{ "ok": true, "message": "Linked" }` |
| GET | `/api/student/teacher-assignments` | Student | Query: `userId`, `page?` | `{ "items": [] }` |
| POST | `/api/student/teacher-assignments/[id]/submit` | Student | `{ "answers": [{ "questionId": "q1", "answer": "..." }] }` | `{ "ok": true, "feedbackJson": {} }` |
| POST | `/api/parent/auth/register` | Public | `{ "name": "string", "email": "string", "password": "string", "childEmail"?: "string" }` | `{ "ok": true }` |
| POST | `/api/parent/auth/login` | Public | `{ "email": "string", "password": "string" }` | `{ "ok": true, "parent": { "id": "uuid", "name": "...", "email": "..." } }` |
| POST | `/api/parent/auth/logout` | Parent | none | `{ "ok": true }` |
| GET | `/api/parent/dashboard` | Parent | none | `{ "children": [], "summary": {} }` |
| GET | `/api/parent/family-code` | Parent | none | `{ "familyCode": "ABC123", "active": true }` |
| GET | `/api/parent/profile` | Parent | none | `{ "id": "uuid", "name": "...", "email": "...", "mobile": "..." }` |
| POST | `/api/parent/profile` | Parent | `{ "name"?: "string", "mobile"?: "string", "currentPassword": "string", "newPassword"?: "string" }` | `{ "ok": true }` |
| GET | `/api/parent/preferences` | Parent | Query/header: `parentId?`, `userId?` | `{ "gamificationDisabled": false }` |
| POST | `/api/parent/preferences` | Parent | `{ "gamificationDisabled": boolean }` | `{ "ok": true, "gamificationDisabled": true }` |
| GET | `/api/parent/notifications` | Parent | Query/header `userId` | `{ "notifications": [] }` |
| POST | `/api/parent/notifications/read` | Parent | `{ "ids": ["1"] }` | `{ "ok": true }` |
| GET | `/api/parent/child/[childId]/assignments` | Parent | Path param: `childId` | `{ "classAssignments": [], "selfAssignments": [] }` |
| GET | `/api/parent/child/[childId]/practice` | Parent | Path param: `childId` | `{ "attempts": [], "summary": {} }` |
| GET | `/api/parent/child/[childId]/progress` | Parent | Path param: `childId` | `{ "metrics": {}, "timeline": [] }` |
| GET | `/api/parent/child/[childId]/research` | Parent | Path param: `childId` | `{ "queries": [] }` |
| GET | `/api/parent/child/[childId]/warnings` | Parent | Path param: `childId` | `{ "warnings": [] }` |
| GET | `/api/parent/child/[childId]/login-history` | Parent | Path param: `childId` | `{ "sessions": [] }` |
| POST | `/api/teacher/auth/register` | Public | `{ "name": "string", "email": "string", "password": "string", "schoolName": "string", "mobile"?: "string" }` | `{ "teacherId": "12", "message": "verification email sent" }` |
| POST | `/api/teacher/auth/verify-email` | Public | `{ "token": "string" }` | `{ "ok": true }` |
| POST | `/api/teacher/auth/resend-verification` | Public | `{ "email": "string" }` | `{ "message": "verification email sent" }` |
| POST | `/api/teacher/auth/login` | Public | `{ "email": "string", "password": "string" }` | `{ "name": "Teacher", "email": "t@example.com" }` |
| POST | `/api/teacher/auth/logout` | Teacher | none | `{ "ok": true }` |
| GET | `/api/teacher/analytics` | Teacher | none | `{ "totalStudents": 0, "totalClasses": 0, "submissionRate": 0, "studentLeaderboard": [] }` |
| GET | `/api/teacher/students` | Teacher | none | `{ "students": [] }` |
| GET | `/api/teacher/students/search` | Teacher | Query: `q` | `{ "students": [] }` |
| GET | `/api/teacher/classes` | Teacher | none | `{ "classes": [] }` |
| POST | `/api/teacher/classes` | Teacher | `{ "className": "string", "grade": "string", "board": "string", "subjects": ["Math"] }` | `{ "id": "34", "className": "VIII-A" }` |
| POST | `/api/teacher/classes/[classId]/invite-token` | Teacher | none | `{ "token": "...", "url": "https://...", "expiresAt": "..." }` |
| POST | `/api/teacher/classes/[classId]/enroll` | Teacher | `{ "childId"?: "uuid", "inviteToken"?: "string" }` | `{ "ok": true }` |
| GET | `/api/teacher/classes/[classId]/students` | Teacher | none | `{ "class": {}, "assignments": [], "students": [] }` |
| DELETE | `/api/teacher/classes/[classId]/students` | Teacher | `{ "childId": "uuid" }` | `{ "ok": true }` |
| GET | `/api/teacher/assignments` | Teacher | none | `{ "assignments": [] }` |
| POST | `/api/teacher/assignments/generate` | Teacher | `{ "classId": "string", "subject": "string", "topic": "string", "complexity": "string", "dueDate": "iso", "instructions"?: "string", "isDraft"?: boolean }` | `{ "id": "101", "questions": [], "totalMarks": 40, "estimatedMinutes": 20 }` |
| PATCH | `/api/teacher/assignments/[id]` | Teacher | `{ "newDueDate": "iso", "childIds"?: ["uuid"] }` | `{ "ok": true, "newDueDate": "..." }` |
| PUT | `/api/teacher/assignments/[id]` | Teacher | none | `{ "ok": true }` |
| GET | `/api/teacher/assignments/[id]/status` | Teacher | none | `{ "assignment": {}, "students": [], "summary": {} }` |
| GET | `/api/teacher/assignments/[id]/review` | Teacher | none | `{ "assignment": {}, "submissions": [] }` |
| POST | `/api/teacher/assignments/[id]/review` | Teacher | `{ "submissionId": "string", "score": number, "teacherFeedback": "string" }` | `{ "ok": true }` |
| POST | `/api/teacher/assignments/[id]/remind` | Teacher | `{ "childIds": ["uuid"] }` | `{ "sent": 2 }` |
| GET | `/api/teacher/notifications` | Teacher | none | `{ "notifications": [] }` |
| POST | `/api/teacher/notifications/read` | Teacher | `{ "ids": ["1"] }` | `{ "ok": true }` |
| GET | `/api/teacher/profile` | Teacher | none | `{ "id": "12", "name": "...", "email": "...", "schoolName": "..." }` |
| PUT | `/api/teacher/profile` | Teacher | `{ "name"?: "string", "schoolName"?: "string", "mobile"?: "string", "currentPassword"?: "string", "newPassword"?: "string" }` | `{ "ok": true }` |
| POST | `/api/admin/auth/login` | Public | `{ "email": "string", "password": "string" }` | `{ "message": "Login successful", "admin": { "id": "1", "role": "SUPER_ADMIN" } }` |
| GET | `/api/admin/verify-session` | Admin | none | `{ "authenticated": true, "admin": { "id": "1", "role": "SUPER_ADMIN" } }` |
| GET | `/api/admin/accounts` | Admin | none | `{ "admins": [] }` |
| GET | `/api/admin/users` | Admin | Query: `page?`, `search?` | `{ "users": [], "total": 0, "page": 1, "per_page": 20 }` |
| GET | `/api/admin/users/[id]` | Admin | none | `{ "id": "uuid", "name": "...", "subjects": [] }` |
| POST | `/api/admin/invite` | Admin | `{ "email": "string", "role": "SUPER_ADMIN|CONTENT_MOD|SUPPORT|FINANCE" }` | `{ "inviteId": "1", "token": "..." }` |
| GET | `/api/admin/accept-invite` | Public | Query: `token` | `{ "email": "...", "role": "SUPPORT", "expiresAt": "..." }` |
| POST | `/api/admin/accept-invite` | Public | `{ "token": "string", "email": "string", "password": "string" }` | `{ "ok": true }` |
| GET | `/api/admin/credits` | Admin | Query: `startDate?`, `endDate?`, `userId?`, `feature?`, `export?` | `{ "summaries": [], "totalCalls": 0, "totalTokens": 0, "totalCost": 0 }` |
| GET | `/api/admin/link-parent-child` | Admin | Query: `studentId?`, `parentId?`, `code?` | `{ "links": [] }` |
| POST | `/api/admin/link-parent-child` | Admin | `{ "studentId": "uuid", "parentId": "uuid" }` | `{ "ok": true }` |
| DELETE | `/api/admin/link-parent-child` | Admin | `{ "studentId": "uuid", "parentId": "uuid" }` | `{ "ok": true }` |
| GET | `/api/admin/rate-limit/reset` | Admin | Query: `key?`, `scope?` | `{ "ok": true, "message": "No-op for GET" }` |
| POST | `/api/admin/rate-limit/reset` | Admin | `{ "key"?: "string", "scope"?: "string" }` | `{ "ok": true }` |
| GET | `/api/admin/features/podcast` | Admin | none | `{ "students": [], "teachers": [] }` |
| POST | `/api/admin/features/podcast` | Admin | `{ "userId": "string", "userRole": "STUDENT|TEACHER", "isEnabled": boolean, "notes"?: "string" }` | `{ "ok": true, "message": "Podcast enabled successfully" }` |
| GET | `/api/admin/notifications` | Admin | none | `{ "notifications": [] }` |
| POST | `/api/admin/notifications/read` | Admin | `{ "ids": ["1"] }` | `{ "ok": true }` |
| GET | `/api/admin/feedback` | Admin | none | `{ "items": [{ "id": "1", "displayName": "Priya", "userRole": "parent", "feedbackText": "...", "attachmentUrl": null, "attachmentName": null, "tone": "Appreciation", "showOnHomepage": false, "adminNote": null, "createdAt": "..." }] }` |
| PATCH | `/api/admin/feedback` | Admin | `{ "id": "1", "showOnHomepage"?: boolean, "adminNote"?: "string|null" }` | `{ "ok": true }` |

## 3) Standard Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": ["field X is required"]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "FEATURE_NOT_ENABLED",
  "message": "Podcast feature is not enabled for your account."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## 4) Notes
- Most handlers use `{ error: string }` style errors.
- AI/TTS routes may also return error codes such as `TTS_QUOTA_ERROR`, `TTS_BILLING_ERROR`, `TTS_AUTH_ERROR`.
- Login routes include 429 lockout behavior after repeated failures.
- Verification update (2026-10-09): Existing route handlers were not modified as part of the feedback/testimonials feature except for adding new endpoints listed above.
