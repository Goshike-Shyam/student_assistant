# Student Assistant - Project Context Documentation

**Last Updated:** July 20, 2026  
**Status:** Phase 3 - Production Features Complete  
**Current Priority:** Database connectivity validation & teacher/parent portal polish  
**Team Size:** Educational LMS Development

---

## 1. Product Overview

**Student Assistant** is a modern, adaptive learning management system (LMS) designed as a comprehensive educational platform serving students, teachers, parents, and administrators.

### Core Mission
Enable engaging, personalized learning experiences through AI-powered tutoring, gamified practice, intelligent assignment tracking, and detailed analytics.

### Target Users
- **Students:** Access practice tests, AI tutoring, assignments, resources
- **Teachers:** Create assignments, track submissions, view analytics
- **Parents:** Monitor child's progress, view analytics through parent portal
- **Administrators:** Manage users, analytics, platform administration

### Platform Type
Web-based SaaS educational platform (future: mobile apps planned)

---

## 2. Business Objectives

1. **Engagement:** Gamify learning with XP, streaks, achievement levels, badges
2. **Personalization:** AI-powered tutoring adapted to individual learning styles
3. **Progress Tracking:** Comprehensive analytics for students, teachers, parents
4. **Accessibility:** Curriculum-aligned resources, multiple format support
5. **Scalability:** Support 12K+ active students initially, extensible architecture
6. **Quality:** Data-driven grading, standardized assessment tracking

---

## 3. User Personas

### Persona 1: Priya (High School Student)
- **Goal:** Excel in exams while maintaining work-life balance
- **Pain Points:** Limited time, anxiety about performance, needs quick help
- **Value Props:** AI tutor, practice tests, achievement tracking
- **Engagement:** Daily 20-30 min sessions, motivated by streaks/XP

### Persona 2: Mr. Sharma (Teacher)
- **Goal:** Track student progress, provide timely feedback, reduce grading time
- **Pain Points:** Manual grading, limited visibility into student performance
- **Value Props:** Assignment management, analytics dashboard, automatic grading framework
- **Engagement:** Weekly 2-3 hours managing course + assignments

### Persona 3: Mrs. Patel (Parent)
- **Goal:** Monitor child's academic progress, support learning
- **Pain Points:** Limited communication with teachers, no real-time progress visibility
- **Value Props:** Progress dashboard, streak tracking, achievements, communications
- **Engagement:** Bi-weekly check-ins on progress

### Persona 4: Admin Team
- **Goal:** Manage platform, track KPIs, support operations
- **Pain Points:** Manual user management, limited analytics
- **Value Props:** Admin dashboard, user management, comprehensive analytics
- **Engagement:** Daily operations, weekly analytics reviews

---

## 4. Tech Stack

### Frontend
```
Next.js 16.2.6 (App Router, TypeScript)
├─ React 18.3.1 with React DOM
├─ TypeScript 5.6.2 (type safety)
├─ Tailwind CSS 3.4.4 (styling)
├─ PostCSS + Autoprefixer (CSS processing)
├─ Lucide React (icons - planned)
└─ Clsx (conditional classes)
```

**Browser Support:** All modern browsers, responsive design for mobile

### Backend
```
Express.js 4.18.2 (API server)
├─ Prisma ORM 4.16.0+ (type-safe database)
├─ TypeScript (backend type safety)
├─ CORS middleware (cross-origin requests)
├─ Async handler wrapper (error handling)
├─ Custom error middleware
├─ bcryptjs (password hashing for admin accounts)
├─ @google/generative-ai (Gemini LLM integration)
└─ tsx (TypeScript script runner for seed scripts)
```

### AI/LLM Integration
```
Google Gemini API (@google/generative-ai 0.15.1+)
├─ Model: gemini-2.0-flash (latest high-performance model)
├─ Endpoint: /api/search (curriculum-aligned responses)
├─ Features:
│  ├─ Educational content generation
│  ├─ Age-appropriate filtering
│  ├─ Curriculum alignment (CBSE/ICSE)
│  └─ Resource link generation
├─ Authentication: GEMINI_API_KEY environment variable
├─ Rate Limits: Free tier quota (100+ requests/day when available)
└─ Error Handling: Graceful fallback with user-friendly messages
```

### Database
```
PostgreSQL (via Supabase)
├─ Connection: db.gwkfegybtmmcdxnfnkyj.supabase.co:5432
├─ Schema: Extended with search & conversation tracking tables
├─ Auth: Supabase Authentication (JWT-based)
├─ Backups: Automated via Supabase
└─ SSL: Required for production
```

**Credentials Management:**
- Supabase URL: `https://gwkfegybtmmcdxnfnkyj.supabase.co`
- Service Role Key: Environment variable
- Publishable Key: NEXT_PUBLIC (safe for client)

### Deployment
- **Frontend:** Vercel (Next.js optimized)
- **Backend:** Express.js server (can run on any Node.js host)
- **Database:** Supabase (PostgreSQL managed service)
- **Development:** Local with npm run dev

### Development Tools
- **Package Manager:** npm
- **Build Tool:** Turbopack (Next.js 16+)
- **Database GUI:** Prisma Studio (npm run db:studio)
- **Version Control:** Git/GitHub

---

## 5. Folder Structure

