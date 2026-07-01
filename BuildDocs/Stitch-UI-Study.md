# Buiry — Stitch UI/UX Study
**Complete analysis of the generated Stitch designs for implementation**

> Source: Stitch project `845930825510590825` — Buiry Agent Memory Platform
> 11 screens, dark + light themes, full HTML code + screenshots

---

## 0. Design System (from Stitch HTML code — exact tokens)

> **IMPORTANT**: Stitch generated TWO distinct design systems. Dark theme uses Inter. Light theme uses Geist. Both use JetBrains Mono for code/labels. The Tailwind config names follow Material Design 3 conventions (not our original spec).

### Dark Theme — Exact Tailwind Config (from HTML source)

**Colors (MD3 naming convention):**
```
background:              #10141a    Main app canvas
surface:                 #10141a    Same as background
surface-dim:             #10141a
surface-bright:          #353940
surface-card:            #161B22    Card backgrounds (GitHub dark)
surface-elevated:        #1C2128    Hover states, modals
surface-container:       #1c2026
surface-container-low:   #181c22
surface-container-high:  #262a31
surface-container-highest: #31353c
surface-container-lowest: #0a0e14
surface-variant:         #31353c

border-subtle:           #30363D    All borders
outline:                 #8b919d
outline-variant:         #414752

text-primary:            #E6EDF3    Body copy
text-secondary:          #8B949E    Metadata, timestamps

primary:                 #a2c9ff    Primary text color
primary-container:       #58a6ff    Primary buttons, CTAs, links
on-primary:              #00315c
on-primary-container:    #003a6b
primary-fixed:           #d3e4ff
primary-fixed-dim:       #a2c9ff
inverse-primary:         #0060aa

secondary:               #d8baff    Purple accent
secondary-container:     #5d2d9c    Active nav item bg
on-secondary:            #430882
on-secondary-container:  #cda8ff

tertiary:                #47dcca    Teal accent
tertiary-container:      #00b7a6
on-tertiary:             #003731
on-tertiary-container:   #00413a

status-success:          #3FB950    Green
status-warning:          #D29922    Amber
status-error:            #F85149    Red
error:                   #ffb4ab
error-container:         #93000a
on-error:                #690005
on-error-container:      #ffdad6

inverse-surface:         #dfe2eb
inverse-on-surface:      #2d3137
```

**Typography (Dark theme uses Inter):**
```
fontFamily:
  headline-lg:    ["Inter"]
  headline-md:    ["Inter"]
  section-header: ["Inter"]
  body-base:      ["Inter"]
  nav-link:       ["Inter"]
  meta-mono:      ["JetBrains Mono"]     ← labels, tags, IDs
  technical-id:   ["JetBrains Mono"]     ← session IDs, hashes
  code-sm:        ["JetBrains Mono"]     ← code blocks

fontSize:
  headline-lg:    24px / 32px / 600
  headline-md:    18px / 24px / 600
  section-header: 16px / 20px / 600
  body-base:      14px / 20px / 400
  nav-link:       14px / 20px / 500
  meta-mono:      12px / 16px / 400
  technical-id:   11px / 14px / 400
  code-sm:        13px / 18px / 400
```

**Spacing:**
```
xs:  4px      sm:  8px      md:  16px
lg:  24px     xl:  32px     gutter: 16px
sidebar-width: 240px    topbar-height: 48px
```

**Border Radius:**
```
DEFAULT: 0.125rem (2px)
lg:      0.25rem  (4px)
xl:      0.5rem   (8px)
full:    0.75rem  (12px)
```

### Light Theme — Exact Tailwind Config (from HTML source)

**Colors:**
```
background:              #f8f9fb
surface:                 #f8f9fb
surface-dim:             #d8dadc
surface-bright:          #f8f9fb
surface-container-lowest: #ffffff
surface-container-low:   #f2f4f6
surface-container:       #eceef0
surface-container-high:  #e6e8ea
surface-container-highest: #e0e3e5
surface-variant:         #e0e3e5

border-subtle:           #d0d7de
outline:                 #727785
outline-variant:         #c2c6d6

text-primary / on-surface:      #191c1e
text-secondary / on-surface-variant: #424753

primary:                 #0051ae
primary-container:       #0969da
on-primary:              #ffffff
on-primary-container:    #ecefff
primary-fixed:           #d8e2ff
primary-fixed-dim:       #adc6ff

secondary:               #5b5f64
secondary-container:     #dde0e6
on-secondary:            #ffffff
on-secondary-container:  #5f6369

tertiary:                #4f565c
tertiary-container:      #676e74

status-success:          #3FB950
status-warning:          #D29922
status-error:            #F85149 (dark) / #ba1a1a (light)
error:                   #ba1a1a
error-container:         #ffdad6

inverse-surface:         #2d3133
inverse-on-surface:      #eff13
```

