# Buiry — Reference UI / UX Specification
**For stitch generation — design system, page specs, content, and user flows**

> Use this document as the single source of truth for generating Buiry's UI. Every page, component, state, and piece of copy is specified.

---

## 0. Design System

### Brand Identity

| Element | Value |
|---|---|
| Product name | **Buiry** — BUild context memoRY |
| Tagline | "Your agents never forget again." |
| Tone | Confident, technical, clean. Developer-first. No corporate fluff. |
| Visual personality | Terminal-meets-lab-notebook. Dark code aesthetic with warm accent. Precision over decoration. |

### Color Palette

```
Background (dark)    #0D1117    — Primary app background
Background (card)    #161B22    — Card, panel, sidebar background
Background (elevated) #1C2128   — Modal, dropdown, hover states
Border               #30363D    — Subtle borders, dividers
Border (focus)       #58A6FF    — Focus ring, active element border

Text (primary)       #E6EDF3    — Body copy, labels
Text (secondary)     #8B949E    — Descriptions, metadata, timestamps
Text (muted)         #484F58    — Placeholders, disabled text

Accent (blue)        #58A6FF    — Primary actions, links, active states
Accent (green)       #3FB950    — Success, completed, healthy
Accent (amber)       #D29922    — Warnings, in-progress, attention
Accent (red)         #F85149    — Errors, blocked, critical issues
Accent (purple)      #BC8CFF    — Dataset-related, agent activity, insights
Accent (teal)        #39D2C0    — Memory recall, context search results

Gradient (hero)      #58A6FF → #BC8CFF  — Logo, hero sections, primary CTA backgrounds
```

### Typography

| Usage | Font | Size | Weight |
|---|---|---|---|
| Page titles | Inter / system-ui | 24px | 600 |
| Section headers | Inter / system-ui | 16px | 600 |
| Card titles | Inter / system-ui | 14px | 600 |
| Body text | Inter / system-ui | 14px | 400 |
| Metadata / captions | JetBrains Mono | 12px | 400 |
| Code / IDs / hashes | JetBrains Mono | 13px | 400 |
| Session IDs, blob CIDs | JetBrains Mono | 11px | 400 |
| Navigation items | Inter / system-ui | 14px | 500 |
| Button labels | Inter / system-ui | 14px | 500 |

### Spacing Scale

```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
3xl: 64px
```

### Icon Set
Use `@primer/octicons` or Lucide icons. 16px for inline, 20px for standalone indicators. Consistent stroke width 2px.

---

## 1. Layout Structure

### Global Shell

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Buiry logo]                                [🔔] [avatar] [⚙]      │  ← Top Bar (48px)
├───────────┬──────────────────────────────────────────────────────────┤
│           │                                                           │
│  NAV      │                    CONTENT AREA                          │
│           │                                                           │
│  ─────    │                                                           │
│  Dashboard│                                                           │
│  Sessions │                                                           │
│  Datasets │                                                           │
│  Market   │                                                           │
│  Docs     │                                                           │
│  Settings │                                                           │
│           │                                                           │
│  ─────    │                                                           │
│  Project  │                                                           │
│  buiry    │                                                           │
│  v0.1.0   │                                                           │
│  Active   │                                                           │
│           │                                                           │
└───────────┴──────────────────────────────────────────────────────────┘
```

**Top Bar contents:**
- Left: Buiry logo (gradient icon + "Buiry" wordmark in Inter 600)
- Right: Notification bell with badge count, user avatar (circle, 32px), settings gear
- Bottom border: 1px `#30363D`

**Sidebar (240px):**
- Navigation items with icons, 8px left padding, 40px height
- Active item: `#1C2128` background, `#58A6FF` left border (3px), white text
- Inactive item: transparent, `#8B949E` text, hover → `#161B22` background
- Separator line before project info section
- Bottom project card: project name, version badge, status dot (green pulse), session count

### Responsive Note
Desktop-first (1440px baseline). Sidebar collapses to icon-only at <1024px. Mobile: bottom tab bar.

---

## 2. Dashboard Page — `/dashboard`

**Purpose:** Developer lands here. Sees project health at a glance, picks up where they left off.

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  Dashboard                                              Last updated │
│  Welcome back. Here's where you left off.               2 min ago    │
│                                                                       │
│  ┌─────────────────────────┐ ┌──────────────────┐ ┌────────────────┐│
│  │  Current Phase           │ │  Open Issues     │ │  Active Agents ││
│  │                          │ │                  │ │                ││
│  │  Phase 2: MCP Server    │ │  3 open          │ │  2 connected   ││
│  │  ━━━━━━━━━━━━━━░░░ 65%  │ │  2 high          │ │  Claude Code   ││
│  │  Next: Schema validator  │ │  1 in progress   │ │  Cursor        ││
│  └─────────────────────────┘ └──────────────────┘ └────────────────┘│
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │  Continue Where You Left Off                          [Resume →] ││
│  │                                                                   ││
│  │  Session #47  •  2 hours ago  •  Claude Code                      ││
│  │  Implementing buiry_end_session schema validation.                ││
│  │  Next step: Add Zod schema for session object validation.         ││
│  │  ⚠ 2 errors encountered, 1 unresolved.                           ││
│  └──────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  ┌──────────────────────────┐ ┌─────────────────────────────────────┐│
│  │  Session Activity        │ │  Recent Decisions                   ││
│  │  (sparkline chart)       │ │                                      ││
│  │  ┊  ┊   ┊┊ ┊┊┊  ┊       │ │  ● Use Zod for validation     2h ago ││
│  │  ┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊     │ │    Reason: Type-safe, co-pilot    ││
│  │  M  T  W  T  F  S  S    │ │    compatible                      ││
│  │                          │ │  ● Append-only session model  5h ago ││
│  │  12 sessions this week   │ │    Reason: Preserve history      ││
│  └──────────────────────────┘ └─────────────────────────────────────┘│
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │  Quick Actions                                                    ││
│  │  [New Session]  [View Sessions]  [Check Issues]  [Generate Docs] ││
│  └──────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### Card Components

