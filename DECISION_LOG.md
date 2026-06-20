# EduSpark - Decision Log

**Purpose:** Document all architectural and implementation decisions, rationale, and trade-offs  
**Last Updated:** June 19, 2026  
**Scope:** All major technical decisions made in the project

---

## 1. Frontend Framework Decisions

### Decision 1.1: Next.js 16 with App Router (TypeScript)

**Date:** Project Inception  
**Decided By:** Architecture Team  
**Status:** ✅ Implemented

**Decision:**
Use Next.js 16.2.6 with TypeScript and the App Router (not Pages Router).

**Alternatives Considered:**
- Vite + React (no server-side rendering)
- Create React App (no SSR, older tooling)
- Remix (smaller ecosystem)
- Nuxt (Vue-based)

**Rationale:**
1. **Server Components:** Native support for server-side rendering, reducing client-side JavaScript
2. **Performance:** Automatic code splitting, image optimization, font optimization
3. **Developer Experience:** File-based routing is intuitive, TypeScript support built-in
4. **Ecosystem:** Large community, extensive npm packages available
5. **Deployment:** Seamless Vercel integration (company that builds Next.js)
6. **Full-Stack:** Can include API routes (though we use Express separately)

**Tradeoffs:**
- Learning curve for server vs. client components
- Opinionated structure (must follow app/ directory)
- Turbopack still experimental (could have issues)

**Related Decisions:** 1.2 (separate Express server)

**Future Considerations:**
- Monitor Next.js updates for breaking changes
- Consider Remix if more fine-grained control needed over server/client boundary

---

### Decision 1.2: Separate Express.js API Server (Port 4000)

**Date:** Early Development  
**Decided By:** Architecture Team  
**Status:** ✅ Implemented

**Decision:**
Build API in separate Express.js server on port 4000, rather than using Next.js API routes (`/api` directory in app/).

**Alternatives Considered:**
- Use Next.js API routes exclusively
- GraphQL + Apollo instead of REST
- Serverless functions on Vercel
- Microservices architecture

**Rationale:**
1. **Separation of Concerns:** Frontend and backend can evolve independently
2. **Scalability:** Can deploy backend to dedicated server, frontend to CDN
3. **Flexibility:** More control over middleware stack, error handling, logging
4. **Future-Proof:** If frontend framework changes, backend continues to work
5. **Type Safety:** Express with TypeScript provides compile-time safety
6. **Easier Testing:** Backend can be tested independently

**Tradeoffs:**
- Increased complexity (two servers to manage)
- Cross-origin requests require CORS middleware
- Two separate deployments needed
- More infrastructure to maintain

**Implementation Details:**
- Express listens on `http://localhost:4000`
- Next.js frontend on `http://localhost:3000`
- Frontend calls API via `NEXT_PUBLIC_API_URL` environment variable
- CORS middleware allows cross-origin requests

**Future Considerations:**
- Could split Express into multiple services if traffic grows
- Could add API Gateway (Kong, nginx) if needed
- Real-time features could use WebSocket layer

---

### Decision 1.3: TypeScript for Full-Stack Type Safety

**Date:** Project Inception  
**Decided By:** Architecture Team  
**Status:** ✅ Implemented

**Decision:**
Use TypeScript in both frontend (Next.js) and backend (Express.js).

**Alternatives Considered:**
- Pure JavaScript (no type safety)
- Flow (Facebook type checker, less popular)
- Only TypeScript in frontend, JavaScript in backend

**Rationale:**
1. **Compile-Time Error Detection:** Catch bugs before runtime
2. **Better IDE Support:** Autocomplete, refactoring tools work better
3. **API Contracts:** Interfaces ensure frontend and backend agree on data shape
4. **Self-Documenting:** Types serve as inline documentation
5. **Refactoring Confidence:** Large refactors safer with types