**Typography (Light theme uses Geist):**
```
fontFamily:
  display-lg:     ["Geist"]
  headline-md:    ["Geist"]
  headline-sm:    ["Geist"]
  body-lg:        ["Geist"]
  body-md:        ["Geist"]
  body-sm:        ["Geist"]
  label-md:       ["JetBrains Mono"]     ← labels, tags, IDs
  code-md:        ["JetBrains Mono"]     ← code blocks

fontSize:
  display-lg:     32px / 40px / 600 / -0.02em
  headline-md:    24px / 32px / 600
  headline-sm:    20px / 26px / 600
  body-lg:        16px / 24px / 400
  body-md:        14px / 21px / 400
  body-sm:        12px / 18px / 400
  label-md:       12px / 12px / 500 / 0.02em
  code-md:        13px / 21px / 400
```

### Spacing

```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
gutter: 16px
container-max: 1280px
```

### Border Radius

```
Default: 0.125rem (2px)
lg:      0.25rem (4px)
xl:      0.5rem (8px)
full:    0.75rem (12px)
```

### Icons
Material Symbols Outlined. FILL variant for active/selected states.

---

## 1. Global Layout Shell

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo] Project Name     breadcrumb        search  bell  gear  avatar │  ← 48px top bar
├───────────┬──────────────────────────────────────────────────┤
│           │                                                   │
│  SIDEBAR  │                  CONTENT AREA                     │
│  240px    │                                                   │
│           │                                                   │
│  [icon] Dashboard                                               │
│  [icon] Sessions                                                │
│  [icon] Datasets                                                │
│  [icon] Market                                                  │
│  [icon] Docs                                                    │
│  [icon] Settings                                                │
│           │                                                   │
│  ─────    │                                                   │
│  [Deploy New Agent]   ← primary CTA button                    │
│  [Help]                                                           │
│  [Profile]                                                        │
│           │                                                   │
└───────────┴──────────────────────────────────────────────────┘
```

### Sidebar Rules
- Width: 240px fixed, collapses to icon-only at <1024px
- Active item: `bg-secondary-container` (light) or highlighted background, bold text, colored icon
- Inherit items: transparent, `text-on-surface-variant`, hover → `bg-surface-variant`
- Brand header: logo icon (8x8, rounded, primary bg) + project name + version badge
- Bottom: Deploy New Agent button (primary bg, full width), then Help/Profile links
- Border-right: 1px solid border color

### Top Bar Rules
- Height: 48px
- Left: Project name (bold, primary) + breadcrumb separator + current page
- Right: Search input (rounded, bordered), notification bell, settings gear, user avatar (32px circle)
- Border-bottom: 1px solid border color

---

## 2. Dashboard Screen

**Route:** `/dashboard`
**Purpose:** Project health at a glance, pick up where you left off

### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  Hero Banner: "Find Your Next Contribution"                  │
│  Tagline + system status indicator                           │
│                                                               │
│  ┌─────────────────────────┐ ┌──────────────────────────────┐│
│  │  Active Session Card     │ │  Live Activity Feed           ││
│  │  Session #47: Claude Code│ │  (recent activity items)     ││
│  │  [Resume Work] [History] │ │                              ││
│  └─────────────────────────┘ └──────────────────────────────┘│
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│  │ Current Phase │ │ Open Issues  │ │ Active Agents        │  │
│  │ Phase 2: MCP  │ │ 3 total      │ │ (avatar stack)       │  │
│  │ [progress bar]│ │              │ │ [load bar]           │  │
│  └──────────────┘ └──────────────┘ └──────────────────────┘  │
│                                                               │
│  ┌──────────────────────────┐ ┌─────────────────────────────┐│
│  │  Session Activity Chart   │ │  Recent Decisions           ││
│  │  (bar chart, 7-day)       │ │  (list with timestamps)     ││
│  └──────────────────────────┘ └─────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### Components

**Hero Banner:**
- Gradient background (primary → secondary)
- Large headline: "Find Your Next Contribution"
- Subtitle: project description
- System status badge (green dot + "SYSTEM OPERATIONAL")

**Active Session Card:**
- Badge: "ACTIVE SESSION" (green bg)
- Session title + agent name
- Summary text
- Two buttons: "Resume Work" (primary), "View History" (outline)

**Live Activity Feed:**
- List of recent activity items
- Each: avatar, description, timestamp
- Scrollable, max-height constrained

**Stat Cards (3-column):**
- Icon in top-left
- Large number + label
- Progress bar on Current Phase card
- Status indicators (green/amber/red dots)

**Session Activity Chart:**
- 7-day bar chart
- Bars: filled for active days, muted for inactive
- Y-axis: session count

**Recent Decisions:**
- List items with decision ID (monospace), description, timestamp
- "View Decision Log →" link at bottom

---

## 3. Session Explorer Screen

**Route:** `/dashboard/sessions`
**Purpose:** Browse and inspect all past sessions

### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  Header: "Session Explorer" + description                    │
│  [Filters] [Last 24 Hours] [Export Logs]                     │
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────┐│
│  │ Active Sessions│ │ Avg Duration │ │ Token    │ │ Success  ││
│  │ 12 (+8%)     │ │ 4.2m (-0.4s) │ │ Usage    │ │ Rate     ││
│  │              │ │              │ │ 84.2k    │ │ 99.4%    ││
│  └──────────────┘ └──────────────┘ └──────────┘ └──────────┘│
│                                                               │
│  ┌─────────────────────┐ ┌──────────────────────────────────┐│
│  │  Activity Feed       │ │  Detail View                      ││
│  │  (timeline sidebar)  │ │  (expandable step cards)          ││
│  │                      │ │                                   ││
│  │  ● SESS-8921 Running │ │  Deployment Agent Alpha           ││
│  │  ○ SESS-8919 Done    │ │  Step 1: ✓ Initialize Git        ││
│  │  ✗ SESS-8918 Failed  │ │  Step 2: ✓ Install Deps          ││
│  │                      │ │  Step 3: ⟳ Run Tests (active)    ││
│  │                      │ │  Step 4: ○ Build Assets (pending) ││
│  └─────────────────────┘ └──────────────────────────────────┘│
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  System Resource Usage (Live)                             ││
│  │  CPU: 42%  MEM: 1.2GB  [line chart]                      ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### Components

**Stat Cards (4-column):**
- Same pattern as Dashboard but with different metrics
- Each: label (uppercase, mono), value (large), delta (small, colored)

**Activity Feed Timeline:**
- Vertical timeline with colored dots (green=running, gray=done, red=failed)
- Each item: session ID (mono), agent name, status badge, timestamp
- Selected item has border highlight

**Step Cards (expandable):**
- Each step: status icon (✓/⟳/○), step name, duration
- Completed steps: green check, collapsible with log output
- Active step: blue border, spinner, progress bar, live log output
- Pending step: gray, 50% opacity

**Resource Usage Chart:**
- Line chart with CPU and MEM indicators
- Live updating (simulated)

---

## 4. Session Detail (Modal)

**Trigger:** Click session in Explorer or Dashboard
**Purpose:** Deep dive into a single session

### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  Modal Header                                                │
│  SESSION #47  •  ACTIVE PRODUCTION REFINEMENT                │
│  "Deep-dive Analysis: Pipeline Optimization"     [×]         │
│  ────────────────────────────────────────────────────────────│
│                                                               │
│  Metadata Bar (4-column, divided)                            │
│  │ Timestamp │ Agent Identity │ Phase │ Compute Cost │       │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Changes Made                                             ││
│  │  ┌─────────────────────┐ ┌─────────────────────┐         ││
│  │  │ src/pipeline/...py  │ │ config/engine...yaml │         ││
│  │  │ Modified batch...   │ │ Injected latency...  │         ││
│  │  │ -42 lines +18 lines │ │ +3 lines             │         ││
│  │  └─────────────────────┘ └─────────────────────┘         ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Decisions Log (table)                                    ││
│  │  ACTION    │ REASONING & EVIDENCE        │ CONFIDENCE    ││
│  │  UPSCALING │ Increased GPU memory...      │ 98.2%         ││
│  │  ROLLBACK  │ Reverted experimental...     │ 84.0%         ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Dataset Signals (4 stat cards)                           ││
│  │  Integrity: 99.9  │ Throughput: 1.2GB/s                   ││
│  │  Entropy: 0.02    │ Row Count: 4.2M                       ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Next Steps (checklist)                                   ││
│  │  □ Validate Optimizer.py in staging-v2  [PRIORITY: HIGH]  ││
│  │  □ Trigger global re-index              [PRIORITY: MED]   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  Footer: "All actions logged to Immutable Decision Ledger"   │
│  [EXPORT LEDGER]  [APPROVE CHANGES →]                        │
└──────────────────────────────────────────────────────────────┘
```

