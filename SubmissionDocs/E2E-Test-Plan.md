# Buiry E2E Test Plan

## 1. MCP Server Tests

- [ ] **1.1 Start MCP server**
  - Run: `node packages/buiry-mcp/dist/index.js`
  - Expected: Server prints `buiry-mcp server running on stdio` to stderr
  - Pass: Exit code 0, no error output

- [ ] **1.2 buiry_start_session — happy path**
  - Send JSON-RPC request: `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"buiry_start_session","arguments":{}}}`
  - Expected: Response contains `project_identity`, `last_5_sessions`, `open_issues`, `summary`
  - Pass: All four top-level keys present in result content

- [ ] **1.3 buiry_end_session — valid session**
  - Send JSON-RPC request with valid session object including all required fields (session_id, timestamp, ai_agent, current_phase, progress, last_session_summary, next_steps, known_issues)
  - Expected: Response contains `success: true`, `session_id`, `total_sessions`
  - Pass: `isError` is not set; total_sessions incremented by 1

- [ ] **1.4 buiry_end_session — empty next_steps rejected**
  - Send JSON-RPC request with session where `next_steps: []`
  - Expected: Validation fails with error message about next_steps
  - Pass: `isError: true` in response

- [ ] **1.5 buiry_get_context — search returns results**
  - First add a session with summary containing the keyword "React"
  - Send: `{"name":"buiry_get_context","arguments":{"query":"React"}}`
  - Expected: Response contains `query`, `match_count`, `sessions` array
  - Pass: `match_count >= 1`, sessions include the added session

- [ ] **1.6 buiry_get_context — empty query rejected**
  - Send: `{"name":"buiry_get_context","arguments":{"query":""}}`
  - Expected: Zod validation error (min length 1)
  - Pass: `isError: true`

- [ ] **1.7 Build-Context-Memory.json is valid JSON after operations**
  - After 1.3, read `Build-Context-Memory.json` from project root
  - Expected: File parses with `JSON.parse()` without error
  - Pass: Parse succeeds, file contains sessions array

---

## 2. React App Tests

- [ ] **2.1 Start dev server**
  - Run: `cd apps/web && npm run dev`
  - Expected: Vite dev server starts on port (default 5173)
  - Pass: Server ready within 10s, no crash

- [ ] **2.2 Dashboard loads**
  - Navigate to `http://localhost:5173/`
  - Expected: Hero card with project identity, stats row, chart component, decisions list
  - Pass: Page renders without blank screen or error boundary

- [ ] **2.3 Session Explorer**
  - Navigate to `/sessions`
  - Expected: Session list with timeline visualization
  - Pass: Timeline elements visible, session cards listed

- [ ] **2.4 Session card expansion**
  - Click a session card in Session Explorer
  - Expected: Card expands to show details (phase, progress, next_steps)
  - Pass: Expanded content visible, no layout shift

- [ ] **2.5 Context Search modal**
  - Press `Cmd+K` (Mac) or `Ctrl+K` (Linux) on any page
  - Expected: Search modal opens, input is focused
  - Pass: Modal overlay visible, text input accepts keystrokes

- [ ] **2.6 Settings page**
  - Navigate to `/settings`
  - Expected: Settings page renders with configuration options
  - Pass: No 404, no blank page

- [ ] **2.7 Dataset Browser**
  - Navigate to `/datasets`
  - Expected: Dataset cards render with dataset info
  - Pass: At least one card element visible

- [ ] **2.8 Onboarding wizard**
  - Navigate to `/onboarding`
  - Expected: Wizard renders with step indicators
  - Pass: Step 1 visible, next/prev navigation functional

---

## 3. ADK Agent Tests

- [ ] **3.1 Python syntax compiles**
  - Run: `python3 -c "import ast; ast.parse(open('packages/adk-agents/agents/orchestrator.py').read())"`
  - Expected: No SyntaxError
  - Pass: Exit code 0

- [ ] **3.2 Sub-agent files exist and compile**
  - Run: `python3 -c "import ast; ast.parse(open('packages/adk-agents/agents/coordinator.py').read())"`
  - Run: `python3 -c "import ast; ast.parse(open('packages/adk-agents/agents/dev_agent.py').read())"`
  - Run: `python3 -c "import ast; ast.parse(open('packages/adk-agents/agents/review_agent.py').read())"`
  - Expected: No SyntaxError for any file
  - Pass: All three exit code 0

- [ ] **3.3 Orchestrator defines root_agent with 3 sub-agents**
  - Read `orchestrator.py`, verify it defines `root_agent = SequentialAgent(...)` with `sub_agents=[coordinator, dev_agent, review_agent]`
  - Expected: Variable `root_agent` present, 3 sub-agents in list
  - Pass: Pattern match confirms structure

- [ ] **3.4 Agent imports work (if google-adk installed)**
  - Run: `pip show google-adk` (if installed)
  - Expected: Package info displayed
  - Pass: If not installed, skip test with note

---

## 4. Integration Test

- [ ] **4.1 Simultaneous startup**
  - Start MCP server: `node packages/buiry-mcp/dist/index.js &`
  - Start React dev server: `cd apps/web && npm run dev &`
  - Expected: Both processes run without port conflict (MCP uses stdio, React uses HTTP)
  - Pass: Both processes alive after 5s

- [ ] **4.2 MCP server responds while React is running**
  - With both running, send a `buiry_start_session` JSON-RPC request to MCP server
  - Expected: Response received, React dev server unaffected
  - Pass: MCP responds, React page still accessible

- [ ] **4.3 Clean shutdown**
  - Kill both processes
  - Expected: Exit code 0 or SIGTERM for both, no orphan processes
  - Pass: `ps aux | grep buiry` returns nothing

---

## 5. Build Verification

- [ ] **5.1 MCP server — TypeScript compilation**
  - Run: `cd packages/buiry-mcp && npm run build`
  - Expected: `tsc` compiles with 0 errors, `dist/index.js` produced
  - Pass: Exit code 0, dist/index.js exists

- [ ] **5.2 MCP server — type check only**
  - Run: `cd packages/buiry-mcp && npx tsc --noEmit`
  - Expected: 0 errors
  - Pass: Exit code 0

- [ ] **5.3 React app — type check only**
  - Run: `cd apps/web && npx tsc --noEmit`
  - Expected: 0 errors
  - Pass: Exit code 0

- [ ] **5.4 React app — production build**
  - Run: `cd apps/web && npm run build`
  - Expected: Vite build succeeds, `dist/` folder created
  - Pass: Exit code 0, index.html in dist/

---

## Summary

| Section | Total Tests |
|---------|-------------|
| MCP Server | 7 |
| React App | 8 |
| ADK Agent | 4 |
| Integration | 3 |
| Build Verification | 4 |
| **Total** | **26** |

### Pass Criteria

- **All pass:** Submission is ready
- **Fail in Section 5 (Build):** Hard blocker — fix before submission
- **Fail in Section 1 (MCP) or Section 3 (ADK):** Fix before submission
- **Fail in Section 2 (React):** Document known issues, submit with notes
- **Fail in Section 4 (Integration):** May submit if individual components pass