**Continue Where You Left Off** (hero card):
- Prominent placement, top of content area
- Shows: session number, timestamp, agent type, last summary, next steps
- Yellow warning icon if unresolved errors exist
- "Resume →" button (blue accent, right-aligned)

**Stat Cards** (3-column row):
- 48px icon in top-left corner, muted `#8B949E`
- Large number + label
- Progress bar only on Current Phase card — gradient fill `#58A6FF → #BC8CFF`
- Issues card: red count badge if >0, green "all clear" if 0

**Session Activity** (sparkline):
- 7-day bar chart, compact (160px wide)
- Bars: `#21262D` fill, active day `#58A6FF`, today `#BC8CFF`
- No axes, no labels — just the bars. Count displayed below.

**Recent Decisions** (list):
- Left border indicators: `#58A6FF` (architecture), `#BC8CFF` (tooling), `#3FB950` (workflow)
- Decision text bold, reason normal below in `#8B949E`
- Relative timestamp right-aligned

### Empty State (first visit)
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│                    🧠  No sessions yet                            │
│                                                                   │
│     Start your first Buiry session to see your project here.     │
│                                                                   │
│              [Start First Session]   [View Setup Guide]           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Session Explorer — `/dashboard/sessions`

**Purpose:** Browse, search, and inspect all past sessions. The project's full memory timeline.

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  Sessions                                          [Export] [Filter] │
│  All 47 sessions — search by keyword, filter by agent or phase       │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 🔍 Search sessions...                     Agent: [All ▼]  Phase:││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  Timeline View                                                        │
│                                                                       │
│  ●  Today                                                            │
│  │  ┌──────────────────────────────────────────────────────────────┐││
│  │  │ #47  Claude Code  •  2h ago  •  Phase 2: MCP Server         │││
│  │  │ Implemented buiry_end_session. Schema validator passing.     │││
│  │  │ 3 changes  •  2 decisions  •  1 error (resolved)             │││
│  │  │ [→ next: Add Zod schema for session validation]             │││
│  │  └──────────────────────────────────────────────────────────────┘││
│  │  ┌──────────────────────────────────────────────────────────────┐││
│  │  │ #46  Cursor  •  5h ago  •  Phase 2: MCP Server              │││
│  │  │ Started implementing session tools. Scaffold complete.       │││
│  │  │ 5 changes  •  1 decision  •  0 errors                       │││
│  │  │ [→ next: Wire validator to end_session tool]               │││
│  │  └──────────────────────────────────────────────────────────────┘││
│  │                                                                    │
│  ●  Yesterday                                                        │
│  │  ┌──────────────────────────────────────────────────────────────┐││
│  │  │ #45  Claude Code  •  28h ago  •  Phase 1: Foundation        │││
│  │  │ ...                                                          │││
│  │  └──────────────────────────────────────────────────────────────┘││
│  │                                                                    │
│  ●  June 28                                                          │
│     ...                                                               │
└──────────────────────────────────────────────────────────────────────┘
```

### Session Card (in timeline)
```
┌──────────────────────────────────────────────────────────────────┐
│ #47  [Claude Code]  2 hours ago   Phase 2: MCP Server            │
│                                                                    │
│ Implementing buiry_end_session tool with full schema validation   │
│ against the v1 JSON schema. Validator passes all test cases.      │
│                                                                    │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Changes Made (3)                                              │ │
│ │  ✓ src/tools/session.ts — Implemented end_session handler     │ │
│ │  ✓ src/validator.ts — Added Zod schema for session objects    │ │
│ │  ✓ src/validator.test.ts — Unit tests for validation rules    │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Decisions (2)                                                 │ │
│ │  ● Use Zod for schema validation                              │ │
│ │    Reason: Type-safe, co-pilot compatible, better errors      │ │
│ │    Alternatives: Joi (heavier), Ajv (less TypeScript friendly)│ │
│ │                                                                │ │
│ │  ● Append-only session model                                  │ │
│ │    Reason: Immutability is core principle                     │ │
│ │    Alternatives: Mutable with versioning (rejected — complex) │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Errors (1 resolved)                                           │ │
│ │  ✓ TypeScript generic inference issue with Zod schema         │ │
│ │    Resolution: Added explicit type annotations to schema def  │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Known Issues (1 open)                                         │ │
│ │  ⚠ High — Validator currently accepts empty file_module_map   │ │
│ │    (should require at least one entry per session)            │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ Next Steps                                                        │
│  1. Add Zod schema for session object validation (carried over)   │
│  2. Wire validator to cloud API endpoint                          │
│  3. Write integration tests for full session lifecycle            │
│                                                                    │
│                                      [View Raw JSON] [Expand ▼]   │
└──────────────────────────────────────────────────────────────────┘
```

### Expand/Collapse Behavior
- Default: collapsed (shows summary + next steps only)
- Click "Expand ▼" → shows Changes, Decisions, Errors, Known Issues sections
- "View Raw JSON" opens modal with syntax-highlighted JSON of the full session object

### Search & Filter
- **Search bar**: Full-text search across session summaries, decisions, file names
- **Agent filter**: Dropdown — All, Claude Code, Cursor, GitHub Copilot, Custom
- **Phase filter**: Dropdown — All, Foundation, MCP Server, Co-pilot Skill, Dataset SDK, Cloud + Marketplace
- **Date range**: Calendar picker for start/end dates
- Results update in real-time as filters change (debounced search)

### Empty State
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│                    📋  No sessions match your filters             │
│                                                                   │
│         Try adjusting your search terms or clearing filters.     │
│                                                                   │
│                        [Clear All Filters]                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Session Detail (Modal/Expanded View)

**Purpose:** Deep dive into a single session. Every field rendered readably.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Session #47                                    [×] [Copy JSON]  │
│  ────────────────────────────────────────────────────────────────│
│                                                                   │
│  Metadata                                                         │
│  ┌──────────────┬───────────────────────────────────────────────┐│
│  │ Timestamp    │ 2026-07-01 14:32:05 UTC                        ││
│  │ AI Agent     │ Claude Code (Anthropic)                        ││
│  │ Phase        │ Phase 2: MCP Server                            ││
│  │ Session ID   │ sess_01j2k...8x4m                              ││
│  └──────────────┴───────────────────────────────────────────────┘│
│                                                                   │
│  Last Session Summary                                             │
│  "Started implementing session tools. Scaffold complete."         │
│                                                                   │
│  Progress                                          ┌────────────┐ │
│  ┌────────────┬─────────────┬──────────────────┐   │ 65%        │ │
│  │ Completed  │ In Progress │ Blocked          │   │ ██████░░   │ │
│  │  12 items  │  3 items    │  1 item          │   └────────────┘ │
│  └────────────┴─────────────┴──────────────────┘                  │
│                                                                   │
│  ── Changes Made (3) ──────────────────────────────────────────   │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ ✓  src/tools/session.ts       │  end_session handler         ││
│  │ ✓  src/validator.ts           │  Zod schema validation       ││
│  │ ✓  src/validator.test.ts      │  Unit tests                  ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ── Decisions (2) ────────────────────────────────────────────    │
│  ●  Use Zod for schema validation                                 │
│     Reason: Type-safe, co-pilot compatible                        │
│     Alternatives: Joi (heavier), Ajv (less TS support)            │
│                                                                   │
│  ●  Append-only session model                                     │
│     Reason: Immutability core principle                           │
│     Alternatives: Mutable with versioning (rejected)              │
│                                                                   │
│  ── Next Steps ───────────────────────────────────────────────    │
│  1. Add Zod schema for session object validation                  │
│  2. Wire validator to cloud API endpoint                          │
│  3. Write integration tests for full session lifecycle            │
│                                                                   │
│  ── Dataset Signals (2 captured) ─────────────────────────────    │
│  ● decision_sequence: "schema-validation-approach"                │
│  ● error_recovery: "typescript-generic-inference"                 │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Copy States
- "Copy JSON" button → copies full session object to clipboard → toast: "Session JSON copied to clipboard"
- Hover on session ID → cursor: pointer → click copies session ID → toast: "Session ID copied"

---

## 5. Context Search — Inline Feature

**Purpose:** Semantic search across all session memory. Available from anywhere via Cmd+K or search bar.

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  Search project memory...                                     │
│  ────────────────────────────────────────────────────────────────│
│                                                                   │
│  Type a question and search across all 47 sessions...             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ "What approach did we choose for auth?"                      ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  Results                                                          │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ 92% match  •  Session #32  •  3 weeks ago                    ││
│  │ "Decided to use JWT with refresh tokens stored in httpOnly    ││
│  │  cookies. Rejected: session-based auth (scaling concerns),    ││
│  │  OAuth-only (adds complexity for MVP)."                      ││
│  │                                                  [Jump to →] ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ 87% match  •  Session #28  •  4 weeks ago                    ││
│  │ "Added auth middleware skeleton. Currently using mock tokens. ││
│  │  Real JWT implementation deferred to M4."                    ││
│  │                                                  [Jump to →] ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ 74% match  •  Session #41  •  1 week ago                     ││
│  │ "Wired up real JWT auth to API. Tokens working. Middleware    ││
│  │  now validates on every /api/* route."                       ││
│  │                                                  [Jump to →] ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### UX Details
- **Cmd+K** or **Ctrl+K** opens search modal from anywhere
- Search is fuzzy/semantic — typed as natural language question
- Results ranked by relevance score (percentage badge)
- Each result shows: excerpt with keywords highlighted, session #, relative timestamp
- "Jump to →" opens that session in the explorer, scrolled to the relevant section
- Empty state: "No results found. Try different keywords."

---

## 6. Dataset Browser — `/datasets`

**Purpose:** View datasets generated from Buiry's Data Agent pipeline.

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  Datasets                                   [Request Generation]     │
│  3 datasets generated from 1,247 interactions                         │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ┌─────────────────────────────────────────────────────────────┐││
│  │ │ 🟢  customer-support-qa-patterns                  v2  •  847 │││
│  │ │     Category: Behavioral Patterns                            │││
│  │ │     Domain: Customer Support                                  │││
│  │ │     Last generated: 2 hours ago                               │││
│  │ │     ┌──────────────────────────────────────────────────┐     │││
│  │ │     │  Privacy Score                                    │     │││
│  │ │     │  ████████████████████████████████████████  98%    │     │││
│  │ │     │  Excellent — no PII detected in any interaction  │     │││
│  │ │     └──────────────────────────────────────────────────┘     │││
│  │ │     Walrus CID: blob_1a2b3c...d4e5f6                         │││
│  │ │     Sui Object: 0x7f8a...9b0c1d                              │││
│  │ │     Format: [JSON] [CSV]   Status: ● Active                  │││
│  │ │     [Download] [View Sample] [List on Marketplace →]         │││
│  │ └─────────────────────────────────────────────────────────────┘││
│  │                                                                  ││
│  │ ┌─────────────────────────────────────────────────────────────┐││
│  │ │ 🟡  error-recovery-patterns                         v1  • 312│││
│  │ │     Category: Error Recovery Patterns                        │││
│  │ │     Domain: Developer Tools                                   │││
│  │ │     Privacy Score: 94% — Good (2 interactions flagged)       │││
│  │ │     [Download] [View Sample] [List on Marketplace →]         │││
│  │ └─────────────────────────────────────────────────────────────┘││
│  │                                                                  ││
│  │ ┌─────────────────────────────────────────────────────────────┐││
│  │ │ 🔴  decision-sequences                               v1 • 88│││
│  │ │     Category: Decision Sequences                             │││
│  │ │     Privacy Score: 76% — Warning                             │││
│  │ │     ⚠ 4 interactions flagged for potential PII              │││
│  │ │     [Review Flagged] [Download]                              │││
│  │ └─────────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### Dataset Card Details
- **Status dot**: 🟢 Active (generating), 🟡 Buffering (<10 interactions), 🔴 Flagged (PII concerns), ⚪ Archived
- **Privacy Score**: Color-coded bar — green >95%, yellow 85-95%, red <85%. Tooltip explains what was flagged.
- **Walrus CID**: Truncated hash in monospace, copy-on-click
- **Sui Object ID**: Truncated, links to Sui explorer (external)
- **Sample count**: Number of interactions aggregated
- **Format badges**: JSON, CSV — clickable download buttons
- **"List on Marketplace →"**: Opens modal to set listing price (in MIST/SUI)

### Empty State
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│                    📊  No datasets yet                            │
│                                                                   │
│     Datasets are automatically generated from captured           │
│     interactions. Enable dataset_capture in your config to       │
│     start building your training data.                           │
│                                                                   │
│                [Enable Dataset Capture]  [View Docs]              │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Marketplace — `/marketplace`

**Purpose:** Browse, purchase, and sell datasets on-chain via Sui.

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  Marketplace                                       [My Listings (2)] │
│  Browse verified datasets — ownership proven on Sui                  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 🔍 Search datasets...       Category: [All ▼]  Sort: [Recent ▼] ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌────────────────┐ │
│  │ 🟢 Behavioral       │ │ 🟢 Decision          │ │ 🟢 Error       │ │
│  │    Patterns         │ │    Sequences        │ │    Recovery    │ │
│  │                     │ │                     │ │                │ │
│  │ Customer Support QA │ │ Agent Decision      │ │ API Error      │ │
│  │ 847 interactions    │ │ Patterns            │ │ Recovery       │ │
│  │ v2                  │ │ 1,240 interactions  │ │ Patterns       │ │
│  │                     │ │ v3                  │ │ 520 inter.     │ │
│  │ Privacy: 98% ████   │ │ Privacy: 99% ████   │ │ Privacy: 97%   │ │
│  │                     │ │                     │ │                │ │
│  │ Price: 0.5 SUI      │ │ Price: 2.0 SUI      │ │ Price: Free    │ │
│  │ Owner: 0x7a3b...    │ │ Owner: 0x9f2e...    │ │ Owner: You     │ │
│  │                     │ │                     │ │                │ │
│  │ [Buy Now]           │ │ [Buy Now]           │ │ [Download]     │ │
│  └─────────────────────┘ └─────────────────────┘ └────────────────┘ │
│                                                                       │
│  ┌─────────────────────┐ ┌─────────────────────┐                     │
│  │ 🟡 Workflow         │ │ 🟡 Domain           │                     │
│  │    Execution        │ │    Knowledge        │                     │
│  │                     │ │                     │                     │
│  │ CI/CD Pipeline      │ │ Legal Tech Q&A      │                     │
│  │ Patterns            │ │ Patterns            │                     │
│  │ 290 interactions    │ │ 156 interactions    │                     │
│  │ v1                  │ │ v1                  │                     │
│  │ Privacy: 91% ███    │ │ Privacy: 88% ██     │                     │
│  │ Price: 1.0 SUI      │ │ Price: 3.5 SUI      │                     │
│  │                     │ │                     │                     │
│  │ [Buy Now]           │ │ [Buy Now]           │                     │
│  └─────────────────────┘ └─────────────────────┘                     │
└──────────────────────────────────────────────────────────────────────┘
```