### Components

**Metadata Bar:**
- 4 equal columns, divided by vertical lines
- Each: label (10px, uppercase, mono) + value (bold)
- Background: `surface-container-low`

**Change Cards:**
- Icon (file type) + file path (mono) + description
- Line count badges: red for deletions, gray for additions
- Border, hover → primary border

**Decisions Table:**
- Header row: ACTION, REASONING & EVIDENCE, CONFIDENCE
- Action badge: colored pill with dot indicator
- Reasoning: description + code block or quote
- Confidence: percentage, primary color

**Dataset Signals:**
- 4 stat cards in a row
- Each: icon, label, large value, status text (NOMINAL/STRESS/STABLE/GROWING)

**Next Steps:**
- Checkbox items with description and assignee
- Priority badge (HIGH/MED/LOW)

---

## 5. Context Search (Modal)

**Trigger:** Cmd+K or search bar
**Purpose:** Semantic search across all session memory

### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  Modal                                                        │
│  🔍 Search sessions, logs, or semantic concepts...    [ESC]  │
│  ────────────────────────────────────────────────────────────│
│                                                               │
│  Tags: [Semantic Match] [Last 30 Days]     8 matches in 42ms │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  RESULT 1 (92% match)                                     ││
│  │  🔵 Kernel Memory Profiler                 [92% Match]    ││
│  │  ```c code block with highlighted matches ```             ││
│  │  Snippet from session_492_perf.log         [Jump to →]   ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  RESULT 2 (81% match)                                     ││
│  │  📊 Heap Analysis Dashboard                [81% Match]    ││
│  │  Description with highlighted keywords                    ││
│  │  Part of deployment_v2_metrics            [Open Dashboard]││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  RESULT 3 (76% match)                                     ││
│  │  📄 Internal Docs: Memory Safety           [76% Match]    ││
│  │  Quote with highlighted keywords                          ││
│  │  Referenced in Best Practices v2.4         [Read Article] ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  Quick Actions:                                               │
│  [Create new dataset]  [Ask Buiry AI]                        │
│                                                               │
│  Footer: ↑↓ Navigate  ↵ Select  Search powered by VectorEngine│
└──────────────────────────────────────────────────────────────┘
```

### Components

**Search Input:**
- Large, prominent, centered in modal header
- Icon: search (teal for semantic matches)
- ESC badge to dismiss

**Filter Tags:**
- Pill-shaped badges: "Semantic Match" (primary bg), "Last 30 Days" (secondary bg)
- Result count + timing

**Result Cards:**
- Icon (colored by type) + title + relevance badge (percentage)
- Content preview: code block or text with highlighted keywords
- Source reference (session ID, doc name) + action button
- Hover: border highlight, action buttons appear

**Quick Actions:**
- Two action buttons at bottom of results
- Icon + label format

---

## 6. Dataset Browser Screen

**Route:** `/datasets`
**Purpose:** View and manage generated datasets

### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  Header: "Active Repositories"                               │
│  Description about Walrus and Sui protocols                  │
│  [Filters] [Ingest Dataset]                                  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Dataset Card                                             ││
│  │  ┌──────┐                                                 ││
│  │  │ icon │  Global-NLP-v4  [VERIFIED]                     ││
│  │  └──────┘  Sui Object: 0x82a1...f32                      ││
│  │                                                           ││
│  │  Privacy Score    98/100                                  ││
│  │  ████████████████████████████████████ 98%                 ││
│  │                                                           ││
│  │  Walrus CID    bafy...73u2                               ││
│  │  Epoch         420                                        ││
│  │                                                           ││
│  │  [avatar stack]                                           ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### Components

**Dataset Card:**
- Icon (colored by category) + name + "VERIFIED" badge
- Sui Object ID (truncated, mono)
- Privacy Score bar (color-graded: green >95%, yellow 85-95%, red <85%)
- Metadata: Walrus CID (truncated, mono), Epoch
- Avatar stack (contributors)

**Ingest Dataset Button:**
- Primary bg, upload icon

---

## 7. Marketplace Screen

**Route:** `/marketplace`
**Purpose:** Browse and purchase datasets

### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  Header: "Available Datasets"                                │
│  [All Categories ▼] [Newest First ▼] [More Filters]         │
│                                                               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │  [image]          │ │  [image]          │ │  [image]          ││
│  │  Genomic-X12      │ │  Neural-Flow      │ │  Smart-City-IOT   ││
│  │  0.45 ETH         │ │  1.20 ETH         │ │  0.08 ETH         ││
│  │  Description...   │ │  Description...   │ │  Description...   ││
│  │  0x8a...4bE1      │ │  0x3c...F2a9      │ │  0x91...7eC0      ││
│  │  Privacy: 98%     │ │  Privacy: 84%     │ │  Privacy: 92%     ││
│  │  [Purchase] [👁]  │ │  [Purchase] [👁]  │ │  [Purchase] [👁]  ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │  Pharma-Trial-A9 │ │  Climatic-Log    │ │  Silicon-Tele    ││
│  │  2.50 ETH        │ │  0.15 ETH        │ │  0.95 ETH        ││
│  │  Privacy: 100%   │ │  Privacy: 75%    │ │  Privacy: 89%    ││
│  │  [Purchase] [👁]  │ │  [Purchase] [👁]  │ │  [Purchase] [👁]  ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                               │
│                 [Load More Datasets ▼]                        │
└──────────────────────────────────────────────────────────────┘
```

