#!/usr/bin/env node
/**
 * MCP Test Client — connects to @buiry/mcp via stdio and tests all 9 tools.
 * Usage: node test-mcp.js
 * Requires: npm install @buiry/mcp (or run from packages/buiry-mcp)
 */

const { spawn } = require("child_process");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "packages/buiry-mcp", "dist");
const BUIRY_MCP = path.join(BUILD_DIR, "index.js");

const API_KEY = process.env.BUIRY_API_KEY || "buiry_sk_live_dev_12345";
const CLOUD_URL = process.env.BUIRY_CLOUD_URL || "https://buiry.up.railway.app";

// Debug: show what we're testing
console.log("═══════════════════════════════════════════════");
console.log("  BUIRY MCP TEST CLIENT");
console.log("  Server:", BUIRY_MCP);
console.log("  API Key:", API_KEY ? API_KEY.slice(0, 12) + "..." : "NOT SET");
console.log("  Cloud URL:", CLOUD_URL);
console.log("═══════════════════════════════════════════════\n");

// Start MCP server as child process
const child = spawn("node", [BUIRY_MCP], {
  env: {
    ...process.env,
    BUIRY_API_KEY: API_KEY,
    BUIRY_CLOUD_URL: CLOUD_URL,
    BUIRY_PROJECT_ROOT: process.cwd(),
  },
  stdio: ["pipe", "pipe", "pipe"],
});

let buffer = "";
let requestId = 0;

// Accumulate stdout
child.stdout.on("data", (data) => {
  buffer += data.toString();
});

// Show server stderr (logs)
child.stderr.on("data", (data) => {
  const msg = data.toString().trim();
  if (msg) console.log("  [server]", msg);
});

// Send a JSON-RPC request and wait for response
function sendRequest(method, params) {
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    const request = JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params,
    });
    child.stdin.write(request + "\n");

    // Wait for response with matching id
    const check = setInterval(() => {
      // Try to find a complete JSON-RPC response in the buffer
      const lines = buffer.split("\n");
      for (let i = 0; i < lines.length; i++) {
        try {
          const msg = JSON.parse(lines[i]);
          if (msg.id === id) {
            clearInterval(check);
            // Remove consumed line from buffer
            buffer = lines.slice(i + 1).join("\n");
            resolve(msg);
            return;
          }
        } catch {}
      }
    }, 100);

    // Timeout after 15 seconds
    setTimeout(() => {
      clearInterval(check);
      reject(new Error(`Timeout waiting for ${method} response`));
    }, 15000);
  });
}

