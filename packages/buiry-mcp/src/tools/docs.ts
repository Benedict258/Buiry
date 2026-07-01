// Doc Tools — buiry_generate_docs
// Synthesizes PRD, ARCHITECTURE, or DEV_PLAN from accumulated session history.
// Uses the session data to populate document templates.

import { z } from "zod";
import { readMemory } from "../memory.js";
import type { BuildContextMemory } from "../types.js";

export const generateDocsArgs = {
  project_root: z
    .string()
    .optional()
    .describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
  doc_type: z
    .enum(["prd", "architecture", "dev_plan"])
    .describe("Type of document to generate"),
};

function buildContextSummary(memory: BuildContextMemory) {
  const allDecisions = memory.sessions.flatMap((s) =>
    s.decisions_log.map((d) => ({ ...d, session_id: s.session_id }))
  );
  const allIssues = memory.sessions.flatMap((s) =>
    s.known_issues.map((issue) => ({ issue, session_id: s.session_id }))
  );
  const allModules = memory.sessions.reduce<
    Record<string, string[]>
  >((acc, s) => {
    for (const [mod, files] of Object.entries(s.file_module_map)) {
      acc[mod] = [...(acc[mod] ?? []), ...files];
    }
    return acc;
  }, {});

  return { allDecisions, allIssues, allModules };
}

function generatePrd(memory: BuildContextMemory) {
  const latestSessions = memory.sessions.slice(-3);
  const progressNotes = latestSessions
    .map(
      (s) =>
        `- Session ${s.session_id}: ${s.current_phase} (${s.progress}%) — ${s.last_session_summary}`
    )
    .join("\n");

  const allNextSteps = [
    ...new Set(latestSessions.flatMap((s) => s.next_steps)),
  ];

  return `# Product Requirements Document

## Overview

**Project**: ${memory.project_identity.name}
**Description**: ${memory.project_identity.description}

## Current Status

${memory.summary}

## Progress from Sessions

${progressNotes || "_No session data yet._"}

## Next Steps

${allNextSteps.map((s) => `- ${s}`).join("\n") || "_None recorded._"}
`;
}

function generateArchitecture(memory: BuildContextMemory) {
  const { allDecisions, allModules } = buildContextSummary(memory);

  const moduleSection = Object.entries(allModules)
    .map(
      ([mod, files]) =>
        `### ${mod}\n\n${files.map((f) => `- \`${f}\``).join("\n")}`
    )
    .join("\n\n");

  const decisionsSection = allDecisions
    .map(
      (d) =>
        `### Decision: ${d.decision}\n\n- **Rationale**: ${d.rationale}\n- **Session**: ${d.session_id}${d.alternatives_considered ? `\n- **Alternatives**: ${d.alternatives_considered.join(", ")}` : ""}`
    )
    .join("\n\n");

  return `# Architecture

## System Overview

**Project**: ${memory.project_identity.name}

${memory.summary}

## Module Map

${moduleSection || "_No module data yet._"}

## Key Decisions

${decisionsSection || "_No decisions recorded._"}
`;
}

function generateDevPlan(memory: BuildContextMemory) {
  const latest = memory.sessions[memory.sessions.length - 1];
  const { allIssues } = buildContextSummary(memory);

  const allNextSteps = [
    ...new Set(memory.sessions.flatMap((s) => s.next_steps)),
  ];

  return `# Development Plan

## Current Phase

${latest ? `${latest.current_phase} (${latest.progress}%)` : "_No active session._"}

## Summary

${memory.summary}

## Next Steps

${allNextSteps.map((s) => `- ${s}`).join("\n") || "_None recorded._"}

## Known Issues

${allIssues.map((i) => `- [${i.session_id}] ${i.issue}`).join("\n") || "_No issues recorded._"}
`;
}

export async function handleGenerateDocs(
  args: { project_root?: string; doc_type: "prd" | "architecture" | "dev_plan" },
  detectProjectRoot: () => string
) {
  const root = args.project_root ?? detectProjectRoot();
  try {
    const memory = await readMemory(root);

    let content: string;
    switch (args.doc_type) {
      case "prd":
        content = generatePrd(memory);
        break;
      case "architecture":
        content = generateArchitecture(memory);
        break;
      case "dev_plan":
        content = generateDevPlan(memory);
        break;
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              doc_type: args.doc_type,
              session_count: memory.sessions.length,
              content,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (err) {
    return {
      content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
      isError: true,
    };
  }
}