### Purchase Flow (Modal)
```
┌──────────────────────────────────────────────────────────────────┐
│  Confirm Purchase                                                 │
│                                                                   │
│  Dataset: Customer Support QA Patterns (v2)                       │
│  Price: 0.5 SUI + 0.05 SUI platform fee                           │
│  Total: 0.55 SUI                                                  │
│                                                                   │
│  Revenue split:                                                   │
│  90% → Dataset owner (0x7a3b...c9f2)                             │
│  10% → Buiry platform                                             │
│  Enforced by Sui smart contract — trustless.                      │
│                                                                   │
│                              [Cancel]  [Confirm Purchase with Sui]│
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. Settings Page — `/settings`

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  Settings                                                            │
│                                                                       │
│  ┌─ API Keys ──────────────────────────────────────────────────────┐│
│  │                                                                  ││
│  │  Buiry API Key                                                   ││
│  │  ┌────────────────────────────────────────────────────────────┐ ││
│  │  │  buiry_sk_live_••••••••••••••••••••••••••••••••••••4x8m  │ ││
│  │  └────────────────────────────────────────────────────────────┘ ││
│  │  Created: June 15, 2026    [Regenerate] [Copy]                  ││
│  │                                                                  ││
│  │  Sui Wallet Address                                              ││
│  │  ┌────────────────────────────────────────────────────────────┐ ││
│  │  │  0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6                │ ││
│  │  └────────────────────────────────────────────────────────────┘ ││
│  │  Connected via Sui Wallet    [Disconnect]                        ││
│  └──────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  ┌─ Workspace ─────────────────────────────────────────────────────┐│
│  │                                                                  ││
│  │  Workspace Name                                                  ││
│  │  ┌────────────────────────────────────────────────────────────┐ ││
│  │  │  buiry-core                                                │ ││
│  │  └────────────────────────────────────────────────────────────┘ ││
│  │                                                                  ││
│  │  Data Capture                                          Enabled  ││
│  │  ┌────────────────────────────────────────────────────────────┐ ││
│  │  │  ● Dataset capture is ON. Interactions are being harvested. │ ││
│  │  │  Domain: developer-tools    Threshold: 10 interactions      │ ││
│  │  │  [Configure]                                                │ ││
│  │  └────────────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  ┌─ Co-pilot Integration ──────────────────────────────────────────┐│
│  │                                                                  ││
│  │  Claude Code                                                     ││
│  │  ┌────────────────────────────────────────────────────────────┐ ││
│  │  │  {                                                         │ ││
│  │  │    "mcpServers": {                                         │ ││
│  │  │      "buiry": {                                            │ ││
│  │  │        "command": "npx",                                   │ ││
│  │  │        "args": ["buiry-mcp"],                              │ ││
│  │  │        "env": {                                            │ ││
│  │  │          "BUIRY_API_KEY": "buiry_sk_live_..."              │ ││
│  │  │        }                                                   │ ││
│  │  │      }                                                     │ ││
│  │  │    }                                                       │ ││
│  │  │  }                                                         │ ││
│  │  └────────────────────────────────────────────────────────────┘ ││
│  │  Add to: ~/.claude/settings.json    [Copy Config]               ││
│  │                                                                  ││
│  │  Cursor  •  [View Setup Guide →]                                ││
│  │  GitHub Copilot  •  [View Setup Guide →]                        ││
│  └──────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  ┌─ Billing ───────────────────────────────────────────────────────┐│
│  │                                                                  ││
│  │  Current Plan: Pro                                               ││
│  │  $29/month  •  Next billing: July 15, 2026                      ││
│  │  ┌────────────────────────────────────────────────────────────┐ ││
│  │  │  Sessions: 47/500 (9%)    Storage: 12MB/10GB (<1%)         │ ││
│  │  │  Datasets: 3/unlimited    Team members: 1/5                │ ││
│  │  └────────────────────────────────────────────────────────────┘ ││
│  │  [Upgrade to Enterprise]  [View Billing History]                ││
│  └──────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

---

## 9. Docs Page — `/docs`

**Purpose:** Integration guides, SDK reference, MCP setup. Developer-facing documentation.

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  Documentation                                                       │
│                                                                       │
│  ┌──────────┬──────────────────────────────────────────────────────┐│
│  │          │                                                       ││
│  │ GETTING  │  Getting Started with Buiry                           ││
│  │ STARTED  │                                                       ││
│  │          │  Buiry gives your AI agents persistent memory across  ││
│  │ Overview │  sessions. Here's how to set it up.                   ││
│  │ Quick    │                                                       ││
│  │  Start   │  ── Step 1: Install ──────────────────────────────   ││
│  │          │                                                       ││
│  │ ──────── │  ```bash                                             ││
│  │          │  # For the MCP server (Claude Code, Cursor, Copilot) ││
│  │ MCP      │  npx buiry-mcp                                       ││
│  │ SERVER   │                                                       ││
│  │          │  # Or install globally                                ││
│  │ Claude   │  npm install -g buiry-mcp                            ││
│  │  Code    │  ```                                                  ││
│  │ Cursor   │                                                       ││
│  │ Copilot  │  ── Step 2: Configure ─────────────────────────────  ││
│  │          │  ...                                                  ││
│  │ ──────── │                                                       ││
│  │          │  ── Step 3: Start a Session ──────────────────────── ││
│  │ SDK      │  ...                                                  ││
│  │          │                                                       ││
│  │ Type-    │                                                       ││
│  │  Script  │                                                       ││
│  │ Python   │                                                       ││
│  │          │                                                       ││
│  │ ──────── │                                                       ││
│  │          │                                                       ││
│  │ API      │                                                       ││
│  │ REF      │                                                       ││
│  │          │                                                       ││
│  └──────────┴──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### Docs Nav Structure
```
Getting Started
  ├── Overview
  ├── Quick Start
  └── Project Structure
