import Anthropic from "npm:@anthropic-ai/sdk";

export { Anthropic };

export const AI_MODEL = Deno.env.get("AI_MODEL") ?? "claude-opus-5-5";

export function aiClient() {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  return new Anthropic({ apiKey });
}

export interface GenerateOptions {
  system?: string;
  user: string;
  maxTokens?: number;
  /** JSON schema for structured output (must use additionalProperties:false + required). */
  jsonSchema?: Record<string, unknown>;
  effort?: "low" | "medium" | "high";
}

/** Thrown for refusals / truncation so callers can map them to HTTP errors. */
export class AIOutputError extends Error {}

/** Single non-streaming call; returns concatenated text. Throws on refusal or max_tokens. */
export async function generateText(opts: GenerateOptions): Promise<string> {
  const outputConfig: Record<string, unknown> = {};
  if (opts.effort) outputConfig.effort = opts.effort;
  if (opts.jsonSchema) outputConfig.format = { type: "json_schema", schema: opts.jsonSchema };

  const params: Record<string, unknown> = {
    model: AI_MODEL,
    max_tokens: opts.maxTokens ?? 16000,
    messages: [{ role: "user", content: opts.user }],
  };
  if (opts.system) params.system = opts.system;
  if (Object.keys(outputConfig).length) params.output_config = outputConfig;

  // deno-lint-ignore no-explicit-any
  const response = await aiClient().messages.create(params as any);

  if (response.stop_reason === "refusal") {
    throw new AIOutputError("The AI model refused to generate this content");
  }
  if (response.stop_reason === "max_tokens") {
    throw new AIOutputError("AI output was truncated (max_tokens reached)");
  }
  return response.content
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { type: string; text?: string }) => b.text ?? "")
    .join("");
}

/** Structured-output call: returns the parsed JSON object. */
export async function generateJSON<T>(opts: GenerateOptions & { jsonSchema: Record<string, unknown> }): Promise<T> {
  const text = await generateText(opts);
  return JSON.parse(text) as T;
}

/** Map an AI error to an HTTP status + message (429 for rate limits, 500 otherwise). */
export function aiErrorStatus(err: unknown): { status: number; message: string } {
  if (err instanceof Anthropic.RateLimitError) {
    return { status: 429, message: "Rate limits exceeded, please try again later." };
  }
  if (err instanceof Anthropic.APIError) {
    return { status: 500, message: `AI API error: ${err.message}` };
  }
  return { status: 500, message: err instanceof Error ? err.message : String(err) };
}
