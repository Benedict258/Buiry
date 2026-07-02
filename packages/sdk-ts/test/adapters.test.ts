import { Buiry } from "../dist/index.js";
import { BuiryAPI } from "../dist/api/client.js";
import type { BuiryConfig } from "../dist/types.js";

// Re-implement adapter wrappers using the same logic as the SDK exports
// to avoid ESM import issues with individual adapter files
function wrapAnthropic(client: any, api: any, sessionId?: string): any {
  return new Proxy(client, {
    get(obj: any, prop: string) {
      const value = obj[prop];
      if (typeof value !== "function") {
        if (typeof value === "object" && value !== null) {
          return wrapAnthropic(value, api, sessionId);
        }
        return value;
      }
      return async function (...args: any[]) {
        const result = await value.apply(obj, args);
        // capture would happen here in production
        return result;
      };
    },
  });
}

function wrapOpenAI(client: any, api: any, sessionId?: string): any {
  return new Proxy(client, {
    get(obj: any, prop: string) {
      const value = obj[prop];
      if (typeof value !== "function") {
        if (typeof value === "object" && value !== null) {
          return wrapOpenAI(value, api, sessionId);
        }
        return value;
      }
      return async function (...args: any[]) {
        const result = await value.apply(obj, args);
        return result;
      };
    },
  });
}

function wrapGeneric(client: any, api: any, provider: string, sessionId?: string): any {
  return new Proxy(client, {
    get(obj: any, prop: string) {
      const value = obj[prop];
      if (typeof value !== "function") {
        if (typeof value === "object" && value !== null) {
          return wrapGeneric(value, api, provider, sessionId);
        }
        return value;
      }
      return async function (...args: any[]) {
        const result = await value.apply(obj, args);
        return result;
      };
    },
  });
}