MCP Server
  ├── Claude Code Setup
  ├── Cursor Setup
  ├── GitHub Copilot Setup
  └── Tool Reference
SDK
  ├── TypeScript
  │   ├── Installation
  │   ├── Quick Start
  │   ├── API Reference
  │   └── Adapters (Anthropic, OpenAI, Generic)
  └── Python
      ├── Installation
      ├── Quick Start
      └── API Reference
API Reference
  ├── Authentication
  ├── Sessions API
  ├── Datasets API
  └── Marketplace API
```

---

## 10. Notification Center (Dropdown)

```
┌──────────────────────────────────────────────────────────────────┐
│  Notifications                                   [Mark all read] │
│  ────────────────────────────────────────────────────────────────│
│                                                                   │
│  ●  New dataset generated                          2 hours ago   │
│     "customer-support-qa-patterns" v2 — 847 interactions         │
│     Privacy score: 98%. Ready to list on marketplace.            │
│                                                                   │
│  ●  Session #47 completed                          3 hours ago   │
│     Claude Code ended session. 3 changes, 2 decisions.           │
│                                                                   │
│  ○  PII flagged in dataset                          1 day ago    │
│     "decision-sequences" — 4 interactions flagged.               │
│     [Review Flagged Interactions →]                               │
│                                                                   │
│  ○  Buiry v1.2.0 available                          2 days ago   │
│     New: Semantic search via MemWal recall. [View changelog →]   │
│                                                                   │
│  ○  Workspace member joined                         3 days ago   │
│     @alex added to buiry-core workspace.                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 11. Onboarding Flow (First-Time User)

