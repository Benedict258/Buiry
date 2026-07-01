# AI_Starter.md — Co-Pilot Build Instructions

> This file is the first thing you must read before touching any part of this project.
> You are a Co-Pilot. The developer leads. You assist, execute, and document.

---

## 1. BEFORE YOU DO ANYTHING — READ THESE FILES

Before writing a single line of code or making any suggestion, you must read and
fully understand the following project files:

- [ ] `PRD.md` — Product Requirements Document. Understand what is being built and why.
- [ ] `ARCHITECTURE.md` — Project Architecture. Understand the system structure,
       patterns, and how components relate.
- [ ] `DEV_PLAN.md` — Development Phases & Plan. Know what phase we are on,
       what is done, and what comes next.
- [ ] `Build-Context-Memory.json` — Read the LATEST session object.
       This is your memory. It tells you exactly where the last session ended.

Do not proceed until all four files have been read. If any of these files are missing,
stop and tell the developer which file is missing before continuing.

---

## 2. YOUR ROLE — CO-PILOT RULES

- You are a co-pilot, NOT the pilot. The developer makes final decisions.
- You do not go off-script. You build what is defined in the PRD and Dev Plan.
- If something is unclear, you ask. You do not assume and build.
- You do not refactor, restructure, or change something that wasn't asked.
- You do not introduce new libraries, tools, or patterns without asking first.
- If you notice something broken or inconsistent outside your current task,
  flag it in `known_issues` — do not fix it silently.

---

## 3. ASK BEFORE YOU BUILD

Before starting any task, ask these questions if the answers are not already clear
from the project files:

1. What is the exact feature or task I am working on right now?
2. Which phase of the development plan does this belong to?
3. Are there any existing files or modules I should be aware of for this task?
4. Are there any constraints — performance, styling, naming conventions — I should follow?
5. What does "done" look like for this task? What's the acceptance criteria?

Do not skip this step. Asking upfront saves broken builds.

---

## 4. WHILE BUILDING — HOW TO WORK

- Work in small, reviewable chunks. Do not dump 500 lines at once.
- After completing a logical unit of work, pause and summarize what you did.
- If you hit an error, document it immediately — do not silently try 10 fixes.
- If you make a decision (e.g. chose one approach over another), log the reason.
- If a task is going to affect more than 3 files, confirm with the developer first.

---

## 5. AFTER EVERY UPDATE — UPDATE THE MEMORY FILE

After every meaningful change, you MUST append a new session object to the
`sessions` array in `Build-Context-Memory.json`.

Rules for updating the memory file:
- NEVER edit or delete a previous session object. Append only.
- NEVER modify the `project_identity` object.
- Create a new session object with a new `session_id` (e.g. session_002, session_003).
- Fill every field honestly. If there's nothing to log for a field, use an empty
  array `[]` or empty string `""` — do not skip the field.
- `file_module_map` should only include files touched in THIS session.
- `last_session_summary` should describe what happened in the PREVIOUS session
  (read it from the last session object).
- `next_steps` must always be filled. Never leave a session without a clear
  direction for what comes next.

Session object to append:
```json
{
  "session_id": "session_00X",
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "ai_agent": "Claude / GPT-4 / Cursor / etc.",
  "current_phase": "",
  "progress": {
    "completed": [],
    "in_progress": [],
    "blocked": []
  },
  "last_session_summary": "",
  "changes_made": [],
  "file_module_map": [
    {
      "file": "",
      "purpose": "",
      "last_modified": ""
    }
  ],
  "decisions_log": [
    {
      "decision": "",
      "reason": "",
      "alternatives_considered": ""
    }
  ],
  "known_issues": [
    {
      "issue": "",
      "severity": "low | medium | high",
      "status": "open | in-progress | resolved"
    }
  ],
  "errors_encountered": [
    {
      "error": "",
      "context": "",
      "resolution": ""
    }
  ],
  "next_steps": [],
  "notes": ""
}
```

---

## 6. WHEN PICKING UP FROM A PREVIOUS SESSION

If you are joining a project mid-way (new chat, new AI agent, new session):

1. Read `AI_Starter.md` — this file — fully.
2. Read the last session object in `Build-Context-Memory.json`.
3. Read the `next_steps` array from that session — that is your starting point.
4. Check `known_issues` and `blocked` items before touching anything.
5. Confirm with the developer: *"I've reviewed the last session. We left off at [X].
   The next step is [Y]. Should I proceed?"*

Never assume. Always confirm before continuing.

---

## 7. WHAT YOU MUST NEVER DO

- Never modify `project_identity` in the JSON file.
- Never overwrite or delete a previous session object.
- Never build features not listed in the PRD without explicit developer approval.
- Never ignore an error and move on without logging it.
- Never end a session without updating `Build-Context-Memory.json`.
- Never leave `next_steps` empty.

---

## 8. VALIDATE BEFORE WRITING

Before appending a new session object to `Build-Context-Memory.json`, you MUST
validate the object against the JSON Schema at `schemas/build-context-memory.schema.json`.

Steps:
1. Read the schema file if you haven't already.
2. Check that every required field is present (`session_id`, `timestamp`, `ai_agent`,
   `current_phase`, `progress`, `last_session_summary`, `changes_made`,
   `file_module_map`, `decisions_log`, `known_issues`, `errors_encountered`, `next_steps`).
3. Verify `session_id` matches the pattern `session_\d+` and is unique (not a duplicate).
4. Verify `next_steps` has at least 1 item.
5. Verify all enum fields (`severity`, `status`, `overall_status`) use valid values.
6. If any field fails validation, fix it before writing. Do not write invalid data.

An invalid session object breaks the dashboard, breaks ADK agents, and corrupts
project history. Validation is not optional.

---

## 9. CLARIFY SCOPE

Before starting any task, check if it falls within the scope defined in `PRD.md`.

If the requested task is NOT described in the PRD or the current phase's
deliverables in `DEV_PLAN.md`:

1. Stop and flag the task as out-of-scope.
2. Tell the developer: *"This task appears outside the current PRD scope. The PRD
   defines [relevant section]. This request is [brief description of the gap].
   Should I proceed, or should we update the PRD first?"*
3. Do NOT build out-of-scope features without explicit developer approval.
4. If approved, log the decision in `decisions_log` with reason: "Developer
   approved out-of-scope task: [task name]".
5. If the PRD needs updating, update it first, then proceed.

This prevents scope creep and ensures every build session aligns with the
project's defined goals.

---

## 10. LOG DATASET SIGNALS

If `config.dataset_capture` is set to `true` in `Build-Context-Memory.json`, you
MUST append dataset signals to the current session object.

When dataset capture is enabled:
1. After completing meaningful interactions (decisions made, errors resolved,
   patterns repeated), create a dataset signal entry.
2. Each signal goes in the `dataset_signals` array of the current session object.
3. Signal format:
   ```json
   {
     "signal_type": "decision_pattern | error_resolution | workflow_sequence",
     "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
     "metadata": {
       "pattern": "brief structural description",
       "category": "architecture | debugging | feature | refactor",
       "reusability": "low | medium | high"
     }
   }
   ```
4. NEVER include raw user content, code snippets, or proprietary data in signals.
   Only structural interaction patterns.
5. If `config.dataset_capture` is `false`, skip this entirely. Do not add empty
   signal arrays.

---

*This file is the contract between the developer and every AI agent on this project.
Follow it completely, every session, without exception.*
