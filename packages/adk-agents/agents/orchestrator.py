"""Buiry ADK Agent Orchestrator

This is the root agent entry point for the Buiry multi-agent system.
It uses Google ADK's SequentialAgent to orchestrate three specialist agents
in a pipeline pattern:

    CoordinatorAgent → DevAgent → ReviewAgent

Design choices:
  - SequentialAgent runs sub-agents in order, passing context between them.
    This is simpler than a ParallelAgent and ensures reviews happen after code.
    ParallelAgent would risk reviewing incomplete code changes.
  - The coordinator runs first to load context from Buiry MCP memory.
  - DevAgent runs second to make code changes based on that context.
  - ReviewAgent runs last to validate changes against past decisions.
  - If review finds issues, the coordinator's next session will address them
    (persistence through Build-Context-Memory.json creates a feedback loop).

MCP Integration:
  The sub-agents' instructions reference buiry_start_session and buiry_end_session
  as MCP tools. In production, these tools are injected into the ADK runtime
  via the MCP server connection. The agents call them as regular function calls.
  The MCP server runs as a child process, communicating via stdio (JSON-RPC).

Why SequentialAgent over other patterns?
  - Sequential: Code must exist before it can be reviewed (dependency)
  - Each agent receives the previous agent's output as context
  - The pipeline is deterministic: same input → same agent sequence
  - Error handling: if any agent fails, the pipeline stops and the
    coordinator's next session can address the failure
"""

from google.adk.agents import SequentialAgent
from .coordinator import coordinator
from .dev_agent import dev_agent
from .review_agent import review_agent

# SequentialAgent ensures agents run in order: coordinator → dev → review.
# Each agent receives the output of the previous one as context.
# This pipeline pattern is ideal for the code → review workflow.
# The root_agent is the entry point for ADK's runtime — it's what gets
# passed to the agent runner when a coding session begins.
root_agent = SequentialAgent(
    name="buiry_agent_team",
    description="Buiry's multi-agent coding team with persistent memory",
    sub_agents=[coordinator, dev_agent, review_agent],
)