```
d:\Shyam\School Project\School Project Workspace\

📁 app/                              - Next.js App Router
├── globals.css                      - Global styles, Tailwind directives, icon mappings
├── layout.tsx                       - Root layout with SiteHeader & IconEmojiReplacer
├── page.tsx                         - Landing/home page
│
├── 📁 api/
│   ├── status/route.ts              - GET /api/status endpoint
│   ├── subjects/route.ts            - GET /api/subjects (user-registered or curriculum)
│   ├── auth/logout/route.ts         - POST /api/auth/logout (clears student session)
│   ├── assignments/
│   │   ├── generate/route.ts        - POST /api/assignments/generate (LLM assignment)
│   │   └── submit/route.ts          - POST /api/assignments/submit (LLM evaluation)
│   ├── admin/
│   │   ├── auth/login/route.ts      - POST /api/admin/auth/login (bcrypt + session cookie)
│   │   ├── invite/route.ts          - POST /api/admin/invite (SUPER_ADMIN only)
│   │   ├── accept-invite/route.ts   - GET+POST /api/admin/accept-invite
│   │   ├── users/route.ts           - GET /api/admin/users (pagination + search)
│   │   ├── users/[id]/route.ts      - GET /api/admin/users/[id]
│   │   └── credits/route.ts         - GET /api/admin/credits (AI usage + CSV export)
│   ├── teacher/
│   │   ├── classes/route.ts         - Teacher class management
│   │   ├── analytics/route.ts       - Teacher analytics + recentActivity
│   │   └── notifications/route.ts   - GET pending reviews & recent submissions
│   └── student/
│       └── [routes...]              - Student API routes
│
├── 📁 admin/
│   ├── layout.tsx                   - Admin layout with route guard (role check)
│   ├── page.tsx                     - Admin dashboard (name/initials/ADMIN badge)
│   ├── login/page.tsx               - Admin-only login (no registration link)
│   ├── accept-invite/
│   │   ├── page.tsx                 - Invite acceptance with password strength meter
│   │   └── accept-invite-form.tsx   - Form component
│   ├── users/page.tsx               - Users & Admin Accounts tabs (invite modal)
│   └── credits/page.tsx             - AI credit usage dashboard + CSV export
│
├── 📁 assignments/
│   ├── page.tsx                     - Registered subjects list
│   ├── [subject]/page.tsx           - Generate assignment + answer + submit
│   └── history/page.tsx             - Assignment history with filters
│
├── 📁 teacher/
│   ├── layout.tsx                   - Teacher layout (NotificationBell + ClassSwitcher + Breadcrumbs)
│   ├── page.tsx                     - Teacher root redirect
│   ├── dashboard/page.tsx           - Enhanced with quick actions + activity feed
│   ├── classes/page.tsx             - Classes list (academic year auto-detected)
│   ├── classes/[classId]/page.tsx   - Class dashboard (students/assignments tabs)
│   ├── students/[...]               - Student management pages
│   └── [other teacher pages...]     - Other teacher section pages
│
├── 📁 parent/
│   └── reports/
│       └── assignments/page.tsx     - Parent assignment report (metrics, charts, table)
│
├── 📁 parent-portal/
│   └── page.tsx                     - Parent portal root
│
└── 📁 [student pages]
    ├── dashboard/page.tsx           - Student dashboard
    ├── profile/page.tsx             - Student profile
    ├── practice/page.tsx            - Practice tests library
    ├── ai-tutor/page.tsx            - AI homework helper
    ├── chat/page.tsx                - Conversational AI chat
    └── resources/page.tsx          - Learning resource library

📁 components/                       - React components
├── 📁 assignments/
│   ├── QuestionCard.tsx             - Renders MCQ/TRUE_FALSE/FILL_BLANK/SHORT/LONG questions
│   ├── AssignmentToolbar.tsx        - Download/Print/Submit toolbar
│   └── FeedbackBanner.tsx           - Grade display with color-coded feedback
│
├── 📁 teacher/
│   ├── TeacherSidebar.tsx           - Expandable sidebar (Question Bank + Settings)
│   ├── TeacherBreadcrumbs.tsx       - Breadcrumb navigation for all teacher pages
│   ├── NotificationBell.tsx         - Notification bell with 60s polling
│   └── ClassSwitcher.tsx            - Class switcher dropdown in header
│
├── 📁 auth/
│   └── sign-in-form.tsx             - Signin form component
│
├── 📁 ui/
│   ├── badge.tsx                    - Badge component
│   ├── button.tsx                   - Button variants
│   ├── card.tsx                     - Card component
│   ├── input.tsx                    - Input field
│   ├── label.tsx                    - Form label
│   ├── select.tsx                   - Select dropdown
│   ├── textarea.tsx                 - Textarea field
│   ├── radio-group.tsx              - RadioGroup for MCQ/TRUE_FALSE questions
│   ├── admin-sidebar.tsx            - Admin sidebar navigation
│   └── site-header.tsx              - Top navigation (student logout → /api/auth/logout)
│
└── icon-emoji-replacer.tsx          - Icon rendering component (client-side emoji mapping)

📁 lib/                              - Utilities & helpers
├── supabaseClient.ts                - Supabase client initialization
├── prismaClient.ts                  - Prisma singleton for Next.js API routes
├── utils.ts                         - General utilities
├── icon-emoji-map.ts                - Material icon to emoji mapping
├── subjects-seed.ts                 - Board+grade → subject list (CBSE/ICSE/STATE/CORE)
├── admin-auth.ts                    - Admin auth utils (bcrypt, invite tokens, password strength)
├── academic-year.ts                 - Board-aware academic year (CBSE=April, Common Core=Sep)
├── ai-credit-logger.ts              - Fire-and-forget AI credit logging (token cost calc)
├── ai-with-retry.ts                 - LLM retry with exponential backoff (2s→4s→8s)
└── email.ts                         - Email service utilities

📁 scripts/                          - Utility scripts
└── seed-super-admin.ts              - Seeds first SUPER_ADMIN (reads env vars, bcrypt cost 12)

📁 server/                           - Express API server
├── index.ts                         - Server entry point, config (port 4000)
├── middleware.ts                    - CORS, error handling, auth guards
├── prisma.ts                        - Prisma client singleton (server-side)
├── routes.ts                        - API route definitions (AI credit logging on /search, /assignments/generate)
└── utils.ts                         - generateContentWithRetry (returns GenerateContentResult with token counts)

📁 types/
└── assignments.ts                   - Assignment types (QuestionType, Question, AssignmentResponse, etc.)

📁 prisma/                           - Database configuration
├── schema.prisma                    - Database schema (12+ models)
└── 📁 migrations/
    ├── 20260528081721_init/
    ├── 20260621053219_add_search_and_student_profile/
    ├── 20260629162642_rename_content_to_contents/
    ├── 20260708083158_add_subjects/
    ├── 20260710131617_add_admin_tables/
    └── [additional migrations]/

📁 screenshots/                      - Design mockups & prototypes
├── admin-analytics.html
├── admin-users.html
├── assignments.html
├── enroll.html
├── index.html
├── parent-portal.html
├── practice.html
├── research.html
└── student-home.html

Configuration Files:
├── .env                             - Environment variables (local development)
├── middleware.ts                    - Next.js middleware (Cache-Control headers for login pages)
├── next.config.mjs                  - Next.js configuration
├── tsconfig.json                    - TypeScript configuration
├── tailwind.config.ts               - Tailwind CSS configuration
├── postcss.config.js                - PostCSS plugins
├── package.json                     - Dependencies & scripts (includes seed:admin)
├── vercel.json                      - Vercel deployment config
└── next-env.d.ts                    - Next.js type definitions
```
📁 lib/                              - Utilities & helpers
├── supabaseClient.ts                - Supabase client initialization
├── utils.ts                         - General utilities
└── icon-emoji-map.ts                - Material icon to emoji mapping

📁 server/                           - Express API server
├── index.ts                         - Server entry point, config (port 4000)
├── middleware.ts                    - CORS, error handling, auth guards (planned)
├── prisma.ts                        - Prisma client singleton
├── routes.ts                        - API route definitions
├── routes/
│   ├── users.ts                     - User CRUD endpoints
│   ├── auth.ts                      - Authentication endpoints
│   ├── courses.ts                   - Course management
│   ├── enrollments.ts               - Course enrollment
│   ├── assignments.ts               - Assignment CRUD
│   └── submissions.ts               - Submission tracking

📁 prisma/                           - Database configuration
├── schema.prisma                    - Database schema (5 models)
└── 📁 migrations/
    └── 20260528081721_init/
        └── migration.sql            - Initial schema migration

📁 screenshots/                      - Design mockups & prototypes
├── admin-analytics.html             - Admin dashboard mockup
├── admin-users.html                 - User management mockup
├── assignments.html                 - Assignment page mockup
├── enroll.html                      - Enrollment mockup
├── index.html                       - Main mockup
├── parent-portal.html               - Parent portal mockup
├── practice.html                    - Practice tests mockup
├── research.html                    - Resources mockup
└── student-home.html                - Student dashboard mockup

📁 public/                           - Static assets (favicon, etc.)

