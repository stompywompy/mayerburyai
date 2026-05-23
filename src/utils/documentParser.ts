import type { ItemChoice } from "./questionChoices";

export type DocumentBlock =
  | { type: "paragraph"; text: string }
  | { type: "item"; text: string; number?: number; choices?: ItemChoice[] }
  | { type: "answerKey"; lines: string[] }
  | { type: "rubric"; rows: RubricRow[] };

export type RubricRow = {
  criteria: string;
  points: string;
  description: string;
};

export type DocumentSection = {
  title: string;
  blocks: DocumentBlock[];
};

export type ParsedDocument = {
  title: string;
  sections: DocumentSection[];
};

const SECTION_RE = /^\[SECTION:\s*(.+?)\s*\]$/i;
const TITLE_RE = /^\[DOCUMENT TITLE:\s*(.+?)\s*\]$/i;
const ITEM_RE = /^\[ITEM\]\s*(.*)$/i;
const CHOICE_RE = /^\[CHOICE\]\s*([A-E])[).:\s-]*\s*(.*)$/i;
const RUBRIC_ROW_RE = /^\[RUBRIC ROW:\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\]$/i;
const RAW_DELIMITER_RE = /^\[[A-Z][A-Z\s:_|.-]*\]$/;

function safeMatch(line: string, pattern: RegExp) {
  try {
    return line.match(pattern);
  } catch (error) {
    console.warn("[documentParser] RegExp match failed:", error, pattern);
    return null;
  }
}

function pushParagraph(sections: DocumentSection[], sectionIndex: number, paragraph: string[]) {
  const text = paragraph.join(" ").replace(/\s+/g, " ").trim();
  if (!text) {
    return;
  }

  sections[sectionIndex].blocks.push({ type: "paragraph", text });
}

function ensureSection(sections: DocumentSection[]) {
  if (sections.length === 0) {
    sections.push({ title: "Generated Content", blocks: [] });
  }
}

function appendChoiceToLastItem(
  sections: DocumentSection[],
  sectionIndex: number,
  letter: string,
  text: string
) {
  if (sectionIndex < 0) {
    return;
  }

  const blocks = sections[sectionIndex].blocks;
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    const block = blocks[index];
    if (block.type === "item") {
      const existing = block.choices ?? [];
      blocks[index] = {
        ...block,
        choices: [...existing, { letter: letter.toUpperCase(), text }]
      };
      return;
    }
  }
}

function createFallbackDocument(raw: string, reason?: unknown): ParsedDocument {
  if (reason) {
    console.warn("[documentParser] Using fallback layout:", reason);
  }

  const trimmed = raw.trim();
  const title =
    trimmed.match(/^\[DOCUMENT TITLE:\s*(.+?)\s*\]/i)?.[1]?.trim() ??
    "Generated Document";

  return {
    title,
    sections: [
      {
        title: "Generated Content",
        blocks: trimmed
          ? [{ type: "paragraph", text: trimmed }]
          : [{ type: "paragraph", text: "No content was returned." }]
      }
    ]
  };
}

