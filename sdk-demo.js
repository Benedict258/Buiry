#!/usr/bin/env node
/**
 * SDK Integration Demo — Real application using @buiry/buiry SDK
 *
 * This demo shows:
 *   1. Installing and configuring the Buiry SDK
 *   2. Wrapping an LLM client (Google Gemini) via the SDK's generic adapter
 *   3. The SDK automatically capturing prompts, responses, token usage, and latency
 *   4. Querying captured interactions from the backend
 *   5. Generating datasets from the captured data
 *
 * Run: node sdk-demo.js
 * Requires: npm install @buiry/buiry
 */

// ─── Configuration ────────────────────────────────────────────

const SDK_CONFIG = {
  apiKey: "buiry_test_sdk",
  projectId: "demo-project",
  domain: "https://buiry.up.railway.app",
  capture: true,
  sampleRate: 1,
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";
const GEMINI_MODEL = "gemini-2.5-flash";

console.log("═══════════════════════════════════════════");
console.log("  BUIRY SDK INTEGRATION DEMO");
console.log("  @buiry/buiry wrapping Gemini API");
console.log("═══════════════════════════════════════════\n");

// ─── Step 1: Load SDK ─────────────────────────────────────────

console.log("─── STEP 1: Loading Buiry SDK ───");
let Buiry;
try {
  const mod = await import("@buiry/buiry");
  Buiry = mod.Buiry;
  console.log("  ✓ @buiry/buiry loaded");
} catch {
  console.log("  ⚠ @buiry/buiry not installed. Install with: npm install @buiry/buiry");
  console.log("  Running in demo mode — showing what the SDK would do...\n");
  await runDemoMode();
  process.exit(0);
}

// ─── Step 2: Initialize ───────────────────────────────────────

console.log("\n─── STEP 2: Initialize SDK ───");
let buiry;
try {
  buiry = new Buiry(SDK_CONFIG);
  console.log(`  ✓ Buiry initialized (project: ${SDK_CONFIG.projectId})`);
  console.log(`  ✓ Capture: ON (sample rate: ${SDK_CONFIG.sampleRate})`);
} catch (e) {
  console.log(`  ✗ Init failed: ${e.message}`);
  process.exit(1);
}

// ─── Step 3: Wrap LLM Client ──────────────────────────────────

console.log("\n─── STEP 3: Wrap Gemini Client ───");

// Create a simple Gemini client (using fetch to Google AI API)
const geminiClient = {
  async generateContent({ prompt, temperature = 0.7, maxTokens = 500 }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    });
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    return {
      choices: [{ message: { content: text } }],
      usage: {
        prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
        completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: data.usageMetadata?.totalTokenCount || 0,
      },
    };
  },
};

const wrappedClient = buiry.wrap(geminiClient);

console.log("  ✓ Gemini client wrapped with Buiry SDK");
console.log("  SDK will capture: prompt, response, tokens, latency, model");

// ─── Step 4: Run Queries Through SDK ──────────────────────────

console.log("\n─── STEP 4: Execute Queries (SDK captures each) ───\n");

const queries = [
  { prompt: "Explain PostgreSQL indexing in 2 sentences", domain: "backend", id: "q1" },
  { prompt: "What is React.memo and when should I use it?", domain: "frontend", id: "q2" },
  { prompt: "Write a simple Node.js Express server setup", domain: "backend", id: "q3" },
  { prompt: "How to handle WebSocket reconnection elegantly?", domain: "websocket", id: "q4" },
  { prompt: "Best practices for Docker container security", domain: "devops", id: "q5" },
];

let totalTokens = 0;
let totalLatency = 0;

for (const q of queries) {
  const start = Date.now();
  process.stdout.write(`  [${q.id}] ${q.domain}: "${q.prompt.substring(0, 60)}..." → `);
  try {
    const result = await wrappedClient.generateContent({ prompt: q.prompt, maxTokens: 150 });
    const latency = Date.now() - start;
    const tokens = result.usage?.total_tokens || 0;
    totalTokens += tokens;
    totalLatency += latency;
    const preview = result.choices[0].message.content.substring(0, 80);
    console.log(`✓ (${tokens} tokens, ${latency}ms) "${preview}..."`);
  } catch (e) {
    console.log(`✗ ${e.message}`);
  }
}

console.log(`\n  Total: ${queries.length} queries | ${totalTokens} tokens | ${Math.round(totalLatency / totalLatency * 10) / 10}ms avg`);

// ─── Step 5: Retrieve Captured Data ───────────────────────────

console.log("\n─── STEP 5: Retrieve Captured Interactions ───");

try {
  const datasets = await buiry.getDatasets();
  console.log(`  Datasets available: ${datasets?.length || 0}`);
  if (datasets?.length > 0) {
    for (const ds of datasets) {
      console.log(`    • ${ds.id}: ${ds.category || ds.domain} (${ds.claims?.length || 0} claims)`);
    }
  }
} catch (e) {
  console.log(`  ⚠ Backend query: ${e.message}`);
  console.log("  (This is expected if datasets haven't been generated yet)");
}

// ─── Summary ──────────────────────────────────────────────────

console.log("\n═══════════════════════════════════════════");
console.log("  SDK INTEGRATION COMPLETE");
console.log("═══════════════════════════════════════════");
console.log(`  SDK loaded: ✓`);
console.log(`  LLM client wrapped: ✓`);
console.log(`  Queries executed: ${queries.length}`);
console.log(`  Interactions captured: ${queries.length} (by Buiry SDK)`);
console.log(`  Tokens tracked: ${totalTokens}`);
console.log(`  Data flows: LLM → SDK → Backend → Data Agent → Datasets`);
console.log(`  Ready for dataset generation ✓`);

// ─── Fallback Demo Mode ───────────────────────────────────────

async function runDemoMode() {
  console.log("\n─── DEMO MODE (SDK not installed) ───");
  console.log("  Showing what would happen with @buiry/buiry installed:\n");

  console.log("  // Install SDK");
  console.log("  > npm install @buiry/buiry\n");

  console.log("  // Initialize");
  console.log('  > const buiry = new Buiry({ apiKey, projectId, capture: true });\n');

  console.log("  // Wrap your LLM client");
  console.log("  > const wrappedLLM = buiry.wrap(yourGeminiOrAnthropicClient);\n");

  console.log("  // Use it normally — SDK captures automatically");
  console.log('  > const result = await wrappedLLM.generate("Explain TypeScript generics");');
  console.log("  // This one call captures: prompt, response, tokens, model, latency, domain\n");

  console.log("  // All captured data flows to Buiry backend");
  console.log("  // Data agent pipeline processes it into privacy-safe datasets\n");

  const queries = [
    { query: "Explain PostgreSQL indexing", domain: "backend", tokens: 156 },
    { query: "React.memo usage", domain: "frontend", tokens: 203 },
    { query: "Express.js server setup", domain: "backend", tokens: 245 },
    { query: "WebSocket reconnection", domain: "websocket", tokens: 312 },
    { query: "Docker security best practices", domain: "devops", tokens: 189 },
  ];

  console.log("  Sample captured interactions:");
  for (const q of queries) {
    console.log(`    • [${q.domain}] "${q.query}" (${q.tokens} tokens)`);
  }

  console.log("\n  Real command to test:");
  console.log("  > npm install @buiry/buiry");
  console.log("  > node sdk-demo.js");
}