Configuration Files:
├── .env                             - Environment variables (local development)
├── .env.example                     - Environment template
├── .gitignore                       - Git exclusions
├── next.config.mjs                  - Next.js configuration
├── tsconfig.json                    - TypeScript configuration
├── tailwind.config.ts               - Tailwind CSS configuration
├── postcss.config.js                - PostCSS plugins
├── package.json                     - Dependencies & scripts
├── package-lock.json                - Locked dependency versions
├── README.md                        - Project documentation
└── next-env.d.ts                    - Next.js type definitions
```

**Key Directories:**
- `app/` - All user-facing pages (400 LOC total)
- `components/` - Reusable React components (300 LOC)
- `lib/` - Utilities and Supabase client (100 LOC)
- `server/` - Express API with Prisma ORM (600 LOC)
- `prisma/` - Database schema & migrations (50 LOC)

---

## 6. Application Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Next.js 16 Application (Port 3000)           │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │  React Components with TypeScript            │    │   │
│  │  │  - Pages (app/dashboard, /practice, etc.)   │    │   │
│  │  │  - UI Components (Button, Card, Input, etc.)│    │   │
│  │  │  - Forms (Login, Signup, Submit assignments)│    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │  Styling & Icons                             │    │   │
│  │  │  - Tailwind CSS (utility classes)            │    │   │
│  │  │  - Custom CSS (globals.css)                 │    │   │
│  │  │  - Icon Emoji Replacement (client-side)     │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
           ↓ HTTP/REST API Calls (JSON) ↓
┌─────────────────────────────────────────────────────────────┐
│              EXPRESS.JS API SERVER (Port 4000)              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Route Handlers (21 endpoints)                       │   │
│  │  ├─ GET /api/users (list users)                     │   │
│  │  ├─ POST /api/users (create user/signup)           │   │
│  │  ├─ POST /api/auth/signin (authentication)         │   │
│  │  ├─ GET/POST /api/courses                          │   │
│  │  ├─ GET/POST /api/enrollments                      │   │
│  │  ├─ GET/POST /api/assignments                      │   │
│  │  └─ GET/POST /api/submissions                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware Stack                                    │   │
│  │  ├─ CORS (cross-origin requests)                    │   │
│  │  ├─ Error Handler (custom AppError)                │   │
│  │  ├─ Async Wrapper (try-catch handler)              │   │
│  │  └─ Auth Guard (planned - role-based access)       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Prisma ORM Layer                                    │   │
│  │  - Type-safe database queries                       │   │
│  │  - Query building                                   │   │
│  │  - Relationship management                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
           ↓ SQL Queries ↓
┌─────────────────────────────────────────────────────────────┐
│           SUPABASE POSTGRESQL DATABASE                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables:                                             │   │
│  │  ├─ User (id, email, name, password, role)         │   │
│  │  ├─ Course (id, title, code, instructorId)         │   │
│  │  ├─ Enrollment (userId, courseId)                  │   │
│  │  ├─ Assignment (id, title, courseId, dueDate)      │   │
│  │  └─ Submission (id, assignmentId, studentId)       │   │
│  ├─ Indexes for performance                            │   │
│  ├─ Foreign key constraints for integrity              │   │
│  └─ Automatic backups via Supabase                     │   │
│                                                        │   │
│  Configuration:                                        │   │
│  - Host: db.gwkfegybtmmcdxnfnkyj.supabase.co          │   │
│  - Port: 5432 (PostgreSQL standard)                   │   │
│  - SSL: Required (connection pooling)                 │   │
│  - Auth: Supabase JWT + PostgreSQL role              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
           ↑ Supabase Admin SDK ↑
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE AUTHENTICATION SERVICE                 │
│  - User signup/login (JWT tokens)                           │
│  - Email verification (planned)                             │
│  - Role-based access control (planned)                      │
│  - Session management                                       │
└─────────────────────────────────────────────────────────────┘
```

### Request/Response Flow Example
```
1. User clicks "Submit Assignment" on practice page
   ↓
2. React component captures form data
   ↓
3. fetch() sends POST /api/submissions with JSON body
   ↓
4. Express route handler (server/routes/submissions.ts)
   ├─ Validates input
   ├─ Calls Prisma ORM
   ↓
5. Prisma executes SQL query on PostgreSQL
   ├─ INSERT submission row
   ├─ UPDATE assignment status
   ↓
6. Database returns new submission record
   ↓
7. Route handler returns JSON response (201 Created)
   ↓
8. React component updates UI, shows success message
```

### Data Flow
```
State Management:
- React local state (useState)
- Form values in component state
- No global state manager (Redux, Zustand not used)

API Communication:
- fetch() API with JSON
- Error handling via try-catch
- Status messages for user feedback

Database Persistence:
- Prisma ORM for type-safe queries
- PostgreSQL for data durability
- Automatic migrations via schema.prisma

Authentication:
- Supabase Auth for user signup/login
- Custom Express endpoint for signin
- JWT tokens for session (planned)
```

---

## 7. Database Schema Summary

### User Model
```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String
  password  String    // ⚠️ Student passwords not hashed - SECURITY ISSUE (admin passwords ARE hashed)
  role      Role      @default(STUDENT)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // Relationships
  instructorCourses  Course[]
  enrollments        Enrollment[]
  submissions        Submission[]
  assignments        Assignment[]
  childSubjects      ChildSubject[]
  generatedAssignments GeneratedAssignment[]
}
```

### Admin Model (separate from User)
```prisma
model Admin {
  id           BigInt     @id @default(autoincrement())
  email        String     @unique
  passwordHash String     // bcrypt cost 12
  name         String?
  role         AdminRole  @default(SUPPORT)
  isActive     Boolean    @default(true)
  invitedBy    BigInt?    // self-referential (null for SUPER_ADMIN)
  inviter      Admin?     @relation("AdminInvites", fields: [invitedBy], references: [id])
  invitees     Admin[]    @relation("AdminInvites")
  lastLogin    DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model AdminInvite {
  id         BigInt    @id @default(autoincrement())
  email      String
  role       AdminRole
  tokenHash  String    @unique  // SHA-256 of raw token
  invitedBy  BigInt
  isUsed     Int       @default(0)
  expiresAt  DateTime  // 48 hours from creation
  usedAt     DateTime?
  createdAt  DateTime  @default(now())
}

enum AdminRole {
  SUPER_ADMIN
  CONTENT_MOD
  SUPPORT
  FINANCE
}
```

### ChildSubject Model
```prisma
model ChildSubject {
  id          String   @id @default(cuid())
  childId     String
  subjectName String
  child       User     @relation(fields: [childId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())

  @@unique([childId, subjectName])
}
```

### GeneratedAssignment Model
```prisma
model GeneratedAssignment {
  id                   String    @id @default(cuid())
  childId              String
  subject              String
  topic                String
  complexity           String
  questionsJson        String    // Full questions WITH correct_answer (server-side only)
  submittedAnswersJson String?   // null until submitted
  feedbackJson         String?   // LLM evaluation JSON
  score                Int?      // 0-100
  submittedAt          DateTime?
  createdAt            DateTime  @default(now())
  child                User      @relation(fields: [childId], references: [id], onDelete: Cascade)
}
```

### AI Credit Tracking Models
```prisma
model AiCreditLog {
  id          BigInt   @id @default(autoincrement())
  userId      BigInt?  // null for anonymous
  featureName String   // QUERY | ASSIGNMENT_GEN | ASSIGNMENT_FEEDBACK
  inputTokens Int
  outputTokens Int
  costUsd     Decimal  @db.Decimal(10, 6)
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
  @@index([featureName])
}

model AiCreditDailySummary {
  id           BigInt   @id @default(autoincrement())
  date         DateTime @db.Date
  featureName  String
  totalCalls   Int      @default(0)
  totalInput   Int      @default(0)
  totalOutput  Int      @default(0)
  totalCostUsd Decimal  @default(0) @db.Decimal(10, 6)
  updatedAt    DateTime @updatedAt

  @@unique([date, featureName])
}
```
**Pricing (Gemini 2.5 Flash):** $0.00015/1K input tokens, $0.00060/1K output tokens

### Original Models (User, Course, Enrollment, Assignment, Submission)

```prisma
model Course {
  id          String    @id @default(cuid())
  title       String
  description String?
  code        String    @unique
  instructorId String
  instructor  User      @relation(fields: [instructorId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  enrollments  Enrollment[]
  assignments  Assignment[]
}

model Enrollment {
  id        String   @id @default(cuid())
  userId    String
  courseId  String
  createdAt DateTime @default(now())
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  @@unique([userId, courseId])
}

model Assignment {
  id          String           @id @default(cuid())
  title       String
  description String?
  courseId    String
  createdBy   String
  dueDate     DateTime
  status      AssignmentStatus @default(PENDING)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  course      Course           @relation(...)
  creator     User             @relation(...)
  submissions Submission[]
}

model Submission {
  id           String   @id @default(cuid())
  assignmentId String
  studentId    String
  content      String
  grade        Int?
  feedback     String?
  submittedAt  DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@unique([assignmentId, studentId])
}
```

