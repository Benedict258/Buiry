# @buiry/buiry

Universal data ownership for AI applications. One SDK, zero config, full ownership.

## Install

npm install @buiry/buiry

## Usage

```js
import { Buiry } from '@buiry/buiry';

const buiry = new Buiry({ apiKey: 'buiry_sk_...' });
const wrappedLLM = buiry.wrap(myOpenAIClient);

// Use normally — every call is captured automatically
const reply = await wrappedLLM.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

## Supported Providers (14)

OpenAI, Anthropic, Google Gemini, Groq, Mistral, Cohere, xAI (Grok), DeepSeek, Together AI, Fireworks AI, Perplexity, Replicate, Ollama, Generic

Auto-detection: `buiry.wrap(client)` detects the provider automatically — no config needed.

## Backend

Requires a Buiry backend instance. Default: https://buiry.up.railway.app

## License

MIT
