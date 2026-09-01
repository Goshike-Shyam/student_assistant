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
