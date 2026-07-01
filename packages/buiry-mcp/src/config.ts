import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface BuiryConfig {
  projectId: string;
  apiKey: string;
  dataset_capture: boolean;
  max_sessions_in_context: number;
}

const DEFAULTS: BuiryConfig = {
  projectId: "",
  apiKey: "",
  dataset_capture: true,
  max_sessions_in_context: 20,
};

export async function readConfig(projectRoot: string): Promise<BuiryConfig> {
  const configPath = join(projectRoot, ".buiry", "config.json");
  try {
    const raw = await readFile(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}
