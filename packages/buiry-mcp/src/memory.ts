import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { BuildContextMemorySchema } from "./types.js";
import type { BuildContextMemory, SessionObject } from "./types.js";

const MEMORY_FILENAME = "Build-Context-Memory.json";

export async function readMemory(
  projectRoot: string
): Promise<BuildContextMemory> {
  const filePath = join(projectRoot, MEMORY_FILENAME);
  let raw: string;
  try {
    raw = await readFile(filePath, "utf-8");
  } catch (err) {
    throw new Error(
      `Failed to read ${MEMORY_FILENAME} at ${filePath}: ${(err as Error).message}`
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`${MEMORY_FILENAME} is not valid JSON`);
  }
  const result = BuildContextMemorySchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid ${MEMORY_FILENAME}: ${issues}`);
  }
  return result.data;
}

export async function writeMemory(
  projectRoot: string,
  memory: BuildContextMemory
): Promise<void> {
  const filePath = join(projectRoot, MEMORY_FILENAME);
  const json = JSON.stringify(memory, null, 2) + "\n";
  await writeFile(filePath, json, "utf-8");
}

export function searchMemory(
  memory: BuildContextMemory,
  query: string
): SessionObject[] {
  const q = query.toLowerCase();
  return memory.sessions.filter((session) => {
    const blob = JSON.stringify(session).toLowerCase();
    return blob.includes(q);
  });
}
