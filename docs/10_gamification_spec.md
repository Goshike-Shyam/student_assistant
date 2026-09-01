# Gamification Technical Specification

## 1) Scope
Gamification is driven by DB-backed XP events, level thresholds, streak updates, and badge triggers.

Primary implementation files:
- `lib/gamification/config.ts`
- `lib/gamification/xp.ts`
- `lib/gamification/streak.ts`
- student gamification APIs under `app/api/student/gamification/*`

## 2) Feature Flags and Eligibility

A child is eligible for XP only if all are true:
1. Global flag enabled: `NEXT_PUBLIC_GAMIFICATION_ENABLED != "false"`
2. Student preference `student_preferences.gamification_on != false`
3. Parent-level disable flag is not enabled (`user_feature_access` with feature `gamification_disabled`)

## 3) XP Action Matrix

| Action Key | XP |
|---|---:|
| `RESEARCH_QUERY` | 10 |
| `ASSIGNMENT_SUBMIT` | 25 |
| `PRACTICE_COMPLETE` | 20 |
| `SCORE_ABOVE_90` | 15 |
| `SCORE_PERFECT` | 25 |
| `PODCAST_GENERATED` | 5 |
| `DAILY_LOGIN` | 10 |
| `STREAK_7_DAY` | 50 |
| `STREAK_30_DAY` | 150 |
| `STREAK_100_DAY` | 500 |

## 4) XP Persistence

- Storage table: `student_xp_log`
- Write path: `awardXP(childId, action, referenceId?)`
- Month partition key: `month_year` in `YYYY-MM` format
- Awarding behavior: fire-and-forget; does not block main request lifecycle

## 5) Level Progression

Configured monthly thresholds:
- Level 1 (Learner): `minXP = 0`
- Level 2 (Explorer): `minXP = 100`
- Level 3 (Scholar): `minXP = 300`
- Level 4 (Champion): `minXP = 600`
- Level 5 (Legend): `minXP = 1000`

Level function:
$$
Level(XP)=\max\{\ell \mid XP \ge minXP_{\ell}\}
$$

Piecewise equivalent:
$$
Level(XP)=
\begin{cases}
1 & 0 \le XP < 100 \\
2 & 100 \le XP < 300 \\
3 & 300 \le XP < 600 \\
4 & 600 \le XP < 1000 \\
5 & XP \ge 1000
\end{cases}
$$

Progress-to-next-level percentage:
$$
Progress\%(XP)=\min\left(100,\;\left\lfloor\frac{XP-minXP_{curr}}{minXP_{next}-minXP_{curr}}\times 100\right\rceil\right)
$$

## 6) Streak Tracking Criteria

### 6.1 Login Streak (authoritative streak)
- Updated by `updateLoginStreak(childId)`.
- Reads/writes streak values in `children` table (`login_streak`, `last_login_date`, `longest_streak`).
- Rules:
  - Same-day login does not increment.
  - If previous login was yesterday, streak increments by 1.
  - Otherwise, streak resets to 1.
- Triggered XP awards:
  - Daily login: `DAILY_LOGIN`
  - Exactly 7 days: `STREAK_7_DAY`
  - Exactly 30 days: `STREAK_30_DAY`
  - Exactly 100 days: `STREAK_100_DAY`

### 6.2 Practice Activity Streak (analytics streak)
- Calculated in `/api/practice/metrics` from consecutive dates with completed attempts.
- Used for practice dashboard metrics; distinct from login streak storage.

## 7) Badge Unlock Thresholds

| Badge ID | Label | Trigger Action | Threshold |
|---|---|---|---:|
| `first_research` | Explorer | `RESEARCH_QUERY` | 1 |
| `research_10` | Curious Mind | `RESEARCH_QUERY` | 10 |
| `assignment_1` | Go-getter | `ASSIGNMENT_SUBMIT` | 1 |
| `assignment_10` | Achiever | `ASSIGNMENT_SUBMIT` | 10 |
| `perfect_score` | Perfectionist | `SCORE_PERFECT` | 1 |
| `streak_7` | On Fire | `STREAK_7_DAY` | 1 |
| `streak_30` | Dedicated | `STREAK_30_DAY` | 1 |
| `practice_10` | Trainer | `PRACTICE_COMPLETE` | 10 |
| `podcast_fan` | Podcast Fan | `PODCAST_GENERATED` | 5 |
| `top_class` | Class Champion | `LEADERBOARD_TOP` | 1 |

Awarding logic:
- On each XP event, `checkBadges` evaluates badges where `badge.trigger === action`.
- Badge is inserted into `student_badges` only when threshold is met and unique key (`childId`, `badgeId`) does not already exist.

## 8) API Surface for Gamification

| Endpoint | Purpose |
|---|---|
| `GET /api/student/gamification/stats` | Returns `monthlyXP`, login `streak`, and feature enabled status |
| `GET /api/student/gamification/badges` | Returns earned badges list |
| `GET /api/student/gamification/leaderboard` | Returns class leaderboard entries by XP |
| `GET/POST /api/student/preferences` | Reads/updates learner gamification display settings |
| `GET/POST /api/parent/preferences` | Parent-level opt-out control for child gamification |

## 9) Operational Notes
- Monthly XP is an aggregate of current month events (`student_xp_log.month_year`).
- Current implementation references a `children` table for streak fields; keep schema alignment validated in migrations.
- Badge/XP writes are non-blocking by design; failures log but do not fail core learning transactions.