### Components

**Dataset Card (Marketplace):**
- Hero image (40% height, object-cover, zoom on hover)
- "Verified" badge overlay on image
- Name + price (mono font, secondary bg)
- Description (2-line clamp)
- Owner address (mono, truncated)
- Privacy score bar
- Footer: "Purchase" button (primary) + preview icon button

**Filter Bar:**
- Category dropdown, Sort dropdown, More Filters button
- Horizontal, below header

---

## 8. Settings Screen

**Route:** `/settings`
**Purpose:** Platform configuration, API keys, wallet, billing

### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  Header: "Configuration & Workspace"                         │
│  Description                                                  │
│                                                               │
│  ┌──────────────────────────────────┐ ┌────────────────────┐│
│  │  Main Content (scrollable)        │ │  Right Sidebar      ││
│  │                                   │ │                     ││
│  │  ┌─ API Credentials ───────────┐ │ │  CURRENT PLAN       ││
│  │  │ Master Testing Key: d1_...  │ │ │  $149/mo            ││
│  │  │ [Copy] [Reveal]             │ │ │  Session Budget     ││
│  │  └────────────────────────────┘ │ │  Compute Units      ││
│  │                                   │ │  [Manage Billing]   ││
│  │  ┌─ Workspace Environment ────┐ │ │  [Upgrade]          ││
│  │  │ Auto Data Capture: toggle  │ │ │                     ││
│  │  │ Outage Debug Endpoint      │ │ │  ORCHESTRATION      ││
│  │  │ Region Affinity / Log Ret. │ │ │  INTELLIGENCE       ││
│  │  └────────────────────────────┘ │ │  Toggles...         ││
│  │                                   │ │                     ││
│  │  ┌─ Sui Network Wallet ──────┐ │ │  Network Status     ││
│  │  │ Devlabs_Primary Connected │ │ │  ● Connected        ││
│  │  └────────────────────────────┘ │ │                     ││
│  │                                   │ │                     ││
│  │  ┌─ Co-pilot Integration ────┐ │ │                     ││
│  │  │ Claude Code Snippet        │ │ │                     ││
│  │  │ import { BuiryPlatform }   │ │ │                     ││
│  │  └────────────────────────────┘ │ │                     ││
│  │                                   │ │                     ││
│  │  ┌─ Danger Zone ─────────────┐ │ │                     ││
│  │  │ Archive / Delete Project   │ │ │                     ││
│  │  └────────────────────────────┘ │ │                     ││
│  └──────────────────────────────────┘ └────────────────────┘│
│                                                               │
│  Footer: [Discard Changes]  [Save Configuration]             │
└──────────────────────────────────────────────────────────────┘
```

### Components

**API Credentials:**
- "LIVE" badge (green dot)
- Masked key with Reveal/Copy buttons
- Mono font for key display

**Workspace Environment:**
- Toggle switch for Auto Data Capture
- Text input for endpoint URL
- Dropdowns for Region and Log Retention

**Sui Network Wallet:**
- Wallet address (truncated, mono)
- "Connected" status badge (green)
- Disconnect button

**Co-pilot Integration:**
- Code snippet with syntax highlighting
- Copy button
- Language badge (JavaScript)

**Danger Zone:**
- Red border, red text
- Archive Project and Delete Project buttons (red outline)

**Right Sidebar:**
- Plan card: current plan, price, usage bars
- Orchestration Intelligence: toggle switches
- Network Status: connection indicator

---

## 9. Documentation Screen

**Route:** `/docs`
**Purpose:** SDK docs, setup guides, API reference

### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────┬───────────────────────────┬──────────────────┐│
│  │  LEFT NAV │  MAIN CONTENT              │  RIGHT NAV       ││
│  │           │                            │  (page sections) ││
│  │ REFERENCE │  Getting Started           │                   ││
│  │           │  Description...            │  Prerequisites    ││
│  │ Getting   │                            │  Installation     ││
│  │  Started  │  ⚠ Resource Intensive     │  Configure Env    ││
│  │ MCP Server│  ℹ Privacy First          │  Next Steps       ││
│  │ SDK Ref   │                            │                   ││
│  │           │  01 Installation           │                   ││
│  │           │  ```bash                   │                   ││
│  │           │  npm install -g buiry-cli  │                   ││
│  │           │  buiry init --project "A"  │                   ││
│  │           │  ```                       │                   ││
│  │           │                            │                   ││
│  │           │  02 Configure Environment  │                   ││
│  │           │  ```json                   │                   ││
│  │           │  { "mcp_servers": [...] }  │                   ││
│  │           │  ```                       │                   ││
│  └──────────┴───────────────────────────┴──────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### Components

**Left Nav:**
- Section header: "REFERENCE" (uppercase, mono, muted)
- Nav items: Getting Started (active), MCP Server Setup, SDK Reference
- Active: primary color, bold

**Main Content:**
- Headline: "Getting Started"
- Info badges: "Resource Intensive" (amber), "Privacy First" (green)
- Numbered sections with code blocks
- Code blocks: dark bg, mono font, syntax highlighting

**Right Nav:**
- Page section links
- Active section highlighted
- Sticky positioning

---

## 10. Onboarding (Modal)

**Trigger:** First visit or "Deploy New Agent"
**Purpose:** 3-step setup wizard

### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  Modal (dark overlay)                                         │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  LEFT: Steps              │  RIGHT: Content              ││
│  │                           │                               ││
│  │  1  Welcome               │  Welcome to Buiry             ││
│  │     Basic Information     │  The ultimate UI environment  ││
│  │                           │  for rapid AI dev cycles.     ││
│  │  2  Project               │                               ││
│  │     Workspace Setup       │  ┌─────┐ ┌─────┐ ┌─────┐    ││
│  │                           │  │Conn-│ │Build│ │Harv-│    ││
│  │  3  Connect               │  │ect  │ │     │ │est  │    ││
│  │     ML Integrations       │  └─────┘ └─────┘ └─────┘    ││
│  │                           │                               ││
│  │                           │  [Begin Integration →]        ││
│  │  Operating at 99.9%       │                               ││
│  │  efficiency, ready for    │                               ││
│  │  deployment               │                               ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### Components

**Step Indicator:**
- Vertical list on left
- Active: primary color, bold
- Completed: checkmark
- Inactive: muted

**Feature Cards (3-column):**
- Icon (star/AI/rocket) + title + description
- Border, hover → primary border

**Begin Integration Button:**
- Primary bg, right-aligned

---

## 11. Notifications (Dropdown/Panel)

**Trigger:** Bell icon in top bar
**Purpose:** Recent alerts and activity

### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  Activity Center                                    [×]      │
│  ────────────────────────────────────────────────────────────│
│                                                               │
│  ●  New dataset generated                       2m ago       │
│     Synthetic dataset DS-XY92 has been validated...           │
│     ✓ PASS  ✓ PASS  ✓ PASS  1 INT                           │
│                                                               │
│  ●  Session #47 completed                       1h ago       │
│     Agent training session ended with 98.4% confidence.      │
│                                    [LIVE]                    │
│                                                               │
│  ✗  PII flagged in dataset                     2h ago       │
│     Privacy scanner detected 14 unmasked email strings...    │
│     ⚠ EXPOSED: EMAIL_EXPOSURE                               │
│                                                               │
│  [VIEW ALL ALERTS]                                           │
└──────────────────────────────────────────────────────────────┘
```