---

## 8. API Endpoints

### Base URL
- **Development:** `http://localhost:4000`
- **Production:** TBD (deployed server URL)

### Health & Status (3 endpoints)
```
GET /
  Response: { status: "ok", timestamp: string }

GET /api/express/status
  Response: { status: "ok", environment: string, timestamp: string }

POST /api/express/echo
  Body: { message: string }
  Response: { echo: string, timestamp: string }
```

### Users (5 endpoints)
```
POST /api/users
  Description: Create new user (signup)
  Body: { email: string, name: string, password: string, role: string }
  Response: { id: string, email: string, name: string, role: string, createdAt: string }
  Status: 201 Created | 400 Bad Request

GET /api/users
  Description: List all users (admin only - needs auth guard)
  Response: User[]
  Status: 200 OK

GET /api/users/:id
  Description: Get user by ID with enrollments
  Response: User & { enrollments: Enrollment[] }
  Status: 200 OK | 404 Not Found

PUT /api/users/:id
  Description: Update user profile
  Body: { name?: string, email?: string, password?: string }
  Response: User
  Status: 200 OK | 404 Not Found

DELETE /api/users/:id
  Description: Delete user (cascades to enrollments, submissions)
  Response: { message: "User deleted" }
  Status: 200 OK | 404 Not Found
```

### Authentication (1 endpoint)
```
POST /api/auth/signin
  Description: Login user (email/password)
  Body: { email: string, password: string }
  Response: { id: string, email: string, name: string, role: string, token?: string }
  Status: 200 OK | 401 Unauthorized | 404 Not Found

⚠️ Note: Currently plaintext password matching - needs bcrypt
```

### Courses (5 endpoints)
```
POST /api/courses
  Description: Create course (instructor only)
  Body: { title: string, description?: string, code: string, instructorId: string }
  Response: Course
  Status: 201 Created

GET /api/courses
  Description: List all courses
  Query: ?instructorId=uuid (optional filter)
  Response: Course[]
  Status: 200 OK

GET /api/courses/:id
  Description: Get course with enrollments and assignments
  Response: Course & { enrollments: Enrollment[], assignments: Assignment[] }
  Status: 200 OK

PUT /api/courses/:id
  Description: Update course (instructor only)
  Body: Partial<Course>
  Response: Course
  Status: 200 OK

DELETE /api/courses/:id
  Description: Delete course (cascades)
  Response: { message: "Course deleted" }
  Status: 200 OK
```

### Enrollments (3 endpoints)
```
POST /api/enrollments
  Description: Enroll student in course
  Body: { userId: string, courseId: string }
  Response: Enrollment
  Status: 201 Created

GET /api/enrollments
  Description: List enrollments (filter by userId or courseId)
  Query: ?userId=uuid&courseId=uuid
  Response: Enrollment[]
  Status: 200 OK

DELETE /api/enrollments/:id
  Description: Remove enrollment
  Response: { message: "Enrollment deleted" }
  Status: 200 OK
```

### Assignments (5 endpoints)
```
POST /api/assignments
  Description: Create assignment (instructor only)
  Body: { title: string, description?: string, courseId: string, createdBy: string, dueDate: ISO8601 }
  Response: Assignment
  Status: 201 Created

GET /api/assignments
  Description: List assignments
  Query: ?courseId=uuid (filter by course)
  Response: Assignment[]
  Status: 200 OK

GET /api/assignments/:id
  Description: Get assignment with submissions
  Response: Assignment & { submissions: Submission[] }
  Status: 200 OK

PUT /api/assignments/:id
  Description: Update assignment (instructor only)
  Body: Partial<Assignment>
  Response: Assignment
  Status: 200 OK

DELETE /api/assignments/:id
  Description: Delete assignment (cascades submissions)
  Response: { message: "Assignment deleted" }
  Status: 200 OK
```

### Submissions (5 endpoints)
```
POST /api/submissions
  Description: Submit assignment
  Body: { assignmentId: string, studentId: string, content: string }
  Response: Submission
  Status: 201 Created

GET /api/submissions
  Description: List submissions
  Query: ?assignmentId=uuid&studentId=uuid
  Response: Submission[]
  Status: 200 OK

GET /api/submissions/:id
  Description: Get submission details
  Response: Submission
  Status: 200 OK

PUT /api/submissions/:id
  Description: Update submission (add grade/feedback)
  Body: { grade?: number, feedback?: string }
  Response: Submission
  Status: 200 OK

DELETE /api/submissions/:id
  Description: Delete submission
  Response: { message: "Submission deleted" }
  Status: 200 OK
```

**Total: 21 Endpoints**

---

## 9. Coding Standards

### TypeScript Standards
✅ **In Use:**
- Full TypeScript (no `any` type except in migrations)
- Interfaces for API contracts
- Type inference where possible
- Proper error typing

❌ **Missing:**
- `strict: true` in tsconfig.json (would catch more errors)
- Branded types for domain models

### React/Next.js Standards
✅ **In Use:**
- Functional components with hooks
- `'use client'` for client-side features
- File-based routing (app directory)
- Controlled form components

❌ **Missing:**
- Component prop interfaces not always documented
- No component Storybook
- No JSDoc comments on complex components

### Express/Node.js Standards
✅ **In Use:**
- RESTful conventions (GET, POST, PUT, DELETE)
- Async/await (no callbacks)
- Error middleware
- Separation of concerns (routes, middleware)

❌ **Missing:**
- Input validation middleware (express-validator not used)
- Request logging
- Rate limiting (express-rate-limit not configured)
- Comprehensive error codes

### CSS/Styling Standards
✅ **In Use:**
- Tailwind utility-first approach
- Consistent color variables
- Custom class naming (.qs, .mat, .btn-3d)
- Responsive design

❌ **Missing:**
- CSS design tokens (no Tailwind config for all colors)
- Dark mode support not implemented
- Icon library not finalized (currently emoji-mapped)

### Git/Version Control
✅ **Likely In Use:**
- Commit messages
- .gitignore for node_modules, .env
- Feature/main branching

❌ **Not Documented:**
- Conventional commit format (feat:, fix:, docs:)
- PR review process
- Deployment branches

### Security Standards
❌ **CRITICAL GAPS:**
- No password hashing (bcrypt should be used)
- No input validation
- No CSRF protection
- No rate limiting
- No request logging for audit trail

---

## 10. Design Patterns

### Architectural Patterns

#### 1. **MVC-Lite (Next.js + Express)**
```
View (React Components)
  ↓
Controller (API Routes via Express)
  ↓
Model (Prisma ORM)
  ↓
Database (PostgreSQL)
```
- **Used For:** Clear separation between UI and data
- **Benefit:** Maintainable, testable

#### 2. **Repository Pattern (Prisma ORM)**
```
Components
  ↓
Service Layer (not explicit, but in API routes)
  ↓
Prisma Client (abstraction over SQL)
  ↓
PostgreSQL Database
```
- **Used For:** Database abstraction
- **Benefit:** Can swap database provider without changing app code

#### 3. **Component Composition (React)**
```
Base Components (Button, Card, Input)
  ↓
Composite Components (SignInForm, Sidebar)
  ↓
Page Components (Dashboard, Admin)
```
- **Used For:** Code reuse, consistency
- **Benefit:** Single source of truth for button styling, etc.

### UI Patterns

#### 1. **Controlled Form Components**
```tsx
// Input.tsx - controlled by parent state
<input 
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

#### 2. **Card-Based Layout**
```tsx
// Used in Dashboard, Admin, Practice pages
<div className="card">
  {/* Content */}