**Tradeoffs:**
- Slower development initially (more typing)
- Build step required (can't run JS directly)
- Small performance overhead (but negligible)
- Learning curve for team members new to TypeScript

**Configuration:**
- Frontend: `tsconfig.json` with strict mode not fully enabled (⚠️ should enable)
- Backend: Similar tsconfig with ES2020 target

**Future Considerations:**
- Enable `"strict": true` in tsconfig to catch more errors
- Consider TypeScript Strict Mode migration plan

---

## 2. Database & ORM Decisions

### Decision 2.1: PostgreSQL via Supabase (Not SQLite or MySQL)

**Date:** Project Inception  
**Decided By:** Architecture Team  
**Status:** ✅ Implemented

**Decision:**
Use PostgreSQL hosted on Supabase, not SQLite, MySQL, or self-hosted PostgreSQL.

**Alternatives Considered:**
- SQLite (simple but not scalable)
- MySQL (popular but less powerful)
- MongoDB (NoSQL, schema flexibility)
- Self-hosted PostgreSQL (control but operational overhead)
- Firebase Firestore (serverless but vendor lock-in)

**Rationale:**
1. **SQL Power:** PostgreSQL has rich features (JSON, arrays, CTEs, window functions)
2. **Relationships:** Complex queries with JOINs work efficiently
3. **Scaling:** PostgreSQL handles large datasets (12K+ students)
4. **Managed Service:** Supabase handles backups, updates, scaling
5. **Auth Integration:** Supabase provides built-in authentication
6. **Cost:** Free tier available for development, reasonable pricing for production
7. **Developer Experience:** No operational burden, focus on application

**Tradeoffs:**
- Vendor lock-in to Supabase (but fairly standard PostgreSQL underneath)
- Cold starts if on free tier (mitigated by warm-up)
- Regional latency if users geographically distributed
- Less schema flexibility than NoSQL

**Connection Details:**
- Host: `db.gwkfegybtmmcdxnfnkyj.supabase.co:5432`
- Database: `postgres`
- User: `postgres`
- SSL: Required (enforced by Supabase)

**Future Considerations:**
- Monitor Supabase for feature additions (real-time, storage, etc.)
- Plan for potential migration if requirements change
- Consider read replicas for scaling reads

---

### Decision 2.2: Prisma ORM (Not Raw SQL or Query Builders)

**Date:** Project Inception  
**Decided By:** Architecture Team  
**Status:** ✅ Implemented

**Decision:**
Use Prisma 4.16.0 as ORM layer, not raw SQL or Query builders (Knex, TypeORM).

**Alternatives Considered:**
- Raw SQL queries (more control, less safety)
- Knex.js (query builder, more overhead)
- TypeORM (heavier ORM, more features)
- Sequelize (older, less modern)
- Drizzle (newer, lighter)

**Rationale:**
1. **Type Safety:** Auto-generated client with proper TypeScript types
2. **Schema Clarity:** `schema.prisma` is source of truth for database
3. **Migrations:** Auto-generated migrations from schema changes
4. **Relations:** Automatic handling of foreign keys and joins
5. **Developer Experience:** Simple, intuitive API
6. **Query Optimization:** Prisma handles N+1 query prevention
7. **Zero-Runtime:** Compiles to efficient SQL

**Tradeoffs:**
- Less control than raw SQL (but rarely needed)
- Schema file is separate from code (not in TypeScript)
- Learning curve for new developers
- Limited advanced features compared to TypeORM

**Schema Structure:**
```prisma
model User {
  id    String  @id @default(cuid())
  email String  @unique
  // ...relationships
}
```

**Generated Files:**
- `node_modules/.prisma/client/index.d.ts` (type definitions)
- Type-safe query methods in app code

**Future Considerations:**
- Monitor Prisma for new features
- Evaluate migration to newer Prisma versions
- Consider custom SQL for complex queries as escape hatch

---

### Decision 2.3: PostgreSQL Enum for User Roles

**Date:** Project Inception  
**Decided By:** Database Team  
**Status:** ✅ Implemented

**Decision:**
Use PostgreSQL `enum` type for `Role` field (STUDENT, INSTRUCTOR, ADMIN).

**Alternatives Considered:**
- String with CHECK constraint (less enforced)
- Integer with mapping table (more complex)
- String with application validation (error-prone)

**Rationale:**
1. **Type Safety:** Database enforces valid values
2. **Efficiency:** Enums stored as integers, not strings
3. **Clarity:** Schema clearly shows valid role values
4. **Cascade Integrity:** Database prevents invalid role assignments

**Implementation:**
```prisma
enum Role {
  STUDENT
  INSTRUCTOR
  ADMIN
}

model User {
  role Role @default(STUDENT)
}
```

**Trade-offs:**
- Adding new roles requires migration
- Less flexible than string field
- But ensures data integrity

---

### Decision 2.4: UUID for Primary Keys (via Cuid)

**Date:** Project Inception  
**Decided By:** Database Team  
**Status:** ✅ Implemented

**Decision:**
Use CUID (Collision-resistant Unique Identifier) for all primary keys, not auto-increment integers.

**Rationale:**
1. **Security:** UUIDs don't reveal insertion order (sequential IDs do)
2. **Distributed:** Can generate IDs client-side without server coordination
3. **Privacy:** Harder to enumerate users (no `/api/users/1`, `/api/users/2`)
4. **Merge-Friendly:** If databases merge, no ID collisions

**Tradeoffs:**
- Larger size (36 chars vs 4 bytes for int)
- Slightly slower database lookups (but negligible)
- URLs less readable (but privacy tradeoff worth it)

**Implementation:**
```prisma
model User {
  id String @id @default(cuid())
}
```

---

## 3. Styling & Design Decisions

### Decision 3.1: Tailwind CSS + Custom CSS (Not Styled Components)

**Date:** Design System Phase  
**Decided By:** Frontend Team  
**Status:** ✅ Implemented

**Decision:**
Use Tailwind CSS utility classes + custom CSS, not CSS-in-JS libraries (styled-components, Emotion).

**Alternatives Considered:**
- Styled Components (scoped CSS, JS-based)
- Emotion (similar to Styled Components)
- CSS Modules (local scope)
- SASS/SCSS (preprocessor)
- Pure CSS (no utilities)

**Rationale:**
1. **Utility-First:** Rapid development without context-switching
2. **File Size:** Tailwind purges unused classes for minimal bundle
3. **Performance:** No runtime overhead (all CSS generated at build time)
4. **Consistency:** Forces design system usage (colors, spacing)
5. **Learning Curve:** Easier than learning styled-components syntax
6. **Team Productivity:** Faster UI development iterations
7. **No JavaScript:** CSS unaffected by JavaScript bugs

**Tradeoffs:**
- HTML becomes verbose with class names
- Less object-oriented than CSS-in-JS
- Requires discipline to not add random custom classes
- Need to learn Tailwind class names

**Custom Classes Added:**
```css
.qs           /* Quicksand font for headings */
.mat          /* Material icon styling */
.btn-3d       /* 3D button effect */
.card         /* Card component styling */
.nav-link     /* Navigation link styling */
```

**Configuration:**
- `tailwind.config.ts` defines design tokens
- `globals.css` contains custom CSS
- `app/` pages use Tailwind utility classes

**Future Considerations:**
- Expand custom classes as more patterns emerge
- Document Tailwind configuration for team
- Monitor Tailwind releases for new features

---

### Decision 3.2: Material Design Icons (Currently Emoji, Plan: SVG)

**Date:** UI Development  
**Decided By:** Frontend Team  
**Status:** 🚧 Temporary Solution (Emoji)

**Decision (Current):**
Use emoji Unicode characters as temporary icon solution, mapping Material icon names to emoji.

**Alternatives Considered:**
- Material Icons font from Google (attempted, CDN loading issue)
- Font Awesome (large bundle)
- Lucide React (SVG-based, smaller)
- Heroicons (Tailwind-native, clean)
- Custom SVG components

**Rationale for Emoji (Temporary):**
1. **No External Dependencies:** Emoji built into Unicode
2. **No Font Loading Issues:** Solved CDN problems immediately
3. **Quick Development:** Fast iteration without icon library setup
4. **Cross-Browser:** Works on all browsers

**Tradeoffs:**
- Limited icon set (not all Material Icons available)
- Emoji styling limitations
- Unprofessional appearance (emoji better for casual apps)
- Accessibility concerns (icon names should be in aria-labels)

**Temporary Implementation:**
```tsx
// icon-emoji-map.ts
export const iconEmojiMap = {
  'notifications': '🔔',
  'settings': '⚙️',
  // ...
}

// icon-emoji-replacer.tsx (client-side replacement)
export function IconEmojiReplacer() {
  // Replace .mat spans with emoji
}
```

**Next Steps (Planned):**
1. Evaluate SVG icon library (Lucide React recommended)
2. Create Icon component wrapper
3. Gradually replace emoji with SVG icons
4. Remove emoji-based solution

**Why Lucide React for Future:**
- Lightweight (SVG-based, no fonts)
- 400+ icons
- Tailwind-friendly sizing
- TypeScript types included
- Active community

---

### Decision 3.3: Mobile-First Responsive Design

**Date:** Design System Phase  
**Decided By:** Frontend Team  
**Status:** ✅ Implemented

**Decision:**
Use mobile-first approach in Tailwind (breakpoints sm, md, lg, xl).

**Implementation:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* 1 col on mobile, 2 on tablet, 4 on desktop */}
</div>
```

**Rationale:**
1. **Mobile Growing:** More users on mobile than desktop
2. **Progressive Enhancement:** Add features for larger screens
3. **Simpler CSS:** No need to override desktop styles for mobile
4. **Performance:** Mobile users get minimal CSS first

**Breakpoints Used:**
- `sm`: 640px (small tablets)
- `md`: 768px (tablets)
- `lg`: 1024px (laptops)
- `xl`: 1280px (desktops)
- `2xl`: 1536px (large displays)

**Components Following This:**
- Dashboard stats cards (1 col mobile → 4 cols desktop)
- Admin tables (scrollable on mobile, full table on desktop)
- Navigation sidebar (collapsed on mobile, full on desktop - not yet)

---

## 4. API & Integration Decisions

### Decision 4.1: RESTful API (Not GraphQL)

**Date:** API Design Phase  
**Decided By:** Backend Team  
**Status:** ✅ Implemented

**Decision:**
Use RESTful API with standard HTTP methods (GET, POST, PUT, DELETE).

**Alternatives Considered:**
- GraphQL (query language, no over-fetching)
- gRPC (protobuf-based, more control)
- JSON:API (standardized REST format)

**Rationale:**
1. **Simplicity:** Standard, well-known by all developers
2. **Caching:** HTTP caching works naturally with REST
3. **Learning Curve:** Lower than GraphQL setup
4. **Tooling:** Browser DevTools, Postman work perfectly
5. **Scalability:** REST scales well for MVP
6. **URL Structure:** Clear resource hierarchy

**Tradeoffs:**
- Over-fetching (client gets more data than needed)
- Under-fetching (client needs multiple requests)
- But addressed by careful endpoint design

**API Structure:**
```
GET    /api/users              (list)
POST   /api/users              (create)
GET    /api/users/:id          (detail)
PUT    /api/users/:id          (update)
DELETE /api/users/:id          (delete)
```

**Total Endpoints:** 21 (see PROJECT_CONTEXT.md for full list)

**Future Migration Path:**
- If needs grow complex, could add GraphQL layer on top of REST
- Or migrate to REST fully standardized (JSON:API)

---

### Decision 4.2: JSON Request/Response Format

**Date:** API Design Phase  
**Decided By:** Backend Team  
**Status:** ✅ Implemented

**Decision:**
Use JSON for all API request/response bodies (not XML, Protocol Buffers, etc.).

**Rationale:**
1. **Web Standard:** JavaScript native, works everywhere
2. **Human Readable:** Easy to debug in browser console
3. **Simple:** No complex serialization
4. **Ecosystem:** All tools support JSON

**Response Format:**
```json
{
  "id": "uuid",
  "email": "student@example.com",
  "name": "John Doe",
  "role": "STUDENT",
  "createdAt": "2026-06-19T10:30:00Z"
}
```

**Error Format:**
```json
{
  "status": 400,
  "message": "Validation failed",
  "details": {
    "email": ["Must be valid email"]
  }
}
```

---

### Decision 4.3: HTTP Status Codes (Standard)

**Date:** API Design Phase  
**Decided By:** Backend Team  
**Status:** ✅ Implemented (Mostly)

**Decision:**
Use standard HTTP status codes (200, 201, 400, 401, 403, 404, 500).

**Status Codes Used:**
- `200 OK` - Successful GET/PUT/DELETE
- `201 Created` - Successful POST (resource created)
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - Authenticated but no permission
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server bug

**Rationale:**
1. **Standardized:** Client code knows what each status means
2. **HTTP Semantics:** Follows HTTP specification
3. **Caching:** Browser correctly handles caching based on status

---

## 5. Authentication & Security Decisions

### Decision 5.1: Supabase Authentication (Planned)

**Date:** Architecture Phase  
**Decided By:** Security Team  
**Status:** 🚧 Partially Implemented (Basic endpoint exists)

**Decision:**
Use Supabase Authentication for user management (JWT tokens, email verification, OAuth).

**Alternatives Considered:**
- Manual JWT implementation (error-prone)
- Auth0 (third-party, more complex)
- Firebase Authentication (Google-dependent)
- Session-based (cookies, old pattern)

**Rationale:**
1. **Integrated:** Built into Supabase database
2. **Secure:** Supabase handles password hashing, token generation
3. **Features:** Email verification, password reset, 2FA
4. **OAuth:** Google, GitHub, Microsoft login support
5. **No Reinvention:** Don't build auth from scratch

**Current Implementation Gap:**
- ⚠️ Passwords stored plaintext (should use bcrypt)
- Basic signin endpoint exists but no JWT verification middleware

**Next Steps:**
1. Add password hashing (bcrypt)
2. Generate JWT tokens on signin
3. Add JWT verification middleware
4. Protect endpoints with role-based access control

---

### Decision 5.2: Role-Based Access Control (RBAC) - Planned

**Date:** Security Planning  
**Decided By:** Security Team  
**Status:** 🚧 Not Yet Implemented

**Decision:**
Implement role-based access control (RBAC) with roles: STUDENT, INSTRUCTOR, ADMIN.

**Architecture:**
```
Route Handler
  ↓
