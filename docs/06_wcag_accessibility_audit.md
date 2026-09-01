# WCAG 2.1 AA Accessibility Audit

Scope sampled from student, teacher, gamification, and podcast UX components.

## 1) Summary

| Area | Status | Notes |
|---|---|---|
| Semantic structure and landmarks | Partial Pass | Many sections/navs use labels; still some generic `div` wrappers around major page regions |
| Keyboard accessibility | Partial Pass | Most interactive controls are buttons/links with focus styles; modal-like podcast QA panel has no strict focus trap |
| Color contrast | Partial Pass | Dark/light tokens exist broadly; targeted contrast testing still required for all branded states |
| ARIA naming and state | Pass with issues | Strong usage of `aria-label`, `aria-live`, `aria-pressed`; a few malformed label strings include replacement characters |
| Non-text content | Partial Pass | Decorative icons often hidden; charts represented as `role="img"` labels but detailed data table alternatives are limited |

## 2) Checklist (WCAG 2.1 AA)

### 2.1 Perceivable

| Check | Status | Evidence |
|---|---|---|
| 1.1.1 Non-text content has text alternatives | Partial | Icons/images often use `aria-hidden` or nearby text; chart-only views may need fuller tabular fallback |
| 1.3.1 Info and relationships | Partial | Tables and labeled sections are present in teacher and practice pages |
| 1.4.3 Contrast (minimum) | Partial | Utility classes indicate intent; automated contrast run (axe/Lighthouse) not yet recorded |
| 1.4.10 Reflow | Likely Pass | Responsive Tailwind grids and mobile-aware layout patterns present |

### 2.2 Operable

| Check | Status | Evidence |
|---|---|---|
| 2.1.1 Keyboard | Partial Pass | Action controls use native elements; Enter handling present in podcast QA text input |
| 2.1.2 No keyboard trap | Partial | No explicit trap detected; podcast dialog is non-modal (`aria-modal=false`) and does not enforce scoped tab loop |
| 2.4.1 Bypass blocks | Pass | Root layout includes skip-to-content link |
| 2.4.3 Focus order | Partial Pass | Logical DOM ordering appears consistent; full keyboard walkthrough still required |
| 2.4.7 Focus visible | Pass | Common use of `focus-visible:ring-*` on interactive controls |

### 2.3 Understandable

| Check | Status | Evidence |
|---|---|---|
| 3.2.2 On input predictable behavior | Pass | Inputs do not auto-trigger major context changes unexpectedly |
| 3.3.1 Error identification | Partial | API errors surfaced in UI, but form-level field-specific messaging is inconsistent |

### 2.4 Robust

| Check | Status | Evidence |
|---|---|---|
| 4.1.2 Name, role, value | Pass with issues | Rich ARIA usage in navs/menus/charts/controls; some malformed aria text detected in practice page labels |
| 4.1.3 Status messages | Pass | Podcast generation and QA states use `role="status"` and `aria-live` |

## 3) Dynamic Widget Findings

### 3.1 TTS / Podcast Player
- Strengths:
  - Play/pause, speed, seek, and interrupt controls have accessible names.
  - Uses status announcements for generating/thinking states.
  - Uses `aria-pressed` for toggle-like controls.
- Gaps:
  - QA panel acts like a dialog without explicit focus trap or Escape-key close convention enforcement.
  - Consider `aria-describedby` for current segment and playback time context.

### 3.2 Streak Flame Widget
- Strengths:
  - Explicit `aria-label` for streak value.
  - Loading skeleton marked `aria-hidden`.
- Gaps:
  - Emoji-based visual indicator should always be paired with clear text (already mostly true).

### 3.3 Metric Cards
- Strengths:
  - Section labels and readable card titles.
  - Numeric values are textual, not image-only.
- Gaps:
  - Ensure all metric cards provide explicit context for screen readers when values update asynchronously.
  - Some chart labels contain encoding artifacts (`�`) and should be normalized.

## 4) Priority Remediation List

| Priority | Issue | Recommendation |
|---|---|---|
| High | Non-modal dialog behavior for podcast QA panel may cause inconsistent keyboard traversal | Implement focus management (initial focus, cycle, restore focus on close, Escape to close) |
| High | Malformed ARIA label strings with replacement characters | Clean and normalize all aria-label text literals |
| Medium | No documented contrast test evidence | Add CI accessibility checks (axe/Lighthouse) and store results per release |
| Medium | Chart accessibility depends mostly on aria labels | Provide data-table fallback or downloadable accessible summaries |
| Low | Inconsistent field-level validation narration | Add `aria-describedby` and inline error IDs for forms |

## 5) Recommended Test Protocol

1. Run keyboard-only navigation for student, teacher, parent, and admin key screens.
2. Run NVDA/JAWS smoke tests on podcast, practice metrics, and assignment flows.
3. Run Lighthouse + axe for representative pages in light and dark modes.
4. Track and fix issues before release cut.
