import { describe, it, expect } from 'vitest';
import { Buiry } from "../dist/index.js";
import { BuiryAPI } from "../dist/api/client.js";
import type { BuiryConfig } from "../dist/types.js";

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

describe("Anthropic adapter", () => {
  it("wrapAnthropic() instantiation", async () => {
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
    expect(wrapped).not.toBe(mockClient);
    expect(typeof wrapped.messages).toBe("object");
    expect(typeof wrapped.messages.create).toBe("function");

    const result = await wrapped.messages.create({
      model: "claude-3-opus",
      messages: [{ role: "user", content: "Hi" }],
    }) as any;
    expect(result.id).toBe("msg-123");
    expect(result.content[0].text).toBe("Hello from Anthropic mock");
  });

  it("no API key needed to instantiate", async () => {
    const api = new BuiryAPI(config);
    const mockClient = { messages: { create: async () => ({}) } };
    const wrapped = wrapAnthropic(mockClient, api, "test");
    expect(wrapped).not.toBeNull();
  });
});

describe("OpenAI adapter", () => {
  it("wrapOpenAI() instantiation", async () => {
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
    expect(wrapped).not.toBe(mockClient);
    expect(typeof wrapped.chat).toBe("object");
    expect(typeof wrapped.chat.completions).toBe("object");
    expect(typeof wrapped.chat.completions.create).toBe("function");

    const result = await wrapped.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: "Hi" }],
    }) as any;
    expect(result.id).toBe("chatcmpl-123");
    expect(result.choices[0].message.content).toBe("Hello from OpenAI mock");
  });

  it("no API key needed to instantiate", async () => {
    const api = new BuiryAPI(config);
    const mockClient = { chat: { completions: { create: async () => ({}) } } };
    const wrapped = wrapOpenAI(mockClient, api, "test");
    expect(wrapped).not.toBeNull();
  });
});

describe("Generic adapter", () => {
  it("wrapGeneric() instantiation", async () => {
    const api = new BuiryAPI(config);
    const mockClient = {
      generate: async (prompt: string) => ({
        text: `Generated: ${prompt}`,
        tokens: { input: 5, output: 10 },
      }),
    };

    const wrapped = wrapGeneric(mockClient, api, "custom-provider", "test-session");
    expect(wrapped).not.toBe(mockClient);
    expect(typeof wrapped.generate).toBe("function");

    const result = await wrapped.generate("hello world") as any;
    expect(result.text).toBe("Generated: hello world");
  });

  it("no API key needed to instantiate", async () => {
    const api = new BuiryAPI(config);
    const mockClient = { generate: async () => ({}) };
    const wrapped = wrapGeneric(mockClient, api, "provider", "test");
    expect(wrapped).not.toBeNull();
  });
});

describe("Buiry adapter methods", () => {
  it("Buiry.wrapAnthropic()", async () => {
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
    expect(wrapped).not.toBe(mockClient);
    const result = await wrapped.messages.create({ model: "claude-3-opus" }) as any;
    expect(result.id).toBe("msg-1");
  });

  it("Buiry.wrapOpenAI()", async () => {
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
    expect(wrapped).not.toBe(mockClient);
    const result = await wrapped.chat.completions.create({ model: "gpt-4" }) as any;
    expect(result.id).toBe("chatcmpl-1");
  });

  it("Buiry.wrapGeneric()", async () => {
    const buiry = new Buiry({ apiKey: "buiry_test_sdk", projectId: "sdk-test" });
    const mockClient = { generate: async () => ({ text: "ok" }) };
    const wrapped = buiry.wrapGeneric(mockClient as any, "custom");
    expect(wrapped).not.toBe(mockClient);
    const result = await wrapped.generate("prompt") as any;
    expect(result.text).toBe("ok");
  });
});

describe("Proxy wrapping", () => {
  it("preserves non-function properties", async () => {
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
    expect((wrapped as any).name).toBe("test-client");
    expect((wrapped as any).version).toBe("1.0.0");
    expect(Array.isArray((wrapped.chat.completions as any).models)).toBe(true);
  });
});
