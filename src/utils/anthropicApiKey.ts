/** Anthropic keys must use lowercase `sk-ant-`; trim stray quotes from env vars. */
export function normalizeAnthropicApiKey(raw: string | undefined): string {
  const key = (raw ?? "").trim().replace(/^["']|["']$/g, "");

  if (key.startsWith("Sk-ant-")) {
    return `sk-ant-${key.slice("Sk-ant-".length)}`;
  }

  return key;
}