**Purpose:** Get developer from zero to working Buiry setup in <5 minutes.

### Step 1 — Welcome
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│                        🧠  Welcome to Buiry                       │
│                                                                   │
│     Persistent memory for your AI agents. Never lose context     │
│     between sessions again.                                       │
│                                                                   │
│     ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│     │   Connect   │   │   Build     │   │   Harvest   │          │
│     │  your AI    │ → │  with full  │ → │  training   │          │
│     │   agents    │   │   context   │   │   data      │          │
│     └─────────────┘   └─────────────┘   └─────────────┘          │
│                                                                   │
│                          [Get Started →]                           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Step 2 — Create Project
```
┌──────────────────────────────────────────────────────────────────┐
│  Create Your First Project                                        │
│                                                                   │
│  Project Name                                                     │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  my-ai-project                                                ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  Tech Stack (comma-separated)                                     │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  TypeScript, React, Node.js                                   ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  Description                                                      │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  An AI-powered chatbot for customer support.                  ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  [← Back]                                        [Create Project] │
└──────────────────────────────────────────────────────────────────┘
```

### Step 3 — Connect Your AI Agent
```
┌──────────────────────────────────────────────────────────────────┐
│  Connect Your AI Agent    (1 of 3)                                 │
│                                                                   │
│  Select your AI tool:                                             │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │ Claude Code │  │   Cursor    │  │   GitHub    │               │
│  │             │  │             │  │   Copilot   │               │
│  │  [Connect]  │  │  [Connect]  │  │  [Connect]  │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Manual Setup (works with ANY AI tool)                      │ │
│  │                                                              │ │
│  │  Copy these two files into your project root:               │ │
│  │  • AI_Starter.md — AI agent behavior rules                  │ │
│  │  • Build-Context-Memory.json — Session memory               │ │
│  │                                                              │ │
│  │  [Download Both Files]                                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  [← Back]                                            [Continue →] │
└──────────────────────────────────────────────────────────────────┘
```

