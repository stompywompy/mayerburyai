const FULL_DELIMITER_LINE =
  /^\[(?:DOCUMENT TITLE|SECTION|ITEM|CHOICE|ANSWER KEY|RUBRIC(?: ROW)?)[^\]]*\]\s*$/i;

const INLINE_DELIMITER =
  /\[(?:DOCUMENT TITLE|SECTION|ITEM|CHOICE|ANSWER KEY|RUBRIC(?: ROW)?)[^\]]*\]\s*/gi;

const LEADING_ITEM_PREFIX = /^\[ITEM\]\s*/i;

/** Remove TeacherForge parser delimiters from text shown to teachers. */
export function sanitizeDisplayText(text: string): string {
  if (!text) {
    return "";
  }

  return text
    .replace(LEADING_ITEM_PREFIX, "")
    .replace(INLINE_DELIMITER, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function sanitizeDisplayLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed || FULL_DELIMITER_LINE.test(trimmed)) {
    return "";
  }

  return sanitizeDisplayText(trimmed);
}

/** First readable preview line for history cards (no raw delimiters). */
export function previewDisplayLine(text: string): string {
  const line =
    text
      .split(/\r?\n/)
      .map((entry) => sanitizeDisplayLine(entry))
      .find((entry) => entry.length > 0) ?? "";

  return line || "Generated content";
}