### Components

**Notification Item:**
- Status icon (green check / red alert)
- Title (bold) + timestamp
- Description text
- Status badges (PASS/FAIL/LIVE/EXPOSED)

**VIEW ALL ALERTS:**
- Full-width button at bottom

---

## 12. Component Inventory

| Component | States | Used In |
|---|---|---|
| Sidebar Nav | Default, Active, Hover | All screens |
| Top Bar | Default, Search focused | All screens |
| Stat Card | Default, Loading, Warning | Dashboard, Session Explorer |
| Session Card | Collapsed, Expanded, Active | Session Explorer |
| Step Card | Completed, Active, Pending | Session Explorer |
| Dataset Card | Default, Hover, Verified | Dataset Browser, Marketplace |
| Privacy Score Bar | Green (>95%), Yellow (85-95%), Red (<85%) | Dataset Browser, Marketplace |
| Search Modal | Empty, Results, No results | Context Search |
| Session Detail Modal | Open, Scrolling | Session Detail |
| Onboarding Wizard | Step 1, 2, 3 | Onboarding |
| Notification Panel | Empty, Items, Alert | Notifications |
| Code Block | Default, Syntax highlighted | Docs, Settings |
| Toggle Switch | On, Off | Settings |
| Button | Primary, Outline, Danger, Ghost | All screens |
| Badge | Status, Category, Priority | All screens |
| Dropdown | Default, Open | Settings, Marketplace |
| Toast | Success, Error, Warning | Settings |
| Progress Bar | Indeterminate, Determinate | Session Explorer |
| Avatar Stack | 1, 2, 3, N+ | Dashboard, Dataset Browser |

