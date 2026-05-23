import { normalizeAnthropicApiKey } from "../src/utils/anthropicApiKey";
import {
  ANTHROPIC_API_URL,
  extractAnthropicText,
  parseAnthropicHttpJson,
  serializeAnthropicRequestBody
} from "../src/utils/anthropicClient";
import {
  buildAnthropicMessages,
  type GenerationInputs,
  type GenerationMode
} from "../src/utils/promptBuilder";

type VercelRequest = {
  method?: string;
  body?: { mode?: GenerationMode; inputs?: GenerationInputs } | string;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

function parseRequestBody(
  body: VercelRequest["body"]
): { mode: GenerationMode; inputs: GenerationInputs } {
  let parsedBody = body;

  if (typeof body === "string") {
    try {
      parsedBody = JSON.parse(body) as VercelRequest["body"];
    } catch (error) {
      console.error("[api/generate] Request body JSON.parse failed:", error, body);
      throw new Error("Request body is not valid JSON.");
    }
  }

  if (!parsedBody || typeof parsedBody !== "object") {
    throw new Error("Missing request body.");
  }

  const { mode, inputs } = parsedBody as {
    mode?: GenerationMode;
    inputs?: GenerationInputs;
  };

  if (!mode || !inputs) {
    throw new Error("Missing mode or inputs.");
  }

  return { mode, inputs };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  try {
    const apiKey = normalizeAnthropicApiKey(process.env.ANTHROPIC_API_KEY);
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: { message: "ANTHROPIC_API_KEY is not configured on Vercel." } });
    }

    const { mode, inputs } = parseRequestBody(req.body);
    const { system, userMessage } = buildAnthropicMessages(mode, inputs);
    const requestBody = serializeAnthropicRequestBody(system, userMessage);

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: requestBody
    });

    const data = await parseAnthropicHttpJson(response, "api/generate");

    if (!response.ok) {
      try {
        const message = extractAnthropicText(data, "api/generate-error");
        return res.status(response.status).json({ error: { message } });
      } catch {
        return res.status(response.status).json(data);
      }
    }

    const text = extractAnthropicText(data, "api/generate");
    return res.status(200).json({ text });
  } catch (error) {
    console.error("[api/generate] Handler failed:", error);
    const message =
      error instanceof Error ? error.message : "Unable to generate content.";
    return res.status(500).json({ error: { message } });
  }
}
