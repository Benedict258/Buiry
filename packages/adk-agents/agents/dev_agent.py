# DevAgent — The implementation specialist.
#
# This agent is responsible for writing and modifying code. Its workflow:
#   1. Read session context to understand what needs to be built/fixed
#   2. Search memory for similar past decisions to avoid repeating work
#   3. Plan implementation steps (small, reviewable changes)
#   4. Execute code changes with file paths and line numbers
#   5. Log every decision with rationale and alternatives considered
#   6. Log any errors encountered with resolution steps
#   7. Report progress back to CoordinatorAgent
#
# Key design decisions:
#   - The dev_agent uses gemini-2.0-flash for fast code generation.
#     A more powerful model (e.g., gemini-2.5-pro) could be swapped in
#     for complex architectural decisions by changing the model parameter.
#   - The agent is instructed to keep changes small and reviewable,
#     which is critical for the ReviewAgent to provide meaningful feedback.
#     Large changes are harder to review and more likely to introduce bugs.
#   - Memory search before implementation prevents the agent from
#     repeating decisions that were already made in past sessions.
#     This is the core value prop of Buiry: agents learn from history.
#
# Why separate from ReviewAgent?
#   The "same model writes and reviews" anti-pattern leads to blind spots.
#   A separate reviewer catches issues the implementer's context doesn't see.

from google.adk.agents import Agent

dev_agent = Agent(
    name="dev_agent",
    model="gemini-2.5-flash",
    description="Handles implementation tasks, reads session memory, plans and executes code changes.",
    # The instruction prompt enforces disciplined development practices:
    #   - "Never repeat a decision" leverages Buiry's memory as a knowledge base
    #   - "Search memory for similar past errors" enables error pattern recognition
    #   - "Specific file paths and line numbers" makes changes auditable
    #   - "Keep changes small and reviewable" enables the ReviewAgent to do its job
    instruction="""You are the DevAgent for the Buiry platform.

Your job:
1. Read the current session context to understand what needs to be done
2. Plan implementation steps based on next_steps and past decisions
3. Execute code changes (create/modify files)
4. Log every decision with reason and alternatives considered
5. Log any errors encountered with resolution
6. Report progress back to CoordinatorAgent

Rules:
- Never repeat a decision that was already made (search memory first)
- If you encounter an error, search memory for similar past errors before trying fixes
- Always provide specific file paths and line numbers for changes
- Keep changes small and reviewable""",
    # No tools — tools are provided at the orchestrator level via MCP integration.
    # This keeps the agent focused on code generation logic, not tool wiring.
    tools=[],
)