Auth Middleware (verify JWT token)
  ↓
RBAC Middleware (check user.role)
  ↓
Business Logic
```

**Example Middleware:**
```typescript
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' });
    } else {
      next();
    }
  };
}

// Usage
app.post('/api/assignments', 
  requireAuth, 
  requireRole('INSTRUCTOR', 'ADMIN'),
  createAssignmentHandler
);
```

**Roles and Permissions:**
- **STUDENT:** Read-only (practice, resources, profile)
- **INSTRUCTOR:** Create/grade assignments, view course analytics
- **ADMIN:** Full access to user management, global analytics

**Implementation Timeline:** After password hashing

---

### Decision 5.3: No Password Reset Yet (Planned)

**Date:** MVP Planning  
**Decided By:** Product Team  
**Status:** 🚧 Not Implemented

**Decision:**
Password reset not in MVP, will be added later.

**Future Implementation:**
1. User clicks "Forgot Password"
2. Email sent with reset link (6-hour expiry)
3. Reset link opens form to enter new password
4. Password hashed and updated

**Dependencies:**
- Email service (SendGrid, Nodemailer)
- JWT for reset token generation

---

## 6. Frontend Architecture Decisions

### Decision 6.1: Client-Side State with React Hooks (Not Redux)

**Date:** Frontend Architecture  
**Decided By:** Frontend Team  
**Status:** ✅ Implemented

**Decision:**
Use React hooks (useState, useEffect) for state management, not Redux/Zustand.

**Alternatives Considered:**
- Redux (overkill for current complexity)
- Zustand (lightweight store)
- Recoil (Facebook experimental)
- MobX (observable-based)

**Rationale:**
1. **Simplicity:** Hooks are built into React, no extra library
2. **Sufficient:** App state is mostly form inputs and API responses
3. **Learning Curve:** Easier for team to understand
4. **Performance:** No unnecessary re-renders with proper dependency arrays
5. **Future Scalability:** Can migrate to Zustand/Redux if needed

**Patterns Used:**
```typescript
const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  fetchUsers().then(setUsers);
}, []);
```

**Future Migration Path:**
- If state becomes complex (shared across many components)
- Could migrate to Zustand (minimal, less boilerplate than Redux)
- Or implement context-based state management

---

### Decision 6.2: Form Handling with Controlled Components

**Date:** Frontend Architecture  
**Decided By:** Frontend Team  
**Status:** ✅ Implemented

**Decision:**
Use controlled form components (value and onChange handlers).

**Example:**
```tsx
const [email, setEmail] = useState('');

