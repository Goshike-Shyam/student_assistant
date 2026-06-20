# EduSpark - Project Context Documentation

**Last Updated:** June 2026  
**Status:** MVP-Ready, Security Hardening Required  
**Team Size:** Educational LMS Development

---

## 1. Product Overview

**EduSpark** is a modern, adaptive learning management system (LMS) designed as a comprehensive educational platform serving students, teachers, parents, and administrators.

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
├─ Prisma ORM 4.16.0 (type-safe database)
├─ TypeScript (backend type safety)
├─ CORS middleware (cross-origin requests)
├─ Async handler wrapper (error handling)
└─ Custom error middleware
```

### Database
```
PostgreSQL (via Supabase)
├─ Connection: db.gwkfegybtmmcdxnfnkyj.supabase.co:5432
├─ Schema: 5 models (User, Course, Enrollment, Assignment, Submission)
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

📁 app/                              - Next.js App Router (12 pages)
├── globals.css                      - Global styles, Tailwind directives, icon mappings
├── layout.tsx                       - Root layout with SiteHeader & IconEmojiReplacer
├── page.tsx                         - Landing/home page
│
├── 📁 api/
│   └── status/
│       └── route.ts                 - GET /api/status endpoint
│
├── 📁 auth/
│   ├── login/
│   │   └── page.tsx                - Login page
│   └── signup/
│       └── page.tsx                - Signup/registration page
│
├── 📁 student/ (or app/ for student pages)
│   ├── dashboard/
│   │   └── page.tsx                - Student dashboard (home)
│   ├── profile/
│   │   └── page.tsx                - Student profile & settings
│   ├── practice/
│   │   └── page.tsx                - Practice tests library
│   ├── assignments/
│   │   └── page.tsx                - Assignment tracking & submission
│   ├── ai-tutor/
│   │   └── page.tsx                - AI homework helper
│   ├── chat/
│   │   └── page.tsx                - Conversational AI chat
│   └── resources/
│       └── page.tsx                - Learning resource library
│
├── 📁 admin/
│   ├── dashboard/
│   │   └── page.tsx                - Admin analytics dashboard
│   └── users/
│       └── page.tsx                - User management
│
├── 📁 parent/
│   └── portal/
│       └── page.tsx                - Parent progress view (planned)

📁 components/                       - React components
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
│   └── site-header.tsx              - Top navigation
│
├── sidebar.tsx                      - Student sidebar navigation
├── admin-sidebar.tsx                - Admin sidebar navigation
└── icon-emoji-replacer.tsx          - Icon rendering component (client-side emoji mapping)

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
  password  String    // ⚠️ NOT HASHED - SECURITY ISSUE
  role      Role      @default(STUDENT)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // Relationships
  instructorCourses Course[]
  enrollments       Enrollment[]
  submissions       Submission[]
  assignments       Assignment[]
}