</div>
```

#### 3. **Grid-Based Dashboard**
```tsx
// Stats in 4-column grid
// Charts in 2x2 grid
// Consistent spacing with Tailwind
```

### API Patterns

#### 1. **RESTful Conventions**
```
GET    /api/users        ← Read list
POST   /api/users        ← Create
PUT    /api/users/:id    ← Update
DELETE /api/users/:id    ← Delete
```

#### 2. **Error Response**
```json
{
  "status": 400,
  "message": "Validation failed",
  "details": { ... }
}
```

#### 3. **Success Response**
```json
{
  "id": "uuid",
  "data": { ... },
  "message": "Success"
}
```

### State Management Pattern

#### **Local Component State (React Hooks)**
```tsx
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);
```
- Used for: Form inputs, UI state
- Rationale: Simple, no external library needed
- Limitation: Hard to share across components

#### **No Global State Manager**
- Redux/Zustand not implemented
- Could be added if state grows complex
- Supabase could provide real-time sync

---

## 11. Environment Variables & Integrations

### Frontend Environment Variables (.env.local)
```env
# Supabase (public - safe for client)
NEXT_PUBLIC_SUPABASE_URL=https://gwkfegybtmmcdxnfnkyj.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_PlpNEmuKbbgvZXxJwq93aA_4PmC7AqI
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Backend Environment Variables (.env)
```env
# Database Connection
DATABASE_URL=postgresql://postgres:C@li4nia$2016@db.gwkfegybtmmcdxnfnkyj.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:C@li4nia$2016@db.gwkfegybtmmcdxnfnkyj.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://gwkfegybtmmcdxnfnkyj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<secret>

# Server Config
PORT=4000
NODE_ENV=development
```

### Third-Party Integrations

#### 1. **Supabase** (Backend-as-a-Service)
- **Purpose:** PostgreSQL database, authentication, hosting
- **Integration:** Prisma ORM + Supabase Admin SDK
- **Features Used:** User management, database, SSL connections
- **Not Used Yet:** Real-time subscriptions, file storage, edge functions

#### 2. **Vercel** (Frontend Deployment - Planned)
- **Purpose:** Next.js optimized deployment
- **Configuration:** Automatic from git push
- **Environment:** Staging on preview, production on main

#### 3. **Google Fonts** (Typography)
- **Fonts:** Inter (body), Quicksand (headings)
- **Integration:** CSS @import
- **Performance:** Minimal impact, cached by browser

### Planned Integrations
- Google OAuth (social login)
- Stripe (payment processing)
- SendGrid (email notifications)
- Sentry (error tracking)
- Mixpanel (analytics)

---

## 12. Features Completed

### ✅ **Core Platform Infrastructure**
- [x] Next.js 16 application with TypeScript
- [x] Express API server with Prisma ORM
- [x] PostgreSQL database on Supabase
- [x] Database migrations and schema (12+ models)
- [x] API error handling middleware
- [x] Next.js middleware (Cache-Control headers for login pages)

### ✅ **User Management**
- [x] Student registration (role-based: Student/Teacher/Parent/Admin)
- [x] User signin/authentication endpoint
- [x] User profile retrieval
- [x] Database persistence for users
- [x] Logout endpoint for students (clears Supabase session cookie + localStorage)

### ✅ **Admin Account System (Secure)**
- [x] Separate Admin model (not in User table) with bcrypt cost-12 password hashing
- [x] AdminRole enum: SUPER_ADMIN, CONTENT_MOD, SUPPORT, FINANCE
- [x] Admin login with rate limiting (5 attempts / 15 min per IP), httpOnly session cookie
- [x] Invite-based admin account creation (no public registration)
- [x] Invite tokens stored as SHA-256 hash (raw token never in DB), 48h expiry
- [x] SUPER_ADMIN only via seed script (`npm run seed:admin`)
- [x] Admin accept-invite page with password strength meter
- [x] Admin users page: Users & Admin Accounts tabs, invite modal (SUPER_ADMIN only)
- [x] Admin route guard (layout.tsx client-side role check)

### ✅ **AI Credit Tracking**
- [x] AiCreditLog model (per-request token logging, fire-and-forget)
- [x] AiCreditDailySummary model (aggregated daily totals)
- [x] Credit logging on: QUERY, ASSIGNMENT_GEN, ASSIGNMENT_FEEDBACK
- [x] Admin credits dashboard (tables + CSV export)
- [x] Gemini 2.5 Flash pricing applied ($0.00015/1K input, $0.00060/1K output)

### ✅ **AI Assignment Workflow**
- [x] ChildSubject model (tracks which subjects each student has registered)
- [x] GeneratedAssignment model (stores questions with correct_answer server-side only)
- [x] GET /api/subjects - returns user-registered or curriculum subjects
- [x] POST /api/assignments/generate - LLM generates questions (correct answers hidden from client)
- [x] POST /api/assignments/submit - LLM evaluates submission, stores feedback + score
- [x] Subjects seed library (`lib/subjects-seed.ts`) - CBSE/ICSE/STATE_BOARD/COMMON_CORE
- [x] Exponential backoff retry (`lib/ai-with-retry.ts`) - 2s → 4s → 8s, max 3 attempts
- [x] Subject validation: prevents access to unregistered subjects
- [x] Re-submission prevention (400 on duplicate submit)

### ✅ **Assignment Frontend**
- [x] Assignments list page (shows user-registered subjects, graceful empty/error states)
- [x] Assignment subject page (generate → answer → submit flow)
- [x] Assignment history page (table with filters: by subject, by status)
- [x] Parent assignment report (metrics, subject performance chart, grade distribution, tips)
- [x] QuestionCard component (MCQ / TRUE_FALSE / FILL_BLANK / SHORT / LONG_ANSWER)
- [x] AssignmentToolbar component (Download/Print/Submit with unanswered count)
- [x] FeedbackBanner component (color-coded grade + per-question expandable feedback)
- [x] RadioGroup UI component

### ✅ **Teacher Portal**
- [x] Teacher layout with NotificationBell + ClassSwitcher + TeacherBreadcrumbs header bar
- [x] TeacherSidebar with expandable items, Question Bank and Settings links
- [x] TeacherBreadcrumbs for all teacher pages
- [x] NotificationBell with 60s polling (pending reviews & recent submissions)
- [x] ClassSwitcher dropdown in teacher header
- [x] Enhanced teacher dashboard (quick actions + recent activity feed)
- [x] Classes page with board-aware academic year auto-detection
- [x] Class dashboard page ([classId]) with students/assignments tabs
- [x] GET /api/teacher/notifications endpoint
- [x] Academic year utility (`lib/academic-year.ts`): CBSE=April, Common Core=September
- [x] POST /api/teacher/classes uses getAcademicYear(board)
- [x] GET /api/teacher/analytics includes recentActivity

### ✅ **UI/UX Components**
- [x] Base UI components (Button, Card, Input, Label, Select, Textarea, Badge, RadioGroup)
- [x] Site header/navigation (student logout via /api/auth/logout)
- [x] Responsive design system
- [x] Tailwind CSS styling
- [x] Icon emoji replacement (client-side)

### ✅ **Student Pages & Features**
- [x] Landing/home page
- [x] Student dashboard (stats, achievement levels, XP counter)
- [x] Student profile page
- [x] Practice tests library (hardcoded 6 tests — see §17 for database integration plan)
- [x] AI tutor interface
- [x] Chat interface
- [x] Resources library

### ✅ **Backend Infrastructure**
- [x] CORS middleware
- [x] Error handling
- [x] Async route handlers
- [x] Prisma client singletons (server-side & Next.js routes)
- [x] AI credit logging on all LLM endpoints

---

## 13. Features In Progress

### 🚧 **Database Connectivity (Next.js routes)**
- Current State: Express backend connects successfully; Next.js Prisma client has auth issues with Supabase
- Symptom: "Can't reach database server" from `/api/subjects`, `/api/assignments/*`
- Workaround: Graceful degradation (API returns empty array / falls through)
- Next Step: Verify credentials for Next.js Prisma client separately from Express

