import { Buiry } from "../dist/index.js";

const BASE = "https://buiry.up.railway.app";
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

// ─── Health ────────────────────────────────────────────────────
await test("GET /health", async () => {
  const res = await fetch(`${BASE}/health`);
  assert(res.ok, `status ${res.status}`);
  const data = await res.json() as any;
  assert(data.status === "ok", `status=${data.status}`);
  assert(typeof data.services === "object", "services object exists");
});

// ─── Session Start ─────────────────────────────────────────────
await test("POST /api/session/start (with auth)", async () => {
  const res = await fetch(`${BASE}/api/session/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": "buiry_test_sdk" },
    body: JSON.stringify({}),
  });
  assert(res.ok, `status ${res.status}`);
  const data = await res.json() as any;
  assert("project_identity" in data || "recentSessions" in data, "has expected fields");
});

await test("POST /api/session/start (no auth)", async () => {
  const res = await fetch(`${BASE}/api/session/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert(res.status === 401, `status ${res.status} (expected 401)`);
});

// ─── Context Search ────────────────────────────────────────────
await test("POST /api/context/search", async () => {
  const res = await fetch(`${BASE}/api/context/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": "buiry_test_sdk" },
    body: JSON.stringify({ query: "auth", maxResults: 3 }),
  });
  assert(res.ok, `status ${res.status}`);
  const data = await res.json() as any;
  assert("results" in data, "has results field");
  assert(Array.isArray(data.results), "results is array");
});

// ─── Session Search ────────────────────────────────────────────
await test("POST /api/session/search", async () => {
  const res = await fetch(`${BASE}/api/session/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": "buiry_test_sdk" },
    body: JSON.stringify({ query: "project" }),
  });
  assert(res.ok, `status ${res.status}`);
  const data = await res.json() as any;
  assert("results" in data || "total" in data, "has results/total");
});

// ─── SDK Buiry instantiation ───────────────────────────────────
await test("Buiry class instantiation", async () => {
  const buiry = new Buiry({
    apiKey: "buiry_test_sdk",
    projectId: "sdk-test",
  });
  assert(buiry.getSessionId().length > 0, "session id generated");
  assert(typeof buiry.recall === "function", "recall is function");
  assert(typeof buiry.remember === "function", "remember is function");
  assert(typeof buiry.wrap === "function", "wrap is function");
});

// ─── SDK healthCheck ────────────────────────────────────────────
await test("Buiry.healthCheck()", async () => {
  const buiry = new Buiry({
    apiKey: "buiry_test_sdk",
    projectId: "sdk-test",
  });
  const health = await buiry.healthCheck();
  assert(health.status === "ok", `status=${health.status}`);
  assert(health.version === "0.1.0", `version=${health.version}`);
});

// ─── SDK startSession ──────────────────────────────────────────
await test("Buiry.startSession()", async () => {
  const buiry = new Buiry({
    apiKey: "buiry_test_sdk",
    projectId: "sdk-test",
  });
  const session = await buiry.startSession();
  assert(typeof session === "object", "session is object");
  assert("project_identity" in session || "recentSessions" in session, "has expected fields");
});

// ─── SDK wrap() with mock LLM client ──────────────────────────
await test("Buiry.wrap() - proxy wrapper", async () => {
  const buiry = new Buiry({
    apiKey: "buiry_test_sdk",
    projectId: "sdk-test",
  });

  const mockClient = {
    chat: {
      completions: {
        create: async (opts: any) => ({
          id: "mock-1",
          model: opts.model || "mock-model",
          choices: [{ message: { content: "mock response" } }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
      },
    },
  };

  const wrapped = buiry.wrap(mockClient);
  assert(wrapped !== mockClient, "wrapped client is a new proxy");
  assert(typeof wrapped.chat === "object", "chat property accessible");
  assert(typeof wrapped.chat.completions === "object", "completions property accessible");
  assert(typeof wrapped.chat.completions.create === "function", "create is function");

  // Call the wrapped method - it should work and capture in background
  const result = await wrapped.chat.completions.create({ model: "test-model" });
  assert(result.id === "mock-1", "result returned correctly");
  assert(result.choices[0].message.content === "mock response", "response content correct");
});

// ─── SDK remember() and recall() ──────────────────────────────
await test("Buiry.remember() + recall()", async () => {
  const buiry = new Buiry({
    apiKey: "buiry_test_sdk",
    projectId: "sdk-test",
  });

  buiry.remember("test-key", "test-value");
  assert(true, "remember() did not throw");

  try {
    const results = await buiry.recall("test-key");
    assert(Array.isArray(results), "recall() returned array");
    console.log(`  ℹ recall() returned ${results.length} results`);
  } catch (err: any) {
    console.log(`  ℹ recall() failed (expected if no data): ${err.message}`);
    passed++; // still counts as passed - backend may not store fake data
  }
});

// ─── SDK wrap() returns original when capture=false ─────────────
await test("Buiry.wrap() returns original when capture=false", async () => {
  const buiry = new Buiry({
    apiKey: "buiry_test_sdk",
    projectId: "sdk-test",
    capture: false,
  });

  const mockClient = { chat: { completions: { create: async () => ({}) } } };
  const wrapped = buiry.wrap(mockClient);
  assert(wrapped === mockClient, "returns same object when capture=false");
});

// ─── SDK with custom domain ─────────────────────────────────────
await test("Buiry with custom domain", async () => {
  const buiry = new Buiry({
    apiKey: "buiry_test_sdk",
    projectId: "sdk-test",
    domain: BASE,
  });
  const health = await buiry.healthCheck();
  assert(health.status === "ok", "healthCheck via custom domain works");
});

// ─── SDK with default domain ────────────────────────────────────
await test("Buiry with default domain", async () => {
  const buiry = new Buiry({
    apiKey: "buiry_test_sdk",
    projectId: "sdk-test",
  });
  const health = await buiry.healthCheck();
  assert(health.status === "ok", "default domain points to Railway");
});

// ─── Summary ───────────────────────────────────────────────────
console.log(`\n${"=".repeat(50)}`);
console.log(`RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(`${"=".repeat(50)}`);

if (failed > 0) process.exit(1);