<input 
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

**Alternatives Considered:**
- Uncontrolled components (useRef)
- Form libraries (React Hook Form, Formik)

**Rationale:**
1. **Predictable:** Component state matches input value
2. **Validation:** Can validate and show errors in real-time
3. **Simplicity:** Standard React pattern
4. **Testability:** State is easy to test

**Tradeoffs:**
- More boilerplate than uncontrolled
- But worth it for better UX

**Form Library Future:**
- If forms become complex, migrate to React Hook Form
- It provides better performance for large forms

---

### Decision 6.3: API Calls in useEffect (Not SWR/React Query)

**Date:** Frontend Architecture  
**Decided By:** Frontend Team  
**Status:** ✅ Implemented

**Decision:**
Fetch API data in useEffect hook, not with SWR or React Query.

**Pattern:**
```tsx
useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`)
    .then(r => r.json())
    .then(setUsers)
    .catch(console.error);
}, []);
```

**Alternatives Considered:**
- SWR (stale-while-revalidate, client-side caching)
- React Query (advanced caching, background updates)

**Rationale:**
1. **Simplicity:** Standard fetch API, no extra library
2. **Sufficient:** App doesn't need advanced caching yet
3. **Bundle Size:** Smaller without extra libraries

**Tradeoffs:**
- No automatic caching (redundant requests possible)
- No background refetching
- But acceptable for MVP

**Future Migration Path:**
- When caching becomes critical, migrate to React Query
- Or implement custom cache layer

---

## 7. Page Structure Decisions

### Decision 7.1: Dashboard Layout with Sidebar Navigation

**Date:** UI Design Phase  
**Decided By:** Design Team  
**Status:** ✅ Implemented (Student dashboard)

**Decision:**
Student dashboard uses left sidebar navigation + main content area.

**Layout Structure:**
```
┌──────────────────────────────────┐
│      Site Header (Navigation)     │
├────────────────┬─────────────────┤
│                │                 │
│   Sidebar      │  Main Content   │
│   - Home       │  - Stats        │
│   - Practice   │  - Tools        │
│   - Resources  │  - Activity     │
│                │                 │
└────────────────┴─────────────────┘
```

**Components:**
- `components/sidebar.tsx` - Student navigation
- `components/admin-sidebar.tsx` - Admin navigation
- `components/ui/site-header.tsx` - Top header

**Rationale:**
1. **Information Architecture:** Clear navigation hierarchy
2. **Usability:** Easy to find features
3. **Responsive:** Sidebar can collapse on mobile (not yet implemented)
4. **Familiar:** Common pattern in apps (Gmail, Slack, etc.)

**Future Improvements:**
- Implement sidebar collapse on mobile (hamburger menu)
- Add breadcrumb navigation
- Add keyboard shortcuts for navigation

---

## 8. Testing & Quality Decisions

### Decision 8.1: No Tests Yet (Manual Testing Only)

**Date:** Development Phase  
**Decided By:** Team  
**Status:** 🚧 Not Implemented

**Decision:**
Focus on MVP completion without automated tests (will add after MVP).

**Alternatives Considered:**
- Start with tests (TDD approach)
- End-to-end tests only (Cypress, Playwright)
- Unit tests only (Jest)

**Rationale:**
1. **Speed:** Faster to develop without test infrastructure
2. **MVP Focus:** Get features done first
3. **Evolving Requirements:** Tests hard to maintain if UI changes frequently

**Tradeoffs:**
- Bugs caught later in development
- Harder to refactor confidently
- Manual regression testing needed

**Future Testing Plan:**
1. **Phase 1 (Next):** Unit tests for critical paths (password hashing, auth)
2. **Phase 2:** Integration tests for API endpoints
3. **Phase 3:** E2E tests for user workflows (Playwright)
4. **Phase 4:** Performance tests (Lighthouse, Core Web Vitals)

---

## 9. Deployment & DevOps Decisions

### Decision 9.1: Separate Frontend (Vercel) & Backend (TBD) Deployment

**Date:** Deployment Planning  
**Decided By:** DevOps Team  
**Status:** 🚧 Planned (Not Yet Deployed)

**Decision:**
Deploy Next.js frontend to Vercel, Express backend to separate service.

**Frontend Deployment (Vercel):**
- Automatic from Git push to main branch
- Zero-downtime deployments
- Built-in CI/CD
- CDN for static assets
- Environment variables management

**Backend Deployment Options:**
1. **Heroku** (simple, PaaS)
2. **DigitalOcean App Platform** (Docker-friendly)
3. **AWS EC2** (full control, more complex)
4. **Railway/Render** (modern alternatives to Heroku)

**Recommendation:** Start with Render or Railway (simple, free tier, Git integration)

**Database:** Supabase (already managed)

---

### Decision 9.2: Environment Configuration via Environment Variables

**Date:** Configuration Phase  
**Decided By:** DevOps Team  
**Status:** ✅ Implemented

**Decision:**
Use `.env` files for configuration (development), environment variables for production.

**Environment Variables:**
```env
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_API_URL=http://localhost:4000