---

## 13. Key Design Decisions

1. **Dark theme is primary** — the hackathon demo should use dark theme for maximum visual impact
2. **Light theme available** — for documentation and settings pages
3. **Geist font** — not Inter as originally spec'd. Stitch chose Geist (modern, clean)
4. **Material Symbols** — not Lucide or Primitives. Stitch chose Google's icon set
5. **Tailwind CSS** — all screens use Tailwind with custom config
6. **Single-file HTML** — each screen is a standalone HTML file with embedded Tailwind config
7. **Modal pattern** — Session Detail and Context Search use modal overlays, not separate pages
8. **Two-column settings** — main content + right sidebar for plan/billing
9. **Three-column docs** — left nav + main content + right page sections
10. **Card density** — high information density, compact spacing, no wasted space

---

## 14. Implementation Priority

For the hackathon demo, build these screens first:

| Priority | Screen | Why |
|---|---|---|
| P0 | Dashboard | Landing page, "Continue Where You Left Off" |
| P0 | Session Explorer | Core feature — browse session history |
| P0 | Session Detail Modal | Shows decisions, changes, next steps |
| P0 | Context Search Modal | Cmd+K semantic search — the "wow" feature |
| P1 | Onboarding | First-time user flow |
| P1 | Settings | API keys, wallet, integration snippets |
| P2 | Dataset Browser | Shows generated datasets |
| P2 | Marketplace | Dataset trading (Sui integration) |
| P3 | Documentation | Setup guides |
| P3 | Notifications | Activity center |

