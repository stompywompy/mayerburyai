import { Platform } from "react-native";
import Constants from "expo-constants";

import { normalizeAnthropicApiKey } from "./anthropicApiKey";
import {
  buildAnthropicMessages,
  type GenerationInputs,
  type GenerationMode
} from "./promptBuilder";

export type { GenerationInputs, GenerationMode } from "./promptBuilder";

const ANTHROPIC_API_KEY = normalizeAnthropicApiKey(
  Constants.expoConfig?.extra?.anthropicApiKey
);
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

async function callAnthropicDirect(
  mode: GenerationMode,
  inputs: GenerationInputs
) {
  const { system, userMessage } = buildAnthropicMessages(mode, inputs);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
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
    throw new Error(data?.error?.message ?? "Unable to generate content.");
  }

  const text = data?.content?.[0]?.text;

  if (typeof text !== "string" || !text.trim()) {
    throw new Error("No content was returned by Claude.");
  }

  return text;
}

async function callAnthropicViaProxy(mode: GenerationMode, inputs: GenerationInputs) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, inputs })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message ?? "Unable to generate content.");
  }

  if (typeof data?.text !== "string" || !data.text.trim()) {
    throw new Error("No content was returned by Claude.");
  }

  return data.text;
}

export async function generateContent(
  mode: GenerationMode,
  inputs: GenerationInputs
) {
  try {
    if (Platform.OS === "web") {
      return await callAnthropicViaProxy(mode, inputs);
    }

    if (!ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY is not configured. Add it to your environment before building."
      );
    }

    return await callAnthropicDirect(mode, inputs);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        Platform.OS === "web"
          ? "Network request failed. Redeploy the app with the API route and ANTHROPIC_API_KEY set on Vercel."
          : "Network request failed. Check your connection and try again."
      );
    }

    throw error;
  }
}
