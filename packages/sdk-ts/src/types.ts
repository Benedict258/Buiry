import { z } from "zod";

export const BuiryConfigSchema = z.object({
  apiKey: z.string(),
  projectId: z.string(),
  domain: z.string().default("https://api.buiry.ai"),
  capture: z.boolean().default(true),
  sampleRate: z.number().min(0).max(1).default(1),
});
export type BuiryConfig = z.infer<typeof BuiryConfigSchema>;

export const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const ToolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  arguments: z.string(),
});
export type ToolCall = z.infer<typeof ToolCallSchema>;

export const UsageSchema = z.object({
  promptTokens: z.number().optional(),
  completionTokens: z.number().optional(),
  totalTokens: z.number().optional(),
});
export type Usage = z.infer<typeof UsageSchema>;

export const DecisionTypeSchema = z.enum([
  "classification",
  "generation",
  "extraction",
  "summarization",
  "routing",
  "planning",
  "tool_use",
  "conversation",
]);
export type DecisionType = z.infer<typeof DecisionTypeSchema>;

export const InteractionPatternSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  model: z.string(),
  provider: z.string(),
  decisionType: DecisionTypeSchema,
  domainSignals: z.array(z.string()),
  inputStructure: z.record(z.unknown()),
  outputStructure: z.record(z.unknown()),
  usage: UsageSchema.optional(),
  latencyMs: z.number(),
  sessionId: z.string().optional(),
});
export type InteractionPattern = z.infer<typeof InteractionPatternSchema>;

export const MemoryEntrySchema = z.object({
  key: z.string(),
  value: z.string(),
  sessionId: z.string(),
  timestamp: z.string(),
});
export type MemoryEntry = z.infer<typeof MemoryEntrySchema>;

export interface LLMClient {
  [key: string]: unknown;
}

export interface WrappedClient<T extends LLMClient> {
  original: T;
  unwrap(): T;
}