---

## 15. Actual HTML Code — Two Design System Variants

Stitch generated TWO distinct design systems across the screens. The user pasted all the HTML code. Here's the breakdown:

### Variant A: Dark Theme (Inter font, "DevLabs OS" branding)
**Screens**: Dashboard, Session Explorer, Session Detail, Context Search, Marketplace, Settings, Documentation, Onboarding, Notifications

**Key characteristics**:
- Font: `Inter` for body, `JetBrains Mono` for code/labels
- Branding: "DevLabs OS" / "Project Alpha"
- Color tokens: MD3 naming (`surface-tint`, `on-surface-variant`, `primary-container`, etc.)
- Background: `#10141a` (not `#0D1117`)
- Primary: `#a2c9ff` (text) / `#58a6ff` (container/buttons)
- Active nav: `bg-secondary-container` (`#5d2d9c` purple)
- Grid pattern: `radial-gradient(#30363D 1px, transparent 1px)` on 24px grid
- All screens are complete standalone HTML files with embedded Tailwind config

### Variant B: Light Theme (Geist font, "Buiry Platform" branding)
**Screens**: Dashboard, Session Explorer, Session Detail, Context Search, Dataset Browser, Marketplace, Settings, Documentation, Onboarding, Notifications

**Key characteristics**:
- Font: `Geist` for body, `JetBrains Mono` for code/labels
- Branding: "Buiry Platform" / "AI Decision Ledger"
- Color tokens: Same MD3 naming but light values
- Background: `#f8f9fb`
- Primary: `#0051ae`
- Active nav: `bg-secondary-container` (`#dde0e6`)
- Glass card pattern: `rgba(255,255,255,0.8) backdrop-filter: blur(8px)`
- Bento grid layout with `grid-cols-12`