---

## 12. Demo-Specific UI Elements

These are the screens that appear in the hackathon video demo.

### Demo Screen 1 — Before Buiry (Pain Point)
```
┌──────────────────────────────────────────────────────────────────┐
│  Agent Chat (Without Buiry)                                       │
│                                                                   │
│  Developer: "Let's continue building the API server"              │
│                                                                   │
│  Agent: "I don't have any context about this project.            │
│          What are we building? What's the tech stack?             │
│          What was the last thing we worked on?"                   │
│                                                                   │
│  Developer: *pastes project info manually*                        │
│                                                                   │
│  Agent: "I'll start implementing the auth module."               │
│                                                                   │
│  Developer: "We already decided to use JWT in the last session.  │
│              You should know that already."                       │
└──────────────────────────────────────────────────────────────────┘
```

### Demo Screen 2 — Buiry Start Session (The Fix)
```
┌──────────────────────────────────────────────────────────────────┐
│  buiry_start_session                                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  Project: buiry-core                    Phase: MCP Server     ││
│  │  Status: Active      Sessions completed: 47                  ││
│  │  Open issues: 3 (2 high, 1 medium)                            ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  Last Session (#47) — Claude Code, 2 hours ago                    │
│  "Implementing buiry_end_session with schema validation."         │
│                                                                   │
│  Next Steps:                                                      │
│  1. Add Zod schema for session object validation ← PICK UP HERE  │
│  2. Wire validator to cloud API endpoint                         │
│  3. Write integration tests for full session lifecycle            │
│                                                                   │
│  Recent Decisions:                                                │
│  ● Use Zod for validation (Session #47)                           │
│  ● Append-only session model (Session #47)                       │
│  ● JWT with httpOnly cookies for auth (Session #32)              │
│                                                                   │
│  Known Issues:                                                    │
│  ⚠ Validator accepts empty file_module_map (High, open)          │
│                                                                   │
│  Context ready. Resuming from Session #47.                        │
└──────────────────────────────────────────────────────────────────┘
```