### 🚧 **Practice Tests Database Integration**
- Current State: 6 hardcoded tests in `app/practice/page.tsx`
- Schema ready: PracticeTest + PracticeAttempt models defined
- Blocker: Windows file lock on Prisma query engine DLL + DB connectivity issue above
- See §17 for full 5-step decision guide

### 🚧 **Student Auth & Session**
- Current State: localStorage-based session; Supabase client used for login
- Missing: childId properly threaded through to assignment generation APIs
- Students: localStorage + Supabase (no server-side session cookie)
- Teachers: `sa-teacher-session` cookie (HMAC JWT via `lib/teacher-auth.ts`)
- Admins: `sa-admin-session` cookie (httpOnly, 24h)

### 🚧 **PDF/Word Export for Assignments**
- Download buttons exist in AssignmentToolbar but are placeholders
- Planned: jsPDF + html2canvas for PDF, docx package for Word

---

## 14. Pending Backlog

### 🔴 **CRITICAL - Security (Must Do Before Production)**
- [ ] Hash student passwords (bcrypt) — admin passwords are already hashed ✅
- [ ] Add JWT verification middleware for student-facing API routes
- [ ] Add role-based access control (RBAC) for student/teacher Express endpoints
- [ ] Input validation on all endpoints (express-validator or zod)
- [ ] CSRF protection
- [ ] Rate limiting on student-facing endpoints (Express)
- [ ] Rate limiting on LLM generation endpoints (prevent abuse)
- [ ] Input sanitization for LLM prompts

### 🟠 **HIGH - Features (Next Sprint)**
- [ ] Fix Next.js → Supabase DB connectivity (Prisma client credentials)
- [ ] Email verification on signup
- [ ] Password reset functionality (requires email service)
- [ ] Thread studentId/childId from session to assignment API calls properly
- [ ] PDF export for assignments (jsPDF + html2canvas)
- [ ] Word export for assignments (docx package)
- [ ] Pending assignment banner / cron job for overdue detection
- [ ] Practice tests database integration (see §17 for plan)
- [ ] Real-time notifications (beyond 60s polling)
- [ ] File upload for assignments

### 🟡 **MEDIUM - Quality (Ongoing)**
- [ ] Unit tests (Jest) for critical paths
- [ ] Integration tests for API endpoints
- [ ] E2E tests (Playwright) for user workflows
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Error logging (Sentry/LogRocket)
- [ ] Performance monitoring
- [ ] Pagination for user/assignment list endpoints
- [ ] N+1 query prevention audit on Prisma queries
- [ ] Mobile-responsive sidebar (hamburger on small screens)

### 🟢 **LOW - Nice-To-Have**
- [ ] Dark mode support
- [ ] Mobile app (React Native)
- [ ] Offline capability (Service Worker)
- [ ] Multiple language support (i18n)
- [ ] Accessibility improvements (WCAG AA)
- [ ] Social features (discussion forums)
- [ ] Advanced search/filters
- [ ] Export reports (PDF/CSV) from parent portal
- [ ] Storybook for component documentation

### 📱 **Planned Future Features**
- [ ] Video streaming with HLS/DASH
- [ ] Live classes (Zoom/Google Meet integration)
- [ ] Interactive whiteboard
- [ ] Peer-to-peer study groups
- [ ] Adaptive learning algorithms
- [ ] ML-based student performance prediction
- [ ] Integration with Google Classroom/Canvas
- [ ] Batch user import (CSV)
- [ ] Podcast/video generation from AI responses (see §17.B)

---

## 15. Important Technical Decisions

### Decision 1: Next.js + App Router
**Context:** Frontend framework choice  
**Decision:** Use Next.js 16 with App Router (not Pages Router)  
**Rationale:**
- Server components for better performance
- Simplified routing system
- Built-in API routes (though Express used separately)
- Modern React patterns

### Decision 2: Express.js for API
**Context:** Backend API server choice  
**Decision:** Separate Express server on port 4000, not Next.js API routes  
**Rationale:**
- Dedicated backend for scaling
- Easier to separate frontend and backend
- Can deploy backend independently
- More control over middleware stack

### Decision 3: Prisma ORM
**Context:** Database abstraction layer  
**Decision:** Use Prisma 4 instead of raw SQL or Query Builder  
**Rationale:**
- Type-safe queries matching TypeScript
- Auto-generated client from schema
- Built-in migrations
- Relations handled automatically

### Decision 4: PostgreSQL via Supabase
**Context:** Database provider  
**Decision:** Managed PostgreSQL on Supabase (not SQLite, MySQL, or self-hosted)  
**Rationale:**
- SQL for complex queries
- Supabase provides auth + DB + hosting
- Automatic backups
- Easy to scale
- Free tier available for development

### Decision 5: Tailwind CSS + Custom CSS
**Context:** Styling approach  
**Decision:** Utility-first with Tailwind, supplemented with custom CSS classes  
**Rationale:**
- Rapid development
- Consistent design system
- Custom classes for reusable patterns (.qs, .mat, .btn-3d)
- No component framework overhead

### Decision 6: Emoji Icons (Temporary)
**Context:** Icon rendering solution  
**Decision:** Map Material Icon names to Unicode emoji in client-side JavaScript  
**Rationale:**
- Quick solution to font loading issue
- No external dependencies
- Cross-browser compatible
- Temporary until SVG library implemented

### Decision 7: Component-Based UI
**Context:** React architecture  
**Decision:** Small, reusable components (Button, Card) composed into pages  
**Rationale:**
- Consistency across app
- Easy to maintain
- Single source of truth for styling
- Follows React best practices

### Decision 8: Supabase Auth (Partial) + Custom Sessions
**Context:** Authentication provider  
**Decision:** Supabase Auth for students; custom HMAC JWT sessions for teachers; bcrypt + httpOnly cookie for admins  
**Rationale:**
- Each role has different security profile
- Admin credentials most sensitive (bcrypt cost 12, no public registration)
- No next-auth used anywhere (lighter-weight approach)
- Three session types kept separate: localStorage (student), `sa-teacher-session` cookie, `sa-admin-session` cookie

### Decision 9: Separate Admin Model
**Context:** Admin user management  
**Decision:** Admin has its own table (not a role in User table)  
**Rationale:**
- Admins have different auth requirements (bcrypt, invite-only)
- AdminRole enum (SUPER_ADMIN/CONTENT_MOD/SUPPORT/FINANCE) separate from user Role
- Prevents accidental escalation of student/teacher accounts to admin

### Decision 10: Fire-and-Forget AI Credit Logging
**Context:** Tracking Gemini API costs  
**Decision:** All LLM calls log to AiCreditLog using `.catch(console.error)` (non-blocking)  
**Rationale:**
- LLM responses should not fail because logging failed
- Cost tracking is operational, not functional
- Aggregated daily summaries for dashboard efficiency

---

## 16. Known Bugs & Technical Debt

### 🔴 **CRITICAL**

#### Bug 1: Student Plaintext Password Storage
- **Issue:** Student user passwords stored in database without hashing
- **Location:** `server/routes.ts` (user creation), `prisma/schema.prisma`
- **Impact:** Major security vulnerability
- **Fix:** Implement bcrypt hashing for student passwords (admin passwords already use bcrypt ✅)
- **Priority:** Fix immediately before any production deployment
- **Estimated Effort:** 2-3 hours

#### Bug 2: No Authentication Middleware on Express Endpoints
- **Issue:** Express API endpoints accessible without role verification (student/teacher routes)
- **Location:** `server/routes.ts` (all endpoints)
- **Impact:** Any user can access other users' data
- **Fix:** Add JWT verification middleware + role-based guards
- **Note:** Admin routes use session cookie guard; student/teacher Express routes still unprotected
- **Priority:** Before production
- **Estimated Effort:** 4-5 hours