enum Role {
  STUDENT
  INSTRUCTOR
  ADMIN
}
```

### Course Model
```prisma
model Course {
  id          String    @id @default(cuid())
  title       String
  description String?
  code        String    @unique
  instructorId String   // FK to User
  instructor  User      @relation(fields: [instructorId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relationships
  enrollments  Enrollment[]
  assignments  Assignment[]
}
```

### Enrollment Model
```prisma
model Enrollment {
  id        String   @id @default(cuid())
  userId    String
  courseId  String
  createdAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([userId, courseId])  // Prevent duplicate enrollments
}
```

### Assignment Model
```prisma
model Assignment {
  id        String       @id @default(cuid())
  title     String
  description String?
  courseId  String
  createdBy String       // FK to User (instructor)
  dueDate   DateTime
  status    AssignmentStatus @default(PENDING)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  course      Course       @relation(fields: [courseId], references: [id], onDelete: Cascade)
  creator     User         @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  submissions Submission[]
}

enum AssignmentStatus {
  PENDING
  SUBMITTED
  GRADED
}
```

### Submission Model
```prisma
model Submission {
  id           String   @id @default(cuid())
  assignmentId String
  studentId    String
  content      String   // Assignment submission content
  grade        Int?     // 0-100
  feedback     String?  // Teacher feedback
  submittedAt  DateTime @default(now())
  updatedAt    DateTime @updatedAt

  assignment Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  student    User       @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([assignmentId, studentId])  // One submission per student per assignment
}
```

### Relationships Diagram
```
User (Instructor) ──────creates─────→ Course
                                        ↓
User (Students) ──────enrolls in─────→ Enrollment
                                        ↓
                                    Course ──────has─────→ Assignment
                                                            ↓
                                                        Submission
                                                            ↑
User (Student) ──────makes submission─────────────→ Submission
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
- [x] Database migrations and schema
- [x] API error handling middleware

### ✅ **User Management**
- [x] User registration (role-based: Student/Teacher/Parent/Admin)
- [x] User signin/authentication endpoint
- [x] User profile retrieval
- [x] Database persistence for users

### ✅ **UI/UX Components**
- [x] Base UI components (Button, Card, Input, Label, Select, Textarea, Badge)
- [x] Site header/navigation
- [x] Responsive design system
- [x] Tailwind CSS styling
- [x] Icon emoji replacement (client-side)

### ✅ **Student Pages & Features**
- [x] Landing/home page
- [x] Student dashboard (stats, achievement levels, XP counter)
- [x] Student profile page
- [x] Practice tests library (6+ tests with difficulty ratings)
- [x] Assignment tracking & deadline management
- [x] AI tutor interface
- [x] Chat interface
- [x] Resources library

### ✅ **Teacher/Admin Pages**
- [x] Admin analytics dashboard (KPI cards, charts)
- [x] User management interface
- [x] Admin navigation sidebar

### ✅ **Backend Infrastructure**
- [x] CORS middleware
- [x] Error handling
- [x] Async route handlers
- [x] Prisma client singleton

### ✅ **Data Models**
- [x] User model (with role enum)
- [x] Course model
- [x] Enrollment model
- [x] Assignment model with status enum
- [x] Submission model

---

## 13. Features In Progress

### 🚧 **Icon Rendering**
- Current State: Emoji-based replacement working but suboptimal
- Next Step: Evaluate SVG icon library (Lucide React)
- Status: Functional but temporary solution

### 🚧 **API Endpoint Completion**
- Some CRUD endpoints implemented
- Need comprehensive testing
- Need pagination for large datasets

### 🚧 **Database Seeding**
- No seed script for demo data
- Needed for testing, demos, presentations

---

## 14. Pending Backlog

### 🔴 **CRITICAL - Security (Must Do Before Production)**
- [ ] Implement password hashing (bcrypt)
- [ ] Add authentication middleware (JWT verification)
- [ ] Add role-based access control (RBAC)
- [ ] Input validation on all endpoints
- [ ] CSRF protection
- [ ] Rate limiting

### 🟠 **HIGH - Features (Next Sprint)**
- [ ] Email verification on signup
- [ ] Password reset functionality
- [ ] Parent portal implementation
- [ ] Real-time notifications
- [ ] File upload for assignments
- [ ] PDF document support
- [ ] Video lecture integration
- [ ] Database indexing optimization

### 🟡 **MEDIUM - Quality (Ongoing)**
- [ ] Unit tests (Jest)
- [ ] Integration tests (API)
- [ ] E2E tests (Playwright)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Error logging (Sentry/LogRocket)
- [ ] Performance monitoring
- [ ] Analytics implementation

### 🟢 **LOW - Nice-To-Have**
- [ ] Dark mode support
- [ ] Mobile app (React Native)
- [ ] Offline capability (Service Worker)
- [ ] Multiple language support (i18n)
- [ ] Accessibility improvements (WCAG AA)
- [ ] Social features (discussion forums)
- [ ] Advanced search/filters
- [ ] Export reports (PDF/CSV)

### 📱 **Planned Future Features**
- [ ] Video streaming with HLS/DASH
- [ ] Live classes (Zoom/Google Meet integration)
- [ ] Interactive whiteboard
- [ ] Peer-to-peer study groups
- [ ] Adaptive learning algorithms
- [ ] ML-based student performance prediction
- [ ] Integration with Google Classroom/Canvas
- [ ] Batch user import (CSV)

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

### Decision 8: Supabase Auth (Planned)
**Context:** Authentication provider  
**Decision:** Use Supabase Auth for signup/login (currently basic implementation)  
**Rationale:**
- Integrated with database
- Email verification out-of-box
- OAuth support
- Row-level security (RLS)

---

## 16. Known Bugs & Technical Debt

### 🔴 **CRITICAL**

#### Bug 1: Plaintext Password Storage
- **Issue:** User passwords stored in database without hashing
- **Location:** `server/routes.ts` line ~45, `prisma/schema.prisma`
- **Impact:** Major security vulnerability
- **Fix:** Implement bcrypt hashing before storage
- **Priority:** Fix immediately before any production deployment
- **Estimated Effort:** 2-3 hours

#### Bug 2: No Authentication Middleware
- **Issue:** API endpoints accessible without role verification
- **Location:** `server/routes.ts` (all endpoints)
- **Impact:** Any user can access admin endpoints
- **Fix:** Add middleware to verify JWT and check role
- **Priority:** Before production
- **Estimated Effort:** 4-5 hours

### 🟠 **HIGH**

#### Bug 3: No Input Validation
- **Issue:** API endpoints don't validate request data
- **Location:** All route handlers
- **Impact:** SQL injection, data corruption possible
- **Fix:** Add express-validator middleware
- **Priority:** Before production
- **Estimated Effort:** 3-4 hours

#### Bug 4: Icon Font Not Loading
- **Issue:** Material Icons fail to load from CDN (net::ERR_ABORTED)
- **Location:** `app/globals.css`
- **Current Workaround:** Emoji replacement working
- **Fix:** Either enable emoji permanently or use SVG library
- **Priority:** High (cosmetic but affects UX)
- **Estimated Effort:** 2-3 hours

#### Bug 5: CORS Issues Possible
- **Issue:** CORS middleware exists but may need refinement
- **Location:** `server/middleware.ts`
- **Impact:** Cross-origin requests might fail
- **Fix:** Test with production domain, adjust allowed origins
- **Priority:** Before deployment
- **Estimated Effort:** 1-2 hours

### 🟡 **MEDIUM**

#### Debt 1: No Error Logging
- **Issue:** Errors not logged to external service
- **Impact:** Hard to debug production issues
- **Solution:** Integrate Sentry or similar
- **Estimated Effort:** 3-4 hours

#### Debt 2: No Database Indexing
- **Issue:** No performance optimization for queries
- **Impact:** Slow queries on large datasets (12K+ students)
- **Solution:** Add indexes on frequently queried fields (email, userId, courseId)
- **Estimated Effort:** 2-3 hours

#### Debt 3: No Pagination
- **Issue:** GET /api/users returns all users at once
- **Impact:** Performance degradation with many records
- **Solution:** Add limit/offset or cursor pagination
- **Estimated Effort:** 2-3 hours

#### Debt 4: No Request Validation
- **Issue:** Missing express-validator setup
- **Impact:** Invalid data can enter database
- **Solution:** Add validation middleware for all endpoints
- **Estimated Effort:** 3-4 hours

### 🟢 **LOW**

#### Debt 5: TypeScript Strict Mode Not Enabled
- **Issue:** `tsconfig.json` doesn't have `"strict": true`
- **Impact:** Some type errors not caught
- **Solution:** Enable strict mode gradually
- **Estimated Effort:** 2-3 hours (fixing errors)

#### Debt 6: No Component Documentation
- **Issue:** Component props not documented with JSDoc
- **Impact:** Harder to use components correctly
- **Solution:** Add JSDoc comments
- **Estimated Effort:** 2-3 hours

#### Debt 7: Missing API Documentation
- **Issue:** No OpenAPI/Swagger spec
- **Impact:** Hard for frontend to know all endpoints
- **Solution:** Use swagger-jsdoc to auto-generate docs
- **Estimated Effort:** 3-4 hours

### 📋 **Performance Issues**

- No asset optimization (images, code splitting)
- No caching strategy (Redis)
- No query optimization (N+1 queries possible)
- No rate limiting (DOS vulnerable)

### 🏗️ **Architecture Debt**

- No service layer (business logic mixed with routes)
- No event bus (tightly coupled components)
- No response formatting layer (inconsistent JSON)
- No comprehensive error codes (hard to debug)

---

## 17. Next Immediate Actions

### This Sprint (1 Week)
1. Fix password hashing (CRITICAL security)
2. Add authentication middleware (CRITICAL)
3. Implement input validation (CRITICAL)
4. Finalize icon rendering (Material vs emoji vs SVG)
5. Add database seeding script

### Next Sprint (2-3 Weeks)
6. Email verification
7. Password reset
8. Parent portal UI
9. Enhanced dashboard analytics
10. API documentation

### Future (After MVP)
11. Mobile app (React Native)
12. Video streaming
13. Real-time notifications
14. ML-based recommendations
15. Advanced analytics

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

**Document Version:** 1.0  
**Last Updated:** June 19, 2026  
**Owner:** EduSpark Development Team  
**Status:** Complete - Ready for Reference
