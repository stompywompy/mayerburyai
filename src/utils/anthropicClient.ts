/** Anthropic Messages API model — must match console-enabled model id exactly. */
export const ANTHROPIC_MODEL = "claude-sonnet-4-20250514" as const;

export const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export type AnthropicRequestBody = {
  model: typeof ANTHROPIC_MODEL;
  max_tokens: number;
  system: string;
  messages: Array<{ role: "user"; content: string }>;
};

export function buildAnthropicRequestBody(
  system: string,
  userMessage: string
): AnthropicRequestBody {
  const body: AnthropicRequestBody = {
    model: ANTHROPIC_MODEL,
    max_tokens: 8192,
    system,
    messages: [{ role: "user", content: userMessage }]
  };

  if (body.model !== "claude-sonnet-4-20250514") {
    throw new Error(`Invalid Anthropic model id: "${body.model}"`);
  }

  return body;
}

/** Validates JSON serialization before fetch (catches circular refs / bad values). */
export function serializeAnthropicRequestBody(
  system: string,
  userMessage: string
): string {
  const body = buildAnthropicRequestBody(system, userMessage);

  try {
    const json = JSON.stringify(body);
    JSON.parse(json);
    return json;
  } catch (error) {
    console.error("[Anthropic] Request body is not valid JSON:", error, body);
    throw new Error("Claude API request body could not be encoded as valid JSON.");
  }
}

function safeStringify(value: unknown, maxLength = 4000) {
  try {
    const serialized = JSON.stringify(value);
    return serialized.length > maxLength
      ? `${serialized.slice(0, maxLength)}…`
      : serialized;
  } catch {
    return String(value);
  }
}

export async function parseAnthropicHttpJson(
  response: Response,
  logLabel = "Anthropic"
): Promise<unknown> {
  const rawText = await response.text();
  console.log(`[${logLabel}] Raw HTTP response (${response.status}):`, rawText.slice(0, 4000));

  if (!rawText.trim()) {
    throw new Error("Claude API returned an empty response body.");
  }

  try {
    return JSON.parse(rawText) as unknown;
  } catch (error) {
    console.error(`[${logLabel}] JSON.parse failed:`, error);
    const message =
      error instanceof Error ? error.message : "Unknown JSON parse error";
    throw new Error(
      `Claude API response was not valid JSON (${message}). Check server logs for the raw body.`
    );
  }
}

export function extractAnthropicText(
  data: unknown,
  logLabel = "Anthropic"
): string {
  console.log(`[${logLabel}] Parsed response object:`, safeStringify(data));

  try {
    if (!data || typeof data !== "object") {
      throw new Error("Response is not a JSON object.");
    }

    const record = data as Record<string, unknown>;

    if (record.error && typeof record.error === "object") {
      const apiError = record.error as Record<string, unknown>;
      const message =
        typeof apiError.message === "string"
          ? apiError.message
          : "Claude API returned an error.";
      throw new Error(message);
    }

    const content = record.content;
    if (!Array.isArray(content) || content.length === 0) {
      throw new Error("Claude response has no content blocks.");
    }

    for (let index = 0; index < content.length; index += 1) {
      const block = content[index];
      try {
        if (!block || typeof block !== "object") {
          continue;
        }

        const blockRecord = block as Record<string, unknown>;
        const blockText = blockRecord.text;

        if (
          (blockRecord.type === "text" || blockRecord.type === undefined) &&
          typeof blockText === "string" &&
          blockText.trim()
        ) {
          return blockText;
        }
      } catch (blockError) {
        console.warn(
          `[${logLabel}] Skipping malformed content block at index ${index}:`,
          blockError,
          block
        );
      }
    }

    try {
      const firstBlock = content[0];
      if (firstBlock && typeof firstBlock === "object") {
        const legacyText = (firstBlock as Record<string, unknown>).text;
        if (typeof legacyText === "string" && legacyText.trim()) {
          console.warn(
            `[${logLabel}] Using legacy content[0].text fallback.`
          );
          return legacyText;
        }
      }
    } catch (legacyError) {
      console.warn(`[${logLabel}] content[0].text fallback failed:`, legacyError);
    }

    throw new Error("No text content was returned by Claude.");
  } catch (error) {
    console.error(`[${logLabel}] extractAnthropicText failed:`, error, data);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to read text from Claude response.");
  }
}