#### Bug 3: Next.js Prisma DB Connectivity
- **Issue:** Next.js API routes can't reach Supabase PostgreSQL ("Can't reach database server")
- **Location:** `app/api/subjects/route.ts`, `app/api/assignments/*/route.ts`
- **Impact:** Assignment workflow partially non-functional until resolved
- **Workaround:** Graceful degradation (empty array returned, Express backend unaffected)
- **Fix:** Verify DATABASE_URL credentials for Next.js Prisma client (likely different from Express)
- **Estimated Effort:** 1-2 hours investigation

### 🟠 **HIGH**

#### Bug 4: No Input Validation
- **Issue:** API endpoints don't validate request data (no zod/express-validator)
- **Location:** All route handlers (both Express and Next.js API routes)
- **Impact:** SQL injection, data corruption possible
- **Fix:** Add validation middleware
- **Priority:** Before production
- **Estimated Effort:** 3-4 hours

#### Bug 5: studentId Not Threaded to Assignment APIs
- **Issue:** Assignment generation and submission APIs need authenticated childId from session
- **Location:** `app/assignments/[subject]/page.tsx`, related API routes
- **Impact:** Assignment generation may use wrong userId
- **Fix:** After auth middleware: read childId from session/JWT
- **Estimated Effort:** 2-3 hours

### 🟡 **MEDIUM**

#### Debt 1: No Error Logging
- **Issue:** Errors not logged to external service
- **Impact:** Hard to debug production issues
- **Solution:** Integrate Sentry or similar
- **Estimated Effort:** 3-4 hours

#### Debt 2: No Pagination on List Endpoints
- **Issue:** GET /api/users, GET /api/assignments return all records at once
- **Impact:** Performance degradation with many records (12K+ students)
- **Note:** Admin users page has pagination on frontend; needs backend support
- **Solution:** Add limit/offset or cursor pagination
- **Estimated Effort:** 2-3 hours

#### Debt 3: Icon Rendering (Emoji Temporary)
- **Issue:** Material Icons mapped to emoji - not production-quality
- **Current Workaround:** Functional emoji replacement
- **Solution:** Migrate to Lucide React or Heroicons (SVG-based)
- **Estimated Effort:** 3-4 hours

#### Debt 4: TypeScript Strict Mode Not Enabled
- **Issue:** `tsconfig.json` doesn't have `"strict": true`
- **Impact:** Some type errors not caught
- **Estimated Effort:** 2-3 hours (fixing errors)

#### Debt 5: Assignment History / Parent Reports Use Placeholder Data
- **Issue:** History page and parent assignment report use hardcoded mock data
- **Fix:** Connect to `/api/assignments/history` and `/api/assignments/summary` endpoints
- **Estimated Effort:** 2-3 hours each

### 📋 **Performance Issues**
- No asset optimization (images, code splitting)
- No caching strategy (Redis)
- No query optimization (N+1 queries possible in Prisma includes)
- No rate limiting on LLM generation endpoints (potential cost abuse)

### 🏗️ **Architecture Debt**
- No service layer (business logic mixed with routes)
- childId from session not consistently passed to APIs
- Assignment generation in Express (`server/routes.ts`) vs. Next.js (`app/api/assignments/`) — dual implementation, should consolidate
- Admin session system and student session system are architecturally separate (by design) but not documented in middleware

---

## 17. Next Immediate Actions

### This Sprint (1-2 Weeks)
1. **Fix Next.js DB connectivity** — resolve Supabase credentials for Prisma client in Next.js routes
2. **Run pending migrations** — `npx prisma migrate dev` to apply AiCreditLog, Admin, GeneratedAssignment models
3. **Seed super admin** — `SUPER_ADMIN_EMAIL=... SUPER_ADMIN_PASSWORD=... npm run seed:admin`
4. **Hash student passwords** — add bcrypt to student registration flow (mirrors admin implementation)
5. **Thread childId from session** — ensure assignment APIs receive authenticated user ID

### Next Sprint (2-4 Weeks)
6. Email verification on signup
7. Password reset with SendGrid/Nodemailer
8. Connect assignment history page to real API data
9. Connect parent reports page to real API data
10. PDF export for assignments (jsPDF + html2canvas)
11. Rate limiting on LLM generation endpoints

### Future (After MVP Stabilization)
12. Mobile app (React Native)
13. Video streaming / live classes
14. Real-time notifications (WebSocket)
15. ML-based recommendations
16. Podcast/video generation from AI responses (Phase 2 — see §17.B)

---

## 18. Development Environment Setup

### Prerequisites
```bash
Node.js 18+ (npm 9+)
PostgreSQL (local or via Supabase)
Visual Studio Code (recommended)
Git
```

### Setup Steps
```bash
# 1. Clone repository
git clone <repo-url>
cd "d:\Shyam\School Project\School Project Workspace"

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with Supabase credentials

# 4. Generate Prisma client
npm run prisma:generate

# 5. Run migrations
npm run prisma:migrate deploy

# 6. Start development servers
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
```

### Scripts Reference
```bash
npm run dev              # Start both servers (Next.js + Express)
npm run dev:web         # Start only Next.js
npm run dev:api         # Start only Express
npm run build           # Build for production
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run pending migrations
npm run db:studio      # Open Prisma Studio GUI
```

---

## 17. Critical Decision: Practice Page Hardcodings & Database Integration Timeline

### Current Status (as of June 22, 2026)

**Practice Page Implementation:** Hardcoded mock data (6 tests)
```javascript
// Current State: Mock data in app/practice/page.tsx
const practiceTests = [
  { id: 1, subject: 'Mathematics', title: 'Algebra Fundamentals', 
    duration: '45 mins', questions: 30, difficulty: 'Medium', progress: 75 },
  { id: 2, subject: 'Science', title: 'Chemistry - Periodic Table', 
    duration: '50 mins', questions: 25, difficulty: 'Hard', progress: 40 },
  // ... 4 more hardcoded tests
];
```

**Related Prisma Schema Models:** Added but types don't generate locally
```prisma
model PracticeTest {
  id, title, description, subject, difficulty, duration, totalQuestions
  attempts: PracticeAttempt[]
}

model PracticeAttempt {
  id, userId, testId, progress (0-100), score, status, startedAt, completedAt
  user: User, test: PracticeTest
}
```