### Demo Screen 3 — Agent Context Search in Action
```
┌──────────────────────────────────────────────────────────────────┐
│  buiry_get_context                                                │
│  Query: "What auth approach did we decide on?"                    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ 92% match  •  Session #32  •  June 22, 2026                  ││
│  │ "Decided to use JWT with refresh tokens stored in httpOnly    ││
│  │  cookies. Rejected: session-based auth (scaling concerns),    ││
│  │  OAuth-only (adds complexity for MVP)."                      ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  Agent now knows: Use JWT + httpOnly cookies.                     │
│  Implements correctly without asking developer.                   │
└──────────────────────────────────────────────────────────────────┘
```

### Demo Screen 4 — PII Stripping
```
┌──────────────────────────────────────────────────────────────────┐
│  Data Agent — Privacy Pass                                        │
│                                                                   │
│  Raw Interaction:                                                 │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ {                                                             ││
│  │   "prompt": "Reset password for john@example.com",            ││
│  │   "response": "Password reset link sent to j***@e******.com", ││
│  │   "user_id": "usr_8a3f2c1b"                                   ││
│  │ }                                                              ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│         ↓ Privacy Pass (regex + NER)                              │
│                                                                   │
│  Sanitized Interaction:                                           │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ {                                                             ││
│  │   "prompt": "Reset password for [REDACTED_EMAIL]",            ││
│  │   "response": "Password reset link sent to [REDACTED_EMAIL]", ││
│  │   "user_id": "hash_9f8e7d6c"                                  ││
│  │ }                                                              ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ● PII stripped: 1 email address, 1 user ID                      │
│  ● Privacy score: 100% — safe to store                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 13. Component Library

All reusable UI components. Use these as building blocks.

| Component | Description | States |
|---|---|---|
| **Stat Card** | Icon + number + label. Optional progress bar. | Default, Loading (skeleton), Empty (--), Warning (issue count > 0) |
| **Session Card** | Collapsed/expanded session view in timeline | Collapsed, Expanded, Active (current session highlight) |
| **Dataset Card** | Dataset summary with privacy score bar | Active, Buffering, Flagged, Archived |
| **Marketplace Card** | Dataset listing with price, owner, privacy score | Listed, Purchased (disabled), Own (free download) |
| **Search Bar** | Full-text or semantic search input | Default, Focused, Loading (spinner), Results, No Results |
| **Privacy Score Bar** | Horizontal bar, color-graded | Excellent (>95% green), Good (85-95% yellow), Warning (<85% red) |
| **Status Dot** | 8px circle with color | Active (green pulse), Buffering (amber pulse), Flagged (red static), Inactive (gray) |
| **Copy Button** | Copies text to clipboard with toast feedback | Default, Copied (checkmark + "Copied!" toast) |
| **Progress Bar** | Phase progress indicator | Empty (0%), Partial (gradient fill), Complete (100% green) |
| **Timeline Entry** | Session in chronological timeline view | Default, Hover (bg highlight), Active (blue left border) |
| **Toast Notification** | Bottom-right transient message | Success (green), Error (red), Info (blue), Warning (amber) |
| **Modal** | Centered overlay for detail views | Default, Loading |
| **Empty State** | Centered illustration + CTA when no data exists | No sessions, No datasets, No search results |
| **Code Block** | Syntax-highlighted code display (config snippets, JSON) | Default, With copy button |
| **Agent Badge** | Tag showing which AI tool | Claude Code (orange), Cursor (blue), Copilot (green), Custom (purple) |
| **Severity Badge** | Issue severity indicator | Low (gray), Medium (amber), High (red) |
| **Filter Bar** | Horizontal filter controls (dropdowns, date picker) | Default, Active (showing count of applied filters) |

---

## 14. User Flows

### Flow 1: Developer Opens Dashboard (Returning User)
```
Login → Dashboard loads
  → Sees "Continue Where You Left Off" card with last session
  → Clicks "Resume"
  → AI agent receives buiry_start_session context
  → Developer starts working immediately
```
Time target: <5 seconds from login to context.

### Flow 2: Developer Searches for Past Decision
```
Any page → Cmd+K
  → Types "what approach did we take for auth?"
  → Semantic search returns ranked results
  → Clicks "Jump to" on top result
  → Session #32 detail opens, scrolled to decisions section
  → Developer reads decision, closes