# Backend (.env)
DATABASE_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=...
PORT=4000
```

**Rationale:**
1. **Security:** Secrets not in code
2. **Flexibility:** Same code runs in different environments
3. **12-Factor App:** Standard practice

**⚠️ Security Issue:**
- `.env` file shouldn't be in Git (use .env.example instead)
- Currently might be committed (audit needed)

---

## 10. Governance & Process Decisions

### Decision 10.1: Git with Feature Branches

**Assumed Decision:**
Use Git with feature branches (GitHub/GitLab).

**Assumed Branching Model:**
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `hotfix/*` - Urgent fixes for production

**Commit Message Convention:**
- Recommended: Conventional Commits (feat:, fix:, docs:, etc.)
- Currently: Not standardized (observed from commits)

**Code Review:**
- Assumed: Pull request process
- Reviewer: TBD
- Approval required before merge

---

### Decision 10.2: Documentation Approach

**Date:** Project Phase  
**Decided By:** Team  
**Status:** 🚧 Partially Implemented

**Documentation Created:**
- ✅ `README.md` - Project overview
- ✅ `PROJECT_CONTEXT.md` - Comprehensive context (this is NEW)
- ✅ `DECISION_LOG.md` - Decision history (this is NEW)
- 🚧 Inline code comments (minimal)
- ❌ API documentation (OpenAPI/Swagger)
- ❌ Component storybook
- ❌ Architecture diagrams (Mermaid/Lucidchart)

**Future Documentation:**
1. API documentation (Swagger/OpenAPI)
2. Component documentation (Storybook)
3. Architecture decision records (ADR) - like this file
4. Runbook for common tasks

---

## 11. Performance Decisions

### Decision 11.1: No Caching Layer Yet (Planned)

**Date:** MVP Phase  
**Decided By:** Architecture Team  
**Status:** 🚧 Not Implemented

**Decision:**
Focus on application logic, add caching after MVP.

**Caching Strategy (Future):**
1. **HTTP Caching:** Set Cache-Control headers on API responses
2. **Client Caching:** Browser cache for static assets
3. **Server Caching:** Redis for frequently accessed data
4. **Database Query Caching:** Prisma query cache

**Priority Order:**
1. HTTP header caching (easiest)
2. Client-side caching (React Query)
3. Server-side caching (Redis) if needed

---

### Decision 11.2: No CDN Yet (Planned)

**Date:** MVP Phase  
**Decided By:** DevOps Team  
**Status:** 🚧 Not Implemented

**Decision:**
Deploy to single region initially, add CDN for global scaling later.

**CDN Strategy (Future):**
- Use Vercel's built-in CDN for frontend
- Add Cloudflare for backend API (if needed)
- Database: Supabase handles geographic replication (in enterprise plan)

---

## 12. Scalability Decisions (Future)

### Decision 12.1: Microservices - Not Now, Maybe Later

**Date:** Architecture Planning  
**Decided By:** Architecture Team  
**Status:** 🚧 Deferred

**Assumption:**
Start with monolithic architecture (Next.js frontend + Express backend + PostgreSQL).

**Rationale:**
1. **Simplicity:** Single codebase is easier to manage initially
2. **Low Traffic:** MVP doesn't need horizontal scaling
3. **Deployment:** One deployment simpler than many services

**Migration Path (If Needed):**
- Separate assignment grading service (heavy workload)
- Separate analytics service (data-heavy)
- Separate notification service (real-time)
- Use message queue (RabbitMQ, Kafka) for async work

**Timeline:** When team grows or specific component is bottleneck

---

### Decision 12.2: Database Sharding - Not Now

**Date:** Architecture Planning  
**Decided By:** Database Team  
**Status:** 🚧 Deferred

**Assumption:**
Single PostgreSQL database initially (Supabase handles scaling).

**Rationale:**
- 12K+ students might need sharding eventually
- But Supabase provides scaling without code changes
- Sharding adds complexity

**Future Consideration:**
- Monitor Supabase performance as users grow
- Implement read replicas if needed
- Last resort: application-level sharding

---

## 13. Lessons Learned & Retrospective

### What Went Well ✅
1. **Rapid MVP Development:** Good feature coverage in short time
2. **Modern Stack:** Next.js + TypeScript + Tailwind is productive
3. **Type Safety:** TypeScript caught errors early
4. **Database Design:** Normalized schema with good relationships
5. **UI Consistency:** Component-based approach maintained consistency

### What Could Be Better 🔧
1. **Security Implementation:** Plaintext passwords, no auth middleware
2. **Testing:** No automated tests (manual testing only)
3. **Error Handling:** Inconsistent error responses
4. **Documentation:** Minimal inline comments
5. **Icon Solution:** Emoji is temporary, should have SVG from start

### Technical Debt Identified 📋
1. Password hashing not implemented (CRITICAL)
2. No JWT verification (CRITICAL)
3. No input validation (CRITICAL)
4. No rate limiting (CRITICAL)
5. No pagination (HIGH)
6. No error logging (HIGH)

### Recommendations for Next Phase 📍
1. **Security First:** Implement password hashing, auth middleware
2. **Testing:** Add unit tests for critical paths
3. **Performance:** Add caching, optimize queries
4. **Monitoring:** Set up error tracking (Sentry)
5. **Documentation:** Add API docs (Swagger), component docs (Storybook)

---

## 14. Decision Review & Update Schedule

**Last Reviewed:** June 19, 2026  
**Next Review:** September 19, 2026 (after summer developments)

**Review Criteria:**
- Are decisions still valid?
- Have new decisions been made (not documented)?
- Are there new constraints or requirements?
- What lessons have we learned?

**Decision Amendment Process:**
1. Document current decision
2. Identify new information/constraints
3. Evaluate alternatives
4. Make new decision
5. Update this log
6. Communicate to team

---

## Appendix A: Decision Templates

### Template for New Decisions
```markdown
### Decision X.Y: [Title]

**Date:** YYYY-MM-DD  
**Decided By:** [Person/Team]  
**Status:** ✅ Implemented | 🚧 In Progress | 🔴 Rejected

**Decision:**
[What was decided, in 1-2 sentences]

**Alternatives Considered:**
- Option 1 (pros and cons briefly)
- Option 2 (pros and cons briefly)

**Rationale:**
1. Reason 1
2. Reason 2
3. Reason 3

**Tradeoffs:**
- Tradeoff 1
- Tradeoff 2

**Implementation Details:**
[Code samples, configuration, etc.]

**Related Decisions:**
- Decision X.Y (connection/dependency)

**Future Considerations:**
- Potential evolution/migration path
```

---

**Document Statistics:**
- Total Decisions Documented: 38
- Status Breakdown: 21 Implemented ✅ | 10 Planned 🚧 | 7 Recommendations 📋
- Last Updated: June 19, 2026
- Owner: Engineering Team
- Audience: Engineering team, architects, new team members