### Shared Component Patterns (Both Variants)

**Sidebar Navigation**:
```html
<aside class="w-[240px] h-screen fixed left-0 top-0 flex flex-col border-r border-{border-subtle} bg-surface-container py-md px-sm z-50">
  <!-- Brand header -->
  <!-- Nav items: flex items-center gap-sm px-md py-sm -->
  <!-- Active: bg-secondary-container text-on-secondary-container rounded-lg font-bold -->
  <!-- Inactive: text-on-surface-variant hover:bg-surface-variant -->
  <!-- Deploy New Agent button at bottom -->
  <!-- Help/Profile links -->
</aside>
```

**Top Bar**:
```html
<header class="fixed top-0 right-0 left-[240px] h-[48px] z-40 bg-surface flex justify-between items-center px-md border-b border-{border-subtle}">
  <!-- Left: breadcrumb or title -->
  <!-- Right: search, notifications, settings, avatar -->
</header>
```

**Content Area**:
```html
<main class="ml-[240px] pt-[48px] min-h-screen">
  <!-- Page content with p-lg and max-w -->
</main>
```

**Card Pattern**:
```html
<div class="bg-surface-card border border-border-subtle rounded-lg p-md hover:border-primary/50 transition-all">
  <!-- Card content -->
</div>
```

**Status Pulse Animation** (Dark theme):
```css
@keyframes pulse-status {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}
.status-pulse { animation: pulse-status 2s infinite ease-in-out; }
```

**Cmd+K Search Modal**:
```html
<div class="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000CC] backdrop-blur-sm">
  <div class="w-full max-w-2xl bg-surface-card border border-border-subtle rounded-xl shadow-2xl">
    <!-- Search input -->
    <!-- Results list -->
    <!-- Footer with keyboard hints -->
  </div>
</div>
```

---

## 16. Design Token Mapping — Original Spec vs Stitch Output

| Concept | Our Original Spec | Stitch Dark | Stitch Light |
|---|---|---|---|
| Background | `#0D1117` | `#10141a` | `#f8f9fb` |
| Card bg | `#161B22` | `#161B22` (surface-card) | `#ffffff` (surface-container-lowest) |
| Primary text | `#E6EDF3` | `#E6EDF3` (text-primary) | `#191c1e` (on-surface) |
| Primary accent | `#58A6FF` | `#58a6ff` (primary-container) | `#0969da` (primary-container) |
| Secondary | `#BC8CFF` | `#d8baff` (secondary) | `#5b5f64` (secondary) |
| Tertiary | `#39D2C0` | `#47dcca` (tertiary) | `#4f565c` (tertiary) |
| Success | `#3FB950` | `#3FB950` (status-success) | `#3FB950` |
| Warning | `#D29922` | `#D29922` (status-warning) | `#D29922` |
| Error | `#F85149` | `#F85149` (status-error) | `#ba1a1a` (error) |
| Border | `#30363D` | `#30363D` (border-subtle) | `#d0d7de` (border-subtle) |
| Body font | Inter | Inter | Geist |
| Code font | JetBrains Mono | JetBrains Mono | JetBrains Mono |

---

*Stitch UI/UX Study — generated 2026-07-01, updated with actual HTML code analysis*
*Reference for React frontend implementation. Code files available in user's clipboard.*
