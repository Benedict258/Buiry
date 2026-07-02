# @benedict258/buiry

TypeScript SDK for [Buiry](https://github.com/Benedict258/Buiry) — persistent AI agent memory and dataset harvesting.

## Install

```bash
npm install @benedict258/buiry
```

## Quick Start

```typescript
import { Buiry } from 'buiry';

const buiry = new Buiry({
  apiKey: 'buiry_sk_live_...',
  projectId: 'my-project',
});

// Check backend health
const health = await buiry.healthCheck();
console.log(health); // { status: 'ok', services: { postgres: 'connected', redis: 'connected' } }

// Start a session (returns project context + past sessions)
const session = await buiry.startSession('claude-code');
console.log(session); // { project_identity, sessions, summary, next_steps }

// Search memory
const results = await buiry.recall('what approach did we take for auth?');
console.log(results); // Matching sessions

// Log a decision
await buiry.remember({
  decision: 'Use JWT for authentication',
  reason: 'Stateless, works across MCP server instances',
});
```

## LLM Wrapping

Wrap any LLM client to automatically capture interactions:

```typescript
import { Buiry } from 'buiry';
import Anthropic from '@anthropic-ai/sdk';

const buiry = new Buiry({
  apiKey: 'buiry_sk_live_...',
  projectId: 'my-project',
});

const anthropic = new Anthropic();
const llm = buiry.wrap(anthropic);

// All calls are now captured
const response = await llm.messages.create({
  model: 'claude-sonnet-4-20250514',
  messages: [{ role: 'user', content: 'Hello' }],
});
```

### Supported Adapters

| Adapter | Import | Client Type |
|---|---|---|
| `wrapAnthropic` | `buiry/adapters/anthropic` | `Anthropic` |
| `wrapOpenAI` | `buiry/adapters/openai` | `OpenAI` |
| `wrapGeneric` | `buiry/adapters/generic` | Any OpenAI-compatible |

## Configuration

```typescript
new Buiry({
  apiKey: string;        // Required: Your Buiry API key
  projectId: string;     // Required: Project identifier
  domain?: string;       // Optional: Backend URL (default: https://buiry.up.railway.app)
  capture?: boolean;     // Optional: Enable/disable interaction capture (default: true)
});
```

## API Reference

### `buiry.healthCheck()`
Returns backend health status.

### `buiry.startSession(agentId)`
Starts a new session. Returns project context, past sessions, and next steps.

### `buiry.endSession(sessionData)`
Ends the current session. Persists decisions, changes, and next steps.

### `buiry.searchContext(query, maxResults?)`
Search across all past sessions. Returns matching sessions.

### `buiry.recall(query)`
Alias for `searchContext`.

### `buiry.remember({ decision, reason })`
Logs a decision to the current session.

### `buiry.wrap(client)`
Wraps an LLM client to capture interactions. Returns a proxy.

## License

MIT