async function test() {
  // Step 1: Initialize the MCP connection
  console.log("1. Connecting to MCP server...");
  const init = await sendRequest("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "buiry-test", version: "1.0.0" },
  });
  console.log("   Server:", init.result?.serverInfo?.name, init.result?.serverInfo?.version);

  // Send initialized notification
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");

  // Step 2: List available tools
  console.log("\n2. Listing tools...");
  const tools = await sendRequest("tools/list", {});
  const toolNames = tools.result?.tools?.map((t) => t.name) || [];
  console.log("   Tools found:", toolNames.length);
  toolNames.forEach((name) => console.log("     -", name));

  // Step 3: Test buiry_init
  console.log("\n3. Testing buiry_init...");
  try {
    const initResult = await sendRequest("tools/call", {
      name: "buiry_init",
      arguments: { project_name: "mcp-test", project_description: "MCP test project" },
    });
    const content = initResult.result?.content?.[0]?.text;
    if (content) {
      const parsed = JSON.parse(content);
      console.log("   Success:", parsed.success);
      console.log("   Project ID:", parsed.project_id || "N/A");
    }
  } catch (e) {
    console.log("   Error:", e.message);
  }

  // Step 4: Test buiry_start_session
  console.log("\n4. Testing buiry_start_session...");
  try {
    const startResult = await sendRequest("tools/call", {
      name: "buiry_start_session",
      arguments: {},
    });
    const content = startResult.result?.content?.[0]?.text;
    if (content) {
      const parsed = JSON.parse(content);
      console.log("   Source:", parsed.source || "unknown");
      console.log("   Sessions:", parsed.last_5_sessions?.length || 0);
      console.log("   Open issues:", parsed.open_issues?.length || 0);
    }
  } catch (e) {
    console.log("   Error:", e.message);
  }

  // Step 5: Test buiry_end_session
  console.log("\n5. Testing buiry_end_session...");
  try {
    const sessionObj = {
      session_id: `sess_mcp_test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ai_agent: "mcp-test",
      current_phase: "Testing",
      progress: 100,
      last_session_summary: "MCP manual test session",
      changes_made: ["test-mcp.js"],
      file_module_map: {},
      decisions_log: [
        {
          timestamp: new Date().toISOString(),
          decision: "Test MCP tools",
          rationale: "Verify all 9 tools work correctly",
        },
      ],
      known_issues: ["Test issue for verification"],
      errors_encountered: [],
      next_steps: ["Verify results"],
    };
    const endResult = await sendRequest("tools/call", {
      name: "buiry_end_session",
      arguments: { session: sessionObj },
    });
    const content = endResult.result?.content?.[0]?.text;
    if (content) {
      const parsed = JSON.parse(content);
      console.log("   Success:", parsed.success);
      console.log("   Stored in:", parsed.stored_in || "unknown");
    }
  } catch (e) {
    console.log("   Error:", e.message);
  }

  // Step 6: Test buiry_log_decision
  console.log("\n6. Testing buiry_log_decision...");
  try {
    const decResult = await sendRequest("tools/call", {
      name: "buiry_log_decision",
      arguments: {
        timestamp: new Date().toISOString(),
        decision: "Use MCP for cross-agent memory",
        rationale: "Open standard, works across platforms",
        alternatives_considered: ["Custom REST API", "File-based only"],
      },
    });
    const content = decResult.result?.content?.[0]?.text;
    if (content) {
      const parsed = JSON.parse(content);
      console.log("   Success:", parsed.success);
    }
  } catch (e) {
    console.log("   Error:", e.message);
  }

  // Step 7: Test buiry_flag_issue
  console.log("\n7. Testing buiry_flag_issue...");
  try {
    const issueResult = await sendRequest("tools/call", {
      name: "buiry_flag_issue",
      arguments: { issue: "MCP test — verify all tools passed" },
    });
    const content = issueResult.result?.content?.[0]?.text;
    if (content) {
      const parsed = JSON.parse(content);
      console.log("   Success:", parsed.success);
    }
  } catch (e) {
    console.log("   Error:", e.message);
  }

  // Step 8: Test buiry_get_context
  console.log("\n8. Testing buiry_get_context...");
  try {
    const ctxResult = await sendRequest("tools/call", {
      name: "buiry_get_context",
      arguments: { query: "MCP" },
    });
    const content = ctxResult.result?.content?.[0]?.text;
    if (content) {
      const parsed = JSON.parse(content);
      console.log("   Results:", parsed.total || 0, "| Source:", parsed.source || "unknown");
    }
  } catch (e) {
    console.log("   Error:", e.message);
  }

  // Step 9: Test buiry_generate_docs
  console.log("\n9. Testing buiry_generate_docs...");
  try {
    const docResult = await sendRequest("tools/call", {
      name: "buiry_generate_docs",
      arguments: { doc_type: "prd" },
    });
    const content = docResult.result?.content?.[0]?.text;
    console.log("   Response:", content ? content.slice(0, 100) + "..." : "empty");
  } catch (e) {
    console.log("   Error:", e.message);
  }

  // Step 10: Test buiry_sync
  console.log("\n10. Testing buiry_sync...");
  try {
    const syncResult = await sendRequest("tools/call", {
      name: "buiry_sync",
      arguments: {},
    });
    const content = syncResult.result?.content?.[0]?.text;
    if (content) {
      const parsed = JSON.parse(content);
      console.log("   Synced:", parsed.synced || 0);
      console.log("   Failed:", parsed.failed || 0);
    }
  } catch (e) {
    console.log("   Error:", e.message);
  }

  // Step 11: Test buiry_execute (intent router)
  console.log("\n11. Testing buiry_execute...");
  try {
    const execResult = await sendRequest("tools/call", {
      name: "buiry_execute",
      arguments: { message: "Start a new session for testing the MCP server" },
    });
    const content = execResult.result?.content?.[0]?.text;
    if (content) {
      console.log("   Response:", content.slice(0, 100));
    }
  } catch (e) {
    console.log("   Error:", e.message);
  }

  // Done
  console.log("\n═══════════════════════════════════════════════");
  console.log("  MCP TEST COMPLETE");
  console.log("  Check output above for any errors.");
  console.log("═══════════════════════════════════════════════\n");

  child.kill();
  process.exit(0);
}

test().catch((err) => {
  console.error("Fatal test error:", err.message);
  child.kill();
  process.exit(1);
});