```
Time target: <10 seconds from Cmd+K to answer.

### Flow 3: Dataset Purchase
```
Marketplace → Browse datasets
  → Click dataset card → Detail modal opens
  → See privacy score, sample count, preview
  → Click "Buy Now" → Confirm modal with Sui fee breakdown
  → Approve Sui wallet transaction
  → Transaction confirmed → Dataset available in "My Datasets"
  → Revenue split automatically executed by Sui contract
```

### Flow 4: New Project Onboarding
```
Welcome screen → "Get Started"
  → Enter project name, stack, description
  → Select AI tool (Claude Code / Cursor / Copilot)
  → See integration instructions (config snippet to copy)
  → Download AI_Starter.md + Build-Context-Memory.json
  → "Start First Session" → Dashboard with empty state
  → Developer pastes starter prompt to AI agent
  → Agent reads files, begins working, logs session
  → Dashboard populates with first session card
```

### Flow 5: Issue Resolution
```
Dashboard → "Open Issues: 3" card
  → Click → Session Explorer filtered to sessions with open issues
  → Click session with high-severity issue
  → Read issue description and context
  → Developer fixes issue in code
  → Next session: agent calls buiry_flag_issue with status="resolved"
  → Issue badge updates from red to green
  → Dashboard count decrements
```

---

## 15. Content & Copy Guidelines

### Voice & Tone
- **Developer-first**: Write like a senior engineer talking to a peer. No marketing fluff.
- **Confident but honest**: Say what it does. Don't oversell. Trust the product.
- **Action-oriented**: Labels say what happens. "Start Session" not "Session Initiation".
- **Error messages are helpful**: State what happened, why, and what to do next.

### Key Copy Snippets

**Tagline**: "Your agents never forget again."

**Hero description**: "Buiry gives your AI agents persistent memory across sessions and tools. Start every session exactly where you left off. No manual context pasting. No lost decisions. Just continuous, intelligent building."

**Value proposition (3-up)**:
1. **Never lose context** — Every session picks up where the last one ended. Full decision history, file maps, error logs, and next steps — automatically.
2. **Works with any AI tool** — Claude Code, Cursor, GitHub Copilot. One setup. Consistent memory across all of them.
3. **Harvest training data** — Real-world AI interactions become verifiable, privacy-safe datasets you own. Listed and traded on-chain.

**Setup prompt (for AI agents)**: "You are connected to Buiry. Call `buiry_start_session` with projectId to receive full context from the last session — including decisions, file changes, errors, and next steps. Never ask 'what are we building?' again."

**Error — session validation failed**: "Session rejected. `next_steps` must not be empty. The next agent needs to know where to start. Add at least one next step and try again."

**Error — immutability violation**: "Session rejected. Old sessions cannot be modified. Create a new session object instead. This preserves your full build history."

**Empty — no datasets**: "No datasets yet. Datasets are automatically generated from captured AI interactions. Enable `dataset_capture` in your config to start building your training data library."

**Privacy score tooltip — 98%**: "98 out of 100 interactions passed PII checks. 2 interactions were flagged and sanitized before storage. No raw user data exists in this dataset."

---

## 16. States & Edge Cases

| Component | Edge Case | Handling |
|---|---|---|
| Dashboard | No sessions ever | Empty state with "Start First Session" CTA |
| Dashboard | 500+ sessions | Paginate "Recent Decisions" to 10, "View All →" link |
| Dashboard | All issues resolved | "All clear! No open issues." green message |
| Session Explorer | 0 results from filter | "No sessions match. Try different filters." with clear button |
| Session Explorer | Session with >20 file changes | Truncate to 10 with "Show all 20 files" expander |
| Context Search | Query returns 0 results | "No results for '[query]'. Try different keywords." |
| Context Search | Query is empty | Show recent/popular searches as suggestions |
| Dataset Card | Privacy score < 80% | Red bar + warning icon + "Review before sharing" tooltip |
| Dataset Card | Downloaded >100 times | "Popular" badge on card |
| Marketplace | Dataset sold out / delisted | Greyed out card with "Unavailable" badge |
| Marketplace | Wallet not connected | "Connect Sui Wallet to purchase" CTA instead of "Buy Now" |
| Settings | API key regenerated | Warning modal: "All existing sessions using old key will fail. Update your config." |
| Settings | Billing overdue | Red banner at top: "Your subscription is past due. Update payment to continue." |
| Onboarding | User skips steps | Save partial progress. "You can finish setup later in Settings." |
| All pages | Network error | Toast: "Connection lost. Retrying..." with spinner |
| All pages | Rate limited | Toast: "Too many requests. Try again in 30 seconds." |

---

## 17. Accessibility Notes

- All interactive elements are keyboard-navigable (Tab, Enter, Escape)
- Focus rings visible on all inputs and buttons (`#58A6FF` 2px ring)
- Color is never the only indicator — icons and text labels always accompany status colors
- Screen reader labels on all icon-only buttons (aria-label)
- Skip-to-content link in top bar (visible on focus)
- Minimum contrast ratio 4.5:1 for all text
- Modal focus trap — Esc to close, focus returns to trigger element

---

*UI-UX-Reference.md — generated 2026-07-01*
*Feed this to stitch for a complete, buildable UI.*
