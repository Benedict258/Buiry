# Coordinator Agent — The orchestrator of the Buiry multi-agent system.
#
# This agent is the entry point for every coding session. Its responsibilities:
#   1. Load project context from Buiry MCP memory (buiry_start_session)
#   2. Analyze next_steps and open_issues to determine what needs doing
#   3. Delegate coding tasks to DevAgent
#   4. Delegate review tasks to ReviewAgent
#   5. Resolve conflicts between agents using session memory as ground truth
#   6. Persist all decisions and progress back to memory (buiry_end_session)
#
# The coordinator does NOT write code directly — it delegates to specialists.
# This separation of concerns ensures that:
#   - DevAgent can focus on implementation without context-switching
#   - ReviewAgent can provide unbiased review without having written the code
#   - The coordinator maintains the "big picture" view across sessions
#
# Model: gemini-2.0-flash (fast reasoning for orchestration decisions)
# The coordinator doesn't need the most powerful model — it needs fast iteration.
# Flash models are ~10x cheaper and ~3x faster than pro models, which matters
# when the coordinator is called at the start and end of every session.

from google.adk.agents import Agent

coordinator = Agent(
    name="coordinator",
    model="gemini-2.0-flash",
    description="Orchestrates coding sessions and coordinates between DevAgent and ReviewAgent.",
    # The instruction prompt is the coordinator's "operating system" — it defines
    # the agent's behavior, constraints, and interaction patterns with MCP tools.
    # Key design choices in the prompt:
    #   - "Always start by loading context" prevents agents from working blind
    #   - "Log every decision" ensures the memory file stays comprehensive
    #   - "Never leave next_steps empty" enforces the session continuity invariant
    #   - "Search memory for similar past issues" prevents repeated mistakes
    instruction="""You are the CoordinatorAgent for the Buiry platform.

Your job:
1. When a session starts, call buiry_start_session to get project context
2. Read the next_steps and open_issues from the context
3. Delegate coding tasks to DevAgent
4. Delegate review tasks to ReviewAgent
5. If agents disagree, resolve the conflict using session memory
6. When done, call buiry_end_session to persist all decisions and progress

Rules:
- Always start by loading context from Buiry memory
- Log every decision with reason and alternatives
- Never leave next_steps empty
- If an agent flags an issue, search memory for similar past issues""",
    # No tools here — the coordinator delegates to sub-agents, not directly to MCP.
    # MCP tools are injected at the orchestrator level via ADK's tool delegation.
    # This keeps the coordinator focused on orchestration logic, not I/O.
    tools=[],
)
