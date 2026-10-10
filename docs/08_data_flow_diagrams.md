# Data Flow Diagrams

## 1) Student Query -> AI Service -> Persistence -> Student History

```mermaid
sequenceDiagram
    autonumber
    participant S as Student UI
    participant API as Next API (/api/*)
    participant AI as Gemini Service
    participant TTS as TTS Provider
    participant DB as Prisma + Postgres

    S->>API: Submit query/assignment/practice request
    API->>AI: Generate content/feedback prompt
    AI-->>API: Structured response

    alt Podcast mode enabled
        API->>TTS: Generate audio segments
        TTS-->>API: audioUrl/segments metadata
    end

    API->>DB: Persist query/result/attempt/submission
    DB-->>API: Persisted IDs + timestamps
    API-->>S: JSON payload (result + metadata)

    S->>API: GET student history/progress
    API->>DB: Fetch student history records
    DB-->>API: Historical items
    API-->>S: Rendered history timeline/cards
```

## 2) Student Progress -> Analytics Calculation -> Teacher/Parent Portal View

```mermaid
sequenceDiagram
    autonumber
    participant S as Student Activity
    participant XP as XP/Streak Services
    participant DB as Postgres
    participant TAPI as Teacher APIs
    participant PAPI as Parent APIs
    participant TUI as Teacher Portal
    participant PUI as Parent Portal

    S->>XP: Complete practice/assignment/login action
    XP->>DB: Write student_xp_log / submissions / attempts
    XP->>DB: Update streak and badge rows when thresholds hit

    TUI->>TAPI: Request class analytics/status
    TAPI->>DB: Aggregate submissions, scores, completion metrics
    DB-->>TAPI: Aggregated dataset
    TAPI-->>TUI: KPI cards, charts, student-level breakdown

    PUI->>PAPI: Request child notifications/preferences/reports
    PAPI->>DB: Read progress/feedback summary data
    DB-->>PAPI: Parent-scoped records
    PAPI-->>PUI: Parent visibility view
```

## 3) ASCII Sequence (Compact)

### 3.1 Student Query Pipeline
```text
Student -> /api/assignments|practice|podcasts -> AI/TTS -> Prisma -> Postgres
       <- result payload + IDs + optional audio URLs
Student -> /api/student/research-history|progress -> Prisma -> Postgres -> history/metrics
```

### 3.2 Progress to Teacher/Parent Visibility
```text
Student action -> XP/streak update -> student_xp_log + submissions + attempts
Teacher portal -> /api/teacher/analytics + assignment status -> aggregates -> dashboard
Parent portal  -> /api/parent/* + notifications -> summaries -> parent view
```

## 4) Feedback -> Tone Classification -> Admin Moderation -> Landing Testimonials

```mermaid
sequenceDiagram
    autonumber
    participant U as Student/Parent/Teacher UI
    participant FUI as Feedback Page (/feedback)
    participant FAPI as Feedback APIs
    participant AI as Gemini Service
    participant DB as Prisma + Postgres
    participant AUI as Admin Feedback Page
    participant L as Landing Page (/)

    U->>FUI: Open sticky footer Feedback link
    alt Attachment provided
        FUI->>FAPI: POST /api/feedback/upload (multipart)
        FAPI-->>FUI: attachment url + name
    end

    FUI->>FAPI: POST /api/feedback (displayName, feedbackText, attachment*)
    FAPI->>AI: classify tone (Appreciation/Improvement/Frustration)
    AI-->>FAPI: one-word class
    FAPI->>DB: Insert feedback row (showOnHomepage=false)
    FAPI-->>FUI: success + tone

    AUI->>FAPI: GET /api/admin/feedback
    FAPI->>DB: Read feedback rows
    DB-->>FAPI: feedback dataset
    FAPI-->>AUI: table payload

    AUI->>FAPI: PATCH /api/admin/feedback (showOnHomepage toggle)
    FAPI->>DB: Update moderation fields

    L->>FAPI: GET /api/feedback/public
    FAPI->>DB: Read approved feedback only
    DB-->>FAPI: approved items
    FAPI-->>L: testimonials payload
```

### 4.1 Compact ASCII
```text
Role UI -> /api/feedback/upload (optional) -> local upload path
Role UI -> /api/feedback -> AI tone classify -> feedback table (pending)
Admin UI -> /api/admin/feedback (GET/PATCH) -> approve for homepage
Landing -> /api/feedback/public -> approved testimonials render
```
