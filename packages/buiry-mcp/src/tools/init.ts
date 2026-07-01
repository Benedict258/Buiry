// Init Tools — buiry_init
// Generates the complete Buiry file structure for a new project.
// Creates: Build-Context-Memory.json, AI_Starter.md, PRD.md, ARCHITECTURE.md, DEV_PLAN.md

import { z } from "zod";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const MEMORY_TEMPLATE = {
  $schema: "https://buiry.dev/schemas/Build-Context-Memory.json",
  project_identity: {
    name: "PROJECT_NAME",
    description: "PROJECT_DESCRIPTION",
  },
  summary: "No sessions yet.",
  sessions: [],
};

const AI_STARTER_TEMPLATE = `# AI Starter

This file provides context for AI agents working on this project.

## Project Identity

- **Name**: PROJECT_NAME
- **Description**: PROJECT_DESCRIPTION

## How to Use Buiry

1. At the start of each session, call \`buiry_start_session\` to get context.
2. At the end of each session, call \`buiry_end_session\` with the session data.
3. Use \`buiry_get_context\` to search across session history.
4. Use \`buiry_log_decision\` to record architectural decisions mid-session.
5. Use \`buiry_flag_issue\` to flag problems discovered during work.

## Session Data Format

See \`Build-Context-Memory.json\` for the schema.
`;

const PRD_TEMPLATE = `# Product Requirements Document

## Overview

<!-- Fill in from accumulated session context -->

## User Stories

<!-- Derived from session progress -->

## Success Criteria

<!-- Derived from session metrics and goals -->
`;

const ARCHITECTURE_TEMPLATE = `# Architecture

## System Overview

<!-- Fill in from accumulated session context -->

## Module Map

<!-- Derived from session file_module_map data -->

## Key Decisions

<!-- Derived from session decisions_log entries -->
`;

const DEV_PLAN_TEMPLATE = `# Development Plan

## Current Phase

<!-- Fill in from latest session current_phase -->

## Next Steps

<!-- Derived from latest session next_steps -->

## Known Issues

<!-- Derived from accumulated known_issues across sessions -->
`;

export const initArgs = {
  project_root: z
    .string()
    .optional()
    .describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
  project_name: z.string().min(1).describe("Name of the project"),
  project_description: z
    .string()
    .min(1)
    .describe("Short description of the project"),
};

export async function handleInit(
  args: {
    project_root?: string;
    project_name: string;
    project_description: string;
  },
  detectProjectRoot: () => string
) {
  const root = args.project_root ?? detectProjectRoot();
  try {
    await mkdir(join(root, ".buiry"), { recursive: true });

    const memory = {
      ...MEMORY_TEMPLATE,
      project_identity: {
        name: args.project_name,
        description: args.project_description,
      },
    };

    const aiStarter = AI_STARTER_TEMPLATE.replace(
      /PROJECT_NAME/g,
      args.project_name
    ).replace(/PROJECT_DESCRIPTION/g, args.project_description);

    const files: Record<string, string> = {
      "Build-Context-Memory.json": JSON.stringify(memory, null, 2) + "\n",
      "AI_Starter.md": aiStarter,
      "PRD.md": PRD_TEMPLATE,
      "ARCHITECTURE.md": ARCHITECTURE_TEMPLATE,
      "DEV_PLAN.md": DEV_PLAN_TEMPLATE,
    };

    for (const [filename, content] of Object.entries(files)) {
      await writeFile(join(root, filename), content, "utf-8");
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              success: true,
              project_root: root,
              files_created: Object.keys(files),
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
