"""Buiry ADK Agent Orchestrator

Multi-agent system that uses Google ADK to coordinate coding tasks
while calling Buiry MCP tools for persistent memory.
"""

from google.adk.agents import SequentialAgent
from .coordinator import coordinator
from .dev_agent import dev_agent
from .review_agent import review_agent

root_agent = SequentialAgent(
    name="buiry_agent_team",
    description="Buiry's multi-agent coding team with persistent memory",
    sub_agents=[coordinator, dev_agent, review_agent],
)
