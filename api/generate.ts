import { normalizeAnthropicApiKey } from "../src/utils/anthropicApiKey";
import {
  buildAnthropicMessages,
  type GenerationInputs,
  type GenerationMode
} from "../src/utils/promptBuilder";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

type VercelRequest = {
  method?: string;
  body?: { mode?: GenerationMode; inputs?: GenerationInputs };
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const apiKey = normalizeAnthropicApiKey(process.env.ANTHROPIC_API_KEY);
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: { message: "ANTHROPIC_API_KEY is not configured on Vercel." } });
  }

  const { mode, inputs } = req.body ?? {};
  if (!mode || !inputs) {
    return res.status(400).json({ error: { message: "Missing mode or inputs." } });
  }

  const { system, userMessage } = buildAnthropicMessages(mode, inputs);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 8192,
      system,
      messages: [{ role: "user", content: userMessage }]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json(data);
  }

  const text = data?.content?.[0]?.text;
  if (typeof text !== "string" || !text.trim()) {
    return res
      .status(502)
      .json({ error: { message: "No content was returned by Claude." } });
  }

  return res.status(200).json({ text });
}