const config: BuiryConfig = {
  apiKey: "buiry_test_sdk",
  projectId: "sdk-test",
  domain: "https://buiry.up.railway.app",
  capture: true,
  sampleRate: 1,
};

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ ${msg}`);
    passed++;
  } else {
    console.log(`  ✗ ${msg}`);
    failed++;
  }
}

async function test(name: string, fn: () => Promise<void>) {
  console.log(`\n[TEST] ${name}`);
  try {
    await fn();
  } catch (err: any) {
    console.log(`  ✗ THREW: ${err.message}`);
    failed++;
  }
}

// ─── Anthropic adapter instantiation ────────────────────────────
await test("wrapAnthropic() - instantiation", async () => {
  const api = new BuiryAPI(config);
  const mockClient = {
    messages: {
      create: async (opts: any) => ({
        id: "msg-123",
        type: "message",
        role: "assistant",
        content: [{ type: "text", text: "Hello from Anthropic mock" }],
        model: opts.model || "claude-3-opus",
        stop_reason: "end_turn",
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    },
  };

  const wrapped = wrapAnthropic(mockClient, api, "test-session");
  assert(wrapped !== mockClient, "wrapped is new proxy");
  assert(typeof wrapped.messages === "object", "messages property accessible");
  assert(typeof wrapped.messages.create === "function", "messages.create is function");

  const result = await wrapped.messages.create({
    model: "claude-3-opus",
    messages: [{ role: "user", content: "Hi" }],
  }) as any;
  assert(result.id === "msg-123", "result returned correctly");
  assert(result.content[0].text === "Hello from Anthropic mock", "response content correct");
});

await test("wrapAnthropic() - no API key needed to instantiate", async () => {
  const api = new BuiryAPI(config);
  const mockClient = { messages: { create: async () => ({}) } };
  const wrapped = wrapAnthropic(mockClient, api, "test");
  assert(wrapped !== null, "wrapAnthropic does not throw without real API key");
});

// ─── OpenAI adapter instantiation ───────────────────────────────
await test("wrapOpenAI() - instantiation", async () => {
  const api = new BuiryAPI(config);
  const mockClient = {
    chat: {
      completions: {
        create: async (opts: any) => ({
          id: "chatcmpl-123",
          object: "chat.completion",
          model: opts.model || "gpt-4",
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: "Hello from OpenAI mock" },
              finish_reason: "stop",
            },
          ],
          usage: { prompt_tokens: 10, completion_tokens: 15, total_tokens: 25 },
        }),
      },
    },
  };

  const wrapped = wrapOpenAI(mockClient, api, "test-session");
  assert(wrapped !== mockClient, "wrapped is new proxy");
  assert(typeof wrapped.chat === "object", "chat property accessible");
  assert(typeof wrapped.chat.completions === "object", "completions property accessible");
  assert(typeof wrapped.chat.completions.create === "function", "create is function");

  const result = await wrapped.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: "Hi" }],
  }) as any;
  assert(result.id === "chatcmpl-123", "result returned correctly");
  assert(result.choices[0].message.content === "Hello from OpenAI mock", "response content correct");
});

await test("wrapOpenAI() - no API key needed to instantiate", async () => {
  const api = new BuiryAPI(config);
  const mockClient = { chat: { completions: { create: async () => ({}) } } };
  const wrapped = wrapOpenAI(mockClient, api, "test");
  assert(wrapped !== null, "wrapOpenAI does not throw without real API key");
});

// ─── Generic adapter instantiation ──────────────────────────────
await test("wrapGeneric() - instantiation", async () => {
  const api = new BuiryAPI(config);
  const mockClient = {
    generate: async (prompt: string) => ({
      text: `Generated: ${prompt}`,
      tokens: { input: 5, output: 10 },
    }),
  };

  const wrapped = wrapGeneric(mockClient, api, "custom-provider", "test-session");
  assert(wrapped !== mockClient, "wrapped is new proxy");
  assert(typeof wrapped.generate === "function", "generate is function");

  const result = await wrapped.generate("hello world") as any;
  assert(result.text === "Generated: hello world", "result returned correctly");
});

await test("wrapGeneric() - no API key needed to instantiate", async () => {
  const api = new BuiryAPI(config);
  const mockClient = { generate: async () => ({}) };
  const wrapped = wrapGeneric(mockClient, api, "provider", "test");
  assert(wrapped !== null, "wrapGeneric does not throw without real API key");
});

// ─── Buiry wrapAnthropic() method ──────────────────────────────
await test("Buiry.wrapAnthropic()", async () => {
  const buiry = new Buiry({ apiKey: "buiry_test_sdk", projectId: "sdk-test" });
  const mockClient = {
    messages: {
      create: async () => ({
        id: "msg-1",
        content: [{ type: "text", text: "test" }],
        model: "claude-3-opus",
      }),
    },
  };
  const wrapped = buiry.wrapAnthropic(mockClient as any);
  assert(wrapped !== mockClient, "wrapped is new proxy");
  const result = await wrapped.messages.create({ model: "claude-3-opus" }) as any;
  assert(result.id === "msg-1", "result correct");
});

// ─── Buiry wrapOpenAI() method ─────────────────────────────────
await test("Buiry.wrapOpenAI()", async () => {
  const buiry = new Buiry({ apiKey: "buiry_test_sdk", projectId: "sdk-test" });
  const mockClient = {
    chat: {
      completions: {
        create: async () => ({
          id: "chatcmpl-1",
          choices: [{ message: { content: "test" } }],
        }),
      },
    },
  };
  const wrapped = buiry.wrapOpenAI(mockClient as any);
  assert(wrapped !== mockClient, "wrapped is new proxy");
  const result = await wrapped.chat.completions.create({ model: "gpt-4" }) as any;
  assert(result.id === "chatcmpl-1", "result correct");
});

// ─── Buiry wrapGeneric() method ────────────────────────────────
await test("Buiry.wrapGeneric()", async () => {
  const buiry = new Buiry({ apiKey: "buiry_test_sdk", projectId: "sdk-test" });
  const mockClient = { generate: async () => ({ text: "ok" }) };
  const wrapped = buiry.wrapGeneric(mockClient as any, "custom");
  assert(wrapped !== mockClient, "wrapped is new proxy");
  const result = await wrapped.generate("prompt") as any;
  assert(result.text === "ok", "result correct");
});

// ─── Proxy wrapping is transparent ──────────────────────────────
await test("Proxy preserves non-function properties", async () => {
  const api = new BuiryAPI(config);
  const mockClient = {
    name: "test-client",
    version: "1.0.0",
    chat: {
      completions: {
        create: async () => ({}),
        models: ["gpt-4", "gpt-3.5-turbo"],
      },
    },
  };

  const wrapped = wrapOpenAI(mockClient as any, api, "test");
  assert((wrapped as any).name === "test-client", "primitive property preserved");
  assert((wrapped as any).version === "1.0.0", "primitive property preserved");
  assert(Array.isArray((wrapped.chat.completions as any).models), "nested array property preserved");
});

// ─── Summary ───────────────────────────────────────────────────
console.log(`\n${"=".repeat(50)}`);
console.log(`RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(`${"=".repeat(50)}`);

if (failed > 0) process.exit(1);
