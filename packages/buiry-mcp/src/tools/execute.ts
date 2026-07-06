import { z } from "zod";
import { handleStartSession } from "./session.js";
import { handleEndSession } from "./session.js";
import { handleLogDecision } from "./session.js";
import { handleFlagIssue } from "./session.js";
import { handleGetContext } from "./context.js";
import { handleInit } from "./init.js";
import { handleGenerateDocs } from "./docs.js";

type Intent =
  | "start_session"
  | "end_session"
  | "log_decision"
  | "flag_issue"
  | "get_context"
  | "generate_docs"
  | "init"
  | "none";

interface ClassifiedIntent {
  intent: Intent;
  params: Record<string, unknown>;
}

const INTENT_PATTERNS: { intent: Intent; patterns: RegExp[] }[] = [
  {
    intent: "end_session",
    patterns: [
      /\bend\s+.*\b(buiry|session)\b/i,
      /\b(?:done|finish|complete|wrap\s*up|that'?s\s*it|all\s*done|finished|wrapping\s*up)\b/i,
    ],
  },
  {
    intent: "generate_docs",
    patterns: [
      /\b(?:generate|create|write|make)\s+(?:a\s+)?(?:doc|document|PRD|architecture|dev\s*plan|documentation)\b/i,
      /\b(?:PRD|architecture\s*doc|dev\s*plan)\b/i,
    ],
  },
  {
    intent: "get_context",
    patterns: [
      /\bsearch\s+buiry\s+memory\b/i,
      /\bsearch\s+.*\b(?:buiry|memory|context|sessions?)\b/i,
      /\b(?:what\s+did\s+we|history|previous(?:ly)?|earlier|before|remember|recall|find\s+(?:any|me|the|about)|look\s+up|context\s+(?:about|for|on)|past\s+session)\b/i,
      /\b(?:do\s+we\s+have|has\s+this\s+been|have\s+we\s+(?:seen|done|tried|built))\b/i,
    ],
  },
  {
    intent: "init",
    patterns: [
      /\b(?:init(?:ialize)?|set\s*up|create\s+project|new\s+project|scaffold|bootstrap)\b.*\b(?:buiry|project)\b/i,
      /\b(?:buiry|project)\b.*\b(?:init(?:ialize)?|set\s*up|scaffold)\b/i,
    ],
  },
  {
    intent: "log_decision",
    patterns: [
      /\blog\s+(?:a\s+)?decision\b/i,
      /\bdecid(?:ed)?\b/i,
      /\b(?:cho(?:se|osing)|picked|selected|went\s+with|settled\s+on|going\s+with|will\s+use|opt\s+for)\b/i,
    ],
  },
  {
    intent: "flag_issue",
    patterns: [
      /\bflag\s+(?:an?\s+)?issue\b/i,
      /\b(?:issue|problem|blocker|bug|error|fail(?:ed|ure))\b/i,
      /^issue\s*:/i,
      /^bug\s*:/i,
      /^problem\s*:/i,
    ],
  },
  {
    intent: "start_session",
    patterns: [
      /\bstart\s+.*\b(buiry|session)\b/i,
      /\b(?:begin|new\s*session|let'?s\s*work|get\s*started|kick\s*off|starting|beginning)\b/i,
    ],
  },
];

function classifyIntent(message: string): Intent {
  const lower = message.toLowerCase().trim();

  for (const { intent, patterns } of INTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(lower)) {
        return intent;
      }
    }
  }

  return "none";
}

function extractDecision(message: string): { decision: string; rationale?: string } {
  const cleaned = message
    .replace(/^(?:log\s+(?:a\s+)?decision\s+(?:to\s+buiry\s*)?:?\s*)/i, "")
    .replace(/^(?:we\s+)?(?:decided|decide|chose|choose|picked|selected)\s+(?:to\s+)?/i, "")
    .trim();

  const rationalSplit = cleaned.split(/\s+(?:because|since|as|due\s+to)\s+/i);
  if (rationalSplit.length > 1) {
    return { decision: rationalSplit[0].trim(), rationale: rationalSplit[1].trim() };
  }

  return { decision: cleaned };
}

