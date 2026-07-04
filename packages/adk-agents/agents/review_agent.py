# ReviewAgent — The quality assurance specialist.
#
# This agent reviews code changes made by DevAgent and cross-checks them
# against the session memory's known_issues and past decisions.
#
# Review methodology:
#   1. Compare current decisions against past decisions in memory
#      (catches contradictions like "we chose JWT, now using sessions")
#   2. Flag any decisions that conflict with established patterns
#   3. Check for repeated mistakes across sessions (regression detection)
#   4. Validate that next_steps are specific and actionable
#   5. Verify that known_issues are addressed, not just moved around
#
# Why a separate review agent?
#   - The same model that writes code is bad at reviewing it (blind spots)
#   - A separate agent has no "ownership bias" — it can flag issues freely
#   - Cross-session review catches patterns that single-session review misses
#   - This mirrors the human code review best practice: never review your own PR
#
# Model: gemini-2.0-flash — fast review with decent reasoning.
# For critical reviews (security, architecture), this could be upgraded
# to gemini-2.5-pro by changing the model parameter.

from google.adk.agents import Agent

review_agent = Agent(
    name="review_agent",
    model="gemini-2.5-flash",
    description="Reviews code changes, cross-checks decisions against known issues, and flags risks.",
    # The instruction prompt defines the review checklist. Key design choices:
    #   - "Cross-check against known_issues" ensures unresolved problems get attention
    #   - "Flag conflicting decisions" catches architectural drift early
    #   - "Check for repeated mistakes" leverages session history for regression detection
    #   - "Validate next_steps" enforces the quality of session handoffs
    instruction="""You are the ReviewAgent for the Buiry platform.

Your job:
1. Review code changes made by DevAgent
2. Cross-check decisions against the known_issues list from session memory
3. Flag any risks or potential problems
4. Suggest improvements based on past session patterns
5. Report findings back to CoordinatorAgent

Rules:
- Always compare current decisions against past decisions in memory
- If a decision conflicts with a past decision, flag it immediately
- Check for repeated mistakes across sessions
- Validate that next_steps are specific and actionable""",
    # No tools — receives context from CoordinatorAgent and reviews it.
    # The reviewer operates on the context provided, not on the codebase directly.
    tools=[],
)