function parseStructuredDocumentInternal(raw: string): ParsedDocument {
  const lines = raw.split(/\r?\n/);
  const sections: DocumentSection[] = [];
  let title = "Generated Document";
  let currentSectionIndex = -1;
  let paragraphBuffer: string[] = [];
  let answerKeyBuffer: string[] | null = null;
  let rubricRowsBuffer: RubricRow[] | null = null;
  let itemCounter = 0;

  const flushParagraph = () => {
    if (currentSectionIndex < 0) {
      ensureSection(sections);
      currentSectionIndex = 0;
    }

    pushParagraph(sections, currentSectionIndex, paragraphBuffer);
    paragraphBuffer = [];
  };

  const flushAnswerKey = () => {
    if (!answerKeyBuffer || answerKeyBuffer.length === 0) {
      answerKeyBuffer = null;
      return;
    }

    ensureSection(sections);
    if (currentSectionIndex < 0) {
      currentSectionIndex = 0;
    }

    sections[currentSectionIndex].blocks.push({
      type: "answerKey",
      lines: answerKeyBuffer
    });
    answerKeyBuffer = null;
  };

  const flushRubric = () => {
    if (!rubricRowsBuffer || rubricRowsBuffer.length === 0) {
      rubricRowsBuffer = null;
      return;
    }

    ensureSection(sections);
    if (currentSectionIndex < 0) {
      currentSectionIndex = 0;
    }

    sections[currentSectionIndex].blocks.push({
      type: "rubric",
      rows: rubricRowsBuffer
    });
    rubricRowsBuffer = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    const titleMatch = safeMatch(trimmed, TITLE_RE);
    if (titleMatch?.[1]) {
      flushParagraph();
      flushAnswerKey();
      flushRubric();
      title = titleMatch[1].trim();
      continue;
    }

    const sectionMatch = safeMatch(trimmed, SECTION_RE);
    if (sectionMatch?.[1]) {
      flushParagraph();
      flushAnswerKey();
      flushRubric();
      sections.push({ title: sectionMatch[1].trim(), blocks: [] });
      currentSectionIndex = sections.length - 1;
      itemCounter = 0;
      continue;
    }

    if (/^\[ANSWER KEY\]$/i.test(trimmed)) {
      flushParagraph();
      flushRubric();
      answerKeyBuffer = [];
      continue;
    }

    if (/^\[RUBRIC\]$/i.test(trimmed)) {
      flushParagraph();
      flushAnswerKey();
      rubricRowsBuffer = [];
      continue;
    }

    const rubricRowMatch = safeMatch(trimmed, RUBRIC_ROW_RE);
    if (rubricRowMatch?.[1] && rubricRowsBuffer) {
      rubricRowsBuffer.push({
        criteria: rubricRowMatch[1].trim(),
        points: rubricRowMatch[2].trim(),
        description: rubricRowMatch[3].trim()
      });
      continue;
    }

    const itemMatch = safeMatch(trimmed, ITEM_RE);
    if (itemMatch) {
      flushParagraph();
      flushAnswerKey();
      flushRubric();
      ensureSection(sections);
      if (currentSectionIndex < 0) {
        currentSectionIndex = 0;
      }

      itemCounter += 1;
      sections[currentSectionIndex].blocks.push({
        type: "item",
        text: itemMatch[1]?.trim() ?? "",
        number: itemCounter,
        choices: []
      });
      continue;
    }

    const choiceMatch = safeMatch(trimmed, CHOICE_RE);
    if (choiceMatch?.[1]) {
      appendChoiceToLastItem(
        sections,
        currentSectionIndex,
        choiceMatch[1],
        choiceMatch[2]?.trim() ?? ""
      );
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      if (answerKeyBuffer) {
        answerKeyBuffer.push("");
      }
      continue;
    }

    if (answerKeyBuffer) {
      if (!RAW_DELIMITER_RE.test(trimmed)) {
        answerKeyBuffer.push(trimmed);
      }
      continue;
    }

    if (rubricRowsBuffer) {
      const fallback = trimmed.replace(/^[-*]\s*/, "");
      const cells = fallback.split("|").map((cell) => cell.trim()).filter(Boolean);
      if (cells.length >= 3) {
        rubricRowsBuffer.push({
          criteria: cells[0],
          points: cells[1],
          description: cells.slice(2).join(" | ")
        });
      } else if (fallback) {
        rubricRowsBuffer.push({
          criteria: fallback,
          points: "-",
          description: "-"
        });
      }
      continue;
    }

    if (RAW_DELIMITER_RE.test(trimmed)) {
      continue;
    }

    paragraphBuffer.push(trimmed);
  }

  flushParagraph();
  flushAnswerKey();
  flushRubric();

  if (sections.length === 0) {
    const body = raw.trim();
    if (body) {
      sections.push({
        title: "Generated Content",
        blocks: [{ type: "paragraph", text: body }]
      });
    } else {
      sections.push({ title: "Generated Content", blocks: [] });
    }
  }

  return { title, sections };
}

export function parseStructuredDocument(raw: string): ParsedDocument {
  if (typeof raw !== "string") {
    console.error("[documentParser] Expected string input, received:", typeof raw);
    return createFallbackDocument("", "non-string input");
  }

  try {
    return parseStructuredDocumentInternal(raw);
  } catch (error) {
    console.error("[documentParser] Parse failed; returning fallback document:", error);
    return createFallbackDocument(raw, error);
  }
}