function extractIssue(message: string): string {
  return message
    .replace(/^(?:issue|problem|blocker|bug|error)\s*:\s*/i, "")
    .trim();
}

function extractQuery(message: string): string {
  return message
    .replace(/^search\s+buiry\s+memory\s+(?:for\s+)?/i, "")
    .replace(/^(?:what\s+did\s+we\s+)?(?:decide\s+about|do\s+about|know\s+about|search\s+for|find|look\s+up|recall|remember)\s+/i, "")
    .replace(/[?.!]$/, "")
    .trim();
}

function extractDocType(message: string): "prd" | "architecture" | "dev_plan" {
  const lower = message.toLowerCase();
  if (/\b(?:architecture|arch|system\s*design)\b/i.test(lower)) return "architecture";
  if (/\b(?:dev\s*plan|development\s*plan|roadmap)\b/i.test(lower)) return "dev_plan";
  return "prd";
}

function buildParams(intent: Intent, message: string): Record<string, unknown> {
  const now = new Date().toISOString();

  switch (intent) {
    case "start_session":
    case "end_session":
      return {};

    case "log_decision": {
      const { decision, rationale } = extractDecision(message);
      return {
        timestamp: now,
        decision,
        rationale: rationale || "No rationale provided",
      };
    }

    case "flag_issue":
      return { issue: extractIssue(message) };

    case "get_context":
      return { query: extractQuery(message) };

    case "generate_docs":
      return { doc_type: extractDocType(message) };

    case "init":
      return {};

    default:
      return {};
  }
}

export const executeArgs = {
  message: z.string().min(1).describe("Raw user message to classify and route"),
  project_root: z.string().optional().describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
};

export async function handleExecute(
  args: { message: string; project_root?: string },
  detectProjectRoot: () => string
) {
  const root = args.project_root ?? detectProjectRoot();
  const intent = classifyIntent(args.message);
  const params = buildParams(intent, args.message);

  const result = {
    intent,
    original_message: args.message,
    extracted_params: params,
  };

  if (intent === "none") {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            { ...result, action: "skipped", reason: "No Buiry intent detected" },
            null,
            2
          ),
        },
      ],
    };
  }

  try {
    let toolResult: { content: { type: string; text: string }[]; isError?: boolean };

    switch (intent) {
      case "start_session":
        toolResult = await handleStartSession({ project_root: root }, detectProjectRoot);
        break;
      case "end_session":
        toolResult = await handleEndSession(
          { project_root: root, session: {} as Record<string, unknown> },
          detectProjectRoot
        );
        break;
      case "log_decision":
        toolResult = await handleLogDecision(
          {
            project_root: root,
            timestamp: params.timestamp as string,
            decision: params.decision as string,
            rationale: params.rationale as string,
          },
          detectProjectRoot
        );
        break;
      case "flag_issue":
        toolResult = await handleFlagIssue(
          { project_root: root, issue: params.issue as string },
          detectProjectRoot
        );
        break;
      case "get_context":
        toolResult = await handleGetContext(
          { project_root: root, query: params.query as string },
          detectProjectRoot
        );
        break;
      case "generate_docs":
        toolResult = await handleGenerateDocs(
          {
            project_root: root,
            doc_type: params.doc_type as "prd" | "architecture" | "dev_plan",
          },
          detectProjectRoot
        );
        break;
      case "init":
        toolResult = await handleInit(
          {
            project_root: root,
            project_name: "Untitled",
            project_description: "No description provided",
          },
          detectProjectRoot
        );
        break;
      default:
        toolResult = {
          content: [{ type: "text" as const, text: "Unknown intent" }],
        };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              ...result,
              action: `routed_to_${intent}`,
              result: toolResult.content[0]?.text
                ? JSON.parse(toolResult.content[0].text)
                : null,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (err) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            { ...result, error: (err as Error).message },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
}