**Root Cause of Blocker:**
Windows file lock on `query_engine-windows.dll.node` prevents Prisma type generation locally. This causes 6 compilation errors when trying to reference `prisma.practiceTest` and `prisma.practiceAttempt` in API routes (even though Vercel's Linux build will generate types successfully).

---

### ✅ When to Fix the Hardcodings: 5-Step Decision Guide

#### **STEP 1: Verify Vercel Linux Build Succeeds** (Next Priority)
**Timeline:** Immediately after this deployment  
**What to Do:**
1. Push to Vercel (current code deploys with zero errors)
2. Monitor build logs - Vercel will auto-generate Prisma types on Linux
3. Confirm build succeeds with no Prisma type errors
4. Check Vercel deployment runs without errors

**Why This Matters:**
- Proves that Prisma types CAN be generated in production environment
- Confirms Windows file lock won't affect production
- Establishes baseline for local development fix

**Go/No-Go Criteria:**
- ✅ **GO:** Vercel build succeeds with auto-generated types
- ❌ **NO-GO:** Vercel build fails with type errors (escalate to Prisma support)

---

#### **STEP 2: Get User Confirmation on Feature Priority** (Critical)
**Timeline:** After Vercel build confirms Prisma types work  
**Ask Yourself:**
- Is practice test database integration critical for MVP?
- Will users accept hardcoded 6 tests for next 1-2 weeks?
- Is this higher priority than other feature gaps?
- Do you want to maintain practice tests in database for teacher/admin management?

**Recommendation:**
- If **NOT critical for MVP** → Stay with hardcoded data until post-launch
- If **critical** → Move to Step 3 (Windows fix)
- If **uncertain** → Ask your stakeholders/users

---

#### **STEP 3: Fix Windows Prisma Type Generation** (Technical Solution)
**Timeline:** If Step 2 confirms database integration is needed  
**Options:**

**Option A: Clear Windows File Lock (Recommended)**
```bash
# 1. Stop all Node/npm processes
taskkill /F /IM node.exe

# 2. Clear Prisma cache
rm -r node_modules/.prisma
rm -r .next

# 3. Reinstall and regenerate
npm install
npx prisma generate

# 4. Restart dev server
npm run dev
```

**Option B: Use WSL2 (Ubuntu Subsystem)**
```bash
# Run Prisma commands in WSL2 instead of Windows
# Windows locks don't affect Linux environment
wsl npx prisma generate
```

**Option C: Use Prisma Docker Container**
```bash
# Avoids Windows file system completely
docker run --rm -v %CD%:/app node npx prisma generate
```

**Option D: Skip Local Type Generation (Current Workaround)**
- Keep hardcoded tests locally
- Vercel auto-generates types at build time
- API endpoints disabled with comments explaining why
- Re-enable endpoints only when working on database features

---

#### **STEP 4: Implement Database-Driven Practice Tests** (Development)
**Timeline:** After Prisma types generate successfully locally  
**What to Implement:**

1. **Re-enable API Endpoints in server/routes.ts:**
   ```typescript
   // GET /api/practice-tests - Fetch all tests
   // GET /api/practice-tests/:testId - Fetch single test
   // GET /api/practice-tests/user/:userId - Fetch user's attempts
   // POST /api/practice-attempts - Create/update practice attempt
   ```

2. **Convert app/practice/page.tsx to use useEffect + useState:**
   ```typescript
   const [practiceTests, setPracticeTests] = useState([]);
   const [loading, setLoading] = useState(true);
   
   useEffect(() => {
     fetch('/api/practice-tests')
       .then(r => r.json())
       .then(data => setPracticeTests(data))
       .finally(() => setLoading(false));
   }, []);
   ```

3. **Add Seed Data to Prisma:**
   ```prisma
   // prisma/seed.ts - Create 6-10 default practice tests
   const tests = await prisma.practiceTest.createMany({
     data: [
       { subject: 'Mathematics', title: 'Algebra Fundamentals', ... },
       { subject: 'Science', title: 'Chemistry - Periodic Table', ... },
       // ... more tests
     ]
   });
   ```

4. **Database Tracking Features:**
   - Track user progress automatically
   - Store attempt scores and timestamps
   - Enable dashboard analytics queries
   - Support future: teacher assignment of specific tests

---

#### **STEP 5: Add Admin Management UI** (Enhancement)
**Timeline:** After database integration works  
**Features to Add:**
- Admin panel to create/edit practice tests
- Upload test questions in bulk (CSV/JSON)
- View student attempt analytics
- Set difficulty levels and expected durations
- Tag tests by curriculum/grade/subject

---

### 📊 Recommended Timeline

```
NOW (June 22, 2026)
  └─> Deploy to Vercel with hardcoded tests ✅
      └─> Monitor build success (Check Prisma type generation)
          └─> Decide on priority (Step 2)
              ├─> If "Not MVP critical" → Stay hardcoded, fix later
              ├─> If "Critical" → Proceed to Step 3
              └─> If "Uncertain" → Ask stakeholders

OPTION A: Hardcoded Path (Recommended for current situation)
  Days 1-7: Launch with hardcoded 6 tests
  Days 8-14: Gather user feedback on practice feature
  Week 3: Fix Prisma types + implement database if feedback demands it
  
OPTION B: Database Path (If feature is critical)
  Day 1: Fix Windows Prisma issue (Step 3 - Option A or B)
  Days 2-3: Re-enable API endpoints + implement useEffect
  Days 4-5: Test with real data, seed practice tests
  Day 6: Deploy database-driven version
```

---

### ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Vercel Prisma generation fails | Low | High | Test build, have rollback plan |
| Users frustrated with hardcoded tests | Medium | Low | Communication, quick iteration |
| Database schema breaks with new fields | Medium | High | Version migrations carefully |
| Teacher feature requests for practice management | High | Medium | Plan admin UI for Phase 2 |

---

### ✅ Success Criteria

**This decision is successful when:**
1. Vercel deployment succeeds with zero errors
2. Practice page displays 6 functional hardcoded tests
3. Users can navigate, view progress, click "Start Test" button
4. No API errors in browser console
5. Build time is < 2 minutes

**Future success metrics (after database integration):**
1. Teachers can create practice tests in admin panel
2. Student progress persists across sessions in database
3. Analytics show student attempt history and scores
4. Practice tests support filtering by difficulty/subject

---

### 📝 Summary & Recommendation

**RIGHT NOW:** ✅ Keep hardcoded tests, deploy to Vercel  
**This approach:**
- Eliminates risk of compilation errors
- Gets feature to users quickly
- Allows gathering real user feedback
- Vercel will prove Prisma works in production

**NEXT WEEK (after Vercel success):** Decide whether to fix Windows Prisma issue  
**Based on:**
- User demand for dynamic practice tests
- Priority vs. other feature work
- Available development time

**Not a permanent limitation** - Database integration CAN happen whenever you decide it's needed, but keeping it simple now reduces risk and accelerates launch.

---

## 17. Future Features (Deferred Implementation)

### 🎙️ **Podcast & Video Generation Feature**
**Status:** Deferred for Phase 2 (documented for future implementation)

**Description:**  
Generate audio podcasts and educational videos from search responses to help students engage with content in different formats. These features will be subscription-based and shareable to social media.

**Requirements:**
- On-demand podcast generation from search response text
- On-demand video generation for research topics
- Text-to-speech technology for podcast audio
- Video format output (MP4/WebM)
- Social media integration (WhatsApp, YouTube share)
- Feature availability based on subscription tier (FREE, PREMIUM, ENTERPRISE)

**Implementation Plan (Phase 2):**
1. **Podcast Generation:**
   - Integrate with Google Text-to-Speech API or ElevenLabs
   - Store generated audio files in cloud storage (AWS S3 or Supabase Storage)
   - Add podcast download/stream capability to UI
   - Update ParentReport to include podcast access

2. **Video Generation:**
   - Integrate with HeyGen, Synthesia, or similar video AI service
   - Generate educational video with avatar presenter
   - Add subtitle/caption support
   - Store video files in CDN for streaming

3. **Social Sharing:**
   - WhatsApp integration for direct sharing
   - YouTube upload for longer content
   - Generate shareable links with expiration
   - Track sharing analytics

4. **Database Updates Needed:**
   - Add table: `GeneratedContent` (id, userId, contentType, queryId, fileUrl, generatedAt)
   - Add column to `SearchResponse`: `podcastUrl`, `videoUrl`
   - Add columns to `User`: `podcastQuota`, `videoQuota` for subscription limits

5. **Subscription Plan Details:**
   - **FREE:** Limited to text-only responses
   - **PREMIUM:** 5 podcasts/month, 2 videos/month
   - **ENTERPRISE:** Unlimited podcasts and videos

**Technology Stack (Proposed):**
- **Podcast:** ElevenLabs API or Google Cloud Text-to-Speech
- **Video:** HeyGen API or Synthesia
- **Storage:** AWS S3 or Supabase Storage
- **Sharing:** Firebase Dynamic Links or custom short URL service

**Estimated Effort:** 40-50 hours (Phase 2)

---

**Document Version:** 2.0  
**Last Updated:** July 20, 2026  
**Owner:** Student Assistant Development Team  
**Status:** Phase 3 Complete — Teacher Portal, Admin Security, AI Assignment Workflow implemented
