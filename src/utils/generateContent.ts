import { Platform } from "react-native";
import Constants from "expo-constants";

import {
  ANTHROPIC_API_URL,
  extractAnthropicText,
  parseAnthropicHttpJson,
  serializeAnthropicRequestBody
} from "./anthropicClient";
import { normalizeAnthropicApiKey } from "./anthropicApiKey";
import { devLog } from "./devLog";
import {
  buildAnthropicMessages,
  type GenerationInputs,
  type GenerationMode
} from "./promptBuilder";

export type { GenerationInputs, GenerationMode } from "./promptBuilder";

const ANTHROPIC_API_KEY = normalizeAnthropicApiKey(
  Constants.expoConfig?.extra?.anthropicApiKey
);

async function callAnthropicDirect(
  mode: GenerationMode,
  inputs: GenerationInputs
) {
  const { system, userMessage } = buildAnthropicMessages(mode, inputs);
  const requestBody = serializeAnthropicRequestBody(system, userMessage);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: requestBody
  });

  const data = await parseAnthropicHttpJson(response, "Anthropic/direct");

  if (!response.ok) {
    const record = data as Record<string, unknown>;
    const apiError = record?.error as Record<string, unknown> | undefined;
    throw new Error(
      typeof apiError?.message === "string"
        ? apiError.message
        : "Unable to generate content."
    );
  }

  return extractAnthropicText(data, "Anthropic/direct");
}

async function callAnthropicViaProxy(mode: GenerationMode, inputs: GenerationInputs) {
  let requestBody: string;

  try {
    requestBody = JSON.stringify({ mode, inputs });
    JSON.parse(requestBody);
  } catch (error) {
    devLog.error("[Anthropic/proxy] Invalid proxy request JSON:", error);
    throw new Error("Could not encode generation request as JSON.");
  }

  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: requestBody
  });

  const data = await parseAnthropicHttpJson(response, "Anthropic/proxy");

  if (!response.ok) {
    const record = data as Record<string, unknown>;
    const proxyError = record?.error as Record<string, unknown> | undefined;
    throw new Error(
      typeof proxyError?.message === "string"
        ? proxyError.message
        : "Unable to generate content."
    );
  }

  if (typeof (data as Record<string, unknown>)?.text === "string") {
    const text = (data as Record<string, unknown>).text as string;
    if (text.trim()) {
      return text;
    }
  }

  return extractAnthropicText(data, "Anthropic/proxy");
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
