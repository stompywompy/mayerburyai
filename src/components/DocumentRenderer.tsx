import type { CSSProperties } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "../theme";
import {
  parseStructuredDocument,
  type DocumentBlock,
  type DocumentSection,
  type ParsedDocument,
  type RubricRow
} from "../utils/documentParser";
import type { GenerationMode } from "../utils/generateContent";
import { devLog } from "../utils/devLog";
import { isQuestionSection, resolveItemDisplay } from "../utils/questionChoices";
import { sanitizeDisplayText } from "../utils/sanitizeDisplayText";

function safeParseDocument(content: string): ParsedDocument {
  try {
    return parseStructuredDocument(content);
  } catch (error) {
    devLog.error("[DocumentRenderer] parseStructuredDocument threw:", error);
    return parseStructuredDocument(
      `[DOCUMENT TITLE: Generated Document]\n[SECTION: Generated Content]\n${content}`
    );
  }
}

type DocumentRendererProps = {
  content: string;
  createdAt?: string;
  mode: GenerationMode;
  subject?: string;
  teacherName?: string;
};

type GradeCurveRow = {
  curvedScore: string;
  letterGrade: string;
  originalScore: string;
  studentNumber: string;
};

function formatDate(createdAt?: string) {
  const date = createdAt ? new Date(createdAt) : new Date();
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long"
  }).format(date);
}

function getModeLabel(mode: GenerationMode, subject?: string) {
  if (!subject?.trim()) {
    return mode;
  }

  return `${mode} — ${subject.trim()}`;
}

function RubricTable({ rows }: { rows: RubricRow[] }) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <View style={styles.rubricTable}>
      <View style={[styles.rubricRow, styles.rubricHeaderRow]}>
        <Text style={[styles.rubricHeaderCell, styles.rubricCriteriaCell]}>Criteria</Text>
        <Text style={[styles.rubricHeaderCell, styles.rubricPointsCell]}>Points</Text>
        <Text style={[styles.rubricHeaderCell, styles.rubricDescCell]}>Description</Text>
      </View>
      {rows.map((row, index) => (
        <View
          key={`${row.criteria}-${index}`}
          style={[styles.rubricRow, index % 2 === 1 && styles.altRow]}
        >
          <Text style={[styles.rubricCell, styles.rubricCriteriaCell]}>
            {sanitizeDisplayText(row.criteria)}
          </Text>
          <Text style={[styles.rubricCell, styles.rubricPointsCell]}>
            {sanitizeDisplayText(row.points)}
          </Text>
          <Text style={[styles.rubricCell, styles.rubricDescCell]}>
            {sanitizeDisplayText(row.description)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function findSection(sections: DocumentSection[], pattern: RegExp) {
  return sections.find((section) => pattern.test(section.title));
}

function parseGradeCurveRow(text: string, fallbackNumber: number): GradeCurveRow {
  try {
    const pipeParts = text
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean);

    if (pipeParts.length >= 4) {
      return {
        studentNumber: pipeParts[0]
          .replace(/^student\s*(number|#)?\s*[:=-]?\s*/i, "")
          .trim(),
        originalScore: pipeParts[1]
          .replace(/^original\s*score\s*[:=-]?\s*/i, "")
          .trim(),
        curvedScore: pipeParts[2]
          .replace(/^curved\s*score\s*[:=-]?\s*/i, "")
          .trim(),
        letterGrade: pipeParts[3]
          .replace(/^letter\s*grade\s*[:=-]?\s*/i, "")
          .trim()
      };
    }

    const studentNumber =
      text.match(/student\s*(?:number|#)?\s*[:=-]?\s*([a-z0-9-]+)/i)?.[1] ??
      String(fallbackNumber);
    const originalScore =
      text.match(/original(?:\s*score)?\s*[:=-]\s*([^,;]+)/i)?.[1]?.trim() ?? "-";
    const curvedScore =
      text.match(/curved(?:\s*score)?\s*[:=-]\s*([^,;]+)/i)?.[1]?.trim() ?? "-";
    const letterGrade =
      text.match(/letter(?:\s*grade)?\s*[:=-]\s*([^,;]+)/i)?.[1]?.trim() ?? "-";

    return {
      curvedScore,
      letterGrade,
      originalScore,
      studentNumber
    };
  } catch (error) {
    devLog.warn("[DocumentRenderer] parseGradeCurveRow fallback:", error, text);
    return {
      curvedScore: "-",
      letterGrade: "-",
      originalScore: "-",
      studentNumber: String(fallbackNumber)
    };
  }
}

function GradeCurveTable({ parsed }: { parsed: ParsedDocument }) {
  const scoreSection = findSection(parsed.sections, /student\s*score\s*changes/i);

  if (!scoreSection) {
    return null;
  }

  const rows = scoreSection.blocks
    .filter((block): block is { type: "item"; text: string; number?: number } => block.type === "item")
    .map((block, index) => parseGradeCurveRow(block.text, index + 1));

  if (rows.length === 0) {
    return null;
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.sectionWrap}>
        <View style={styles.sectionBand}>
          <Text style={styles.sectionTitle}>Student Score Changes</Text>
        </View>
        <div style={webTableStyles.wrap}>
          <table style={webTableStyles.table}>
            <thead>
              <tr style={webTableStyles.headerRow}>
                <th style={{ ...webTableStyles.headerCell, ...webTableStyles.studentCell }}>
                  Student Number
                </th>
                <th style={{ ...webTableStyles.headerCell, ...webTableStyles.scoreCell }}>
                  Original Score
                </th>
                <th style={{ ...webTableStyles.headerCell, ...webTableStyles.scoreCell }}>
                  Curved Score
                </th>
                <th style={{ ...webTableStyles.headerCell, ...webTableStyles.letterCell }}>
                  Letter Grade
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={`${row.studentNumber}-${index}`}
                  style={index % 2 === 1 ? webTableStyles.altRow : undefined}
                >
                  <td style={{ ...webTableStyles.cell, ...webTableStyles.studentCell }}>
                    {row.studentNumber}
                  </td>
                  <td style={{ ...webTableStyles.cell, ...webTableStyles.scoreCell }}>
                    {row.originalScore}
                  </td>
                  <td style={{ ...webTableStyles.cell, ...webTableStyles.scoreCell }}>
                    {row.curvedScore}
                  </td>
                  <td style={{ ...webTableStyles.cell, ...webTableStyles.letterCell }}>
                    {row.letterGrade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </View>
    );
  }

  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionBand}>
        <Text style={styles.sectionTitle}>Student Score Changes</Text>
      </View>
      <View style={styles.curveTable}>
        <View style={[styles.curveRow, styles.curveHeaderRow]}>
          <Text style={[styles.curveHeaderCell, styles.studentNumberCell]}>Student Number</Text>
          <Text style={[styles.curveHeaderCell, styles.scoreCell]}>Original Score</Text>
          <Text style={[styles.curveHeaderCell, styles.scoreCell]}>Curved Score</Text>
          <Text style={[styles.curveHeaderCell, styles.letterCell]}>Letter Grade</Text>
        </View>
        {rows.map((row, index) => (
          <View
            key={`${row.studentNumber}-${index}`}
            style={[styles.curveRow, index % 2 === 1 && styles.altRow]}
          >
            <Text style={[styles.curveCell, styles.studentNumberCell]}>{row.studentNumber}</Text>
            <Text style={[styles.curveCell, styles.scoreCell]}>{row.originalScore}</Text>
            <Text style={[styles.curveCell, styles.scoreCell]}>{row.curvedScore}</Text>
            <Text style={[styles.curveCell, styles.letterCell]}>{row.letterGrade}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const webTableStyles: Record<string, CSSProperties> = {
  altRow: {
    backgroundColor: "#f8fafc"
  },
  cell: {
    borderBottom: "1px solid #cbd5e1",
    borderRight: "1px solid #cbd5e1",
    color: "#0f172a",
    fontSize: 14,
    padding: "8px 10px"
  },
  headerCell: {
    backgroundColor: "#f1f5f9",
    borderBottom: "1px solid #cbd5e1",
    borderRight: "1px solid #cbd5e1",
    color: "#0f172a",
    fontSize: 13,
    fontWeight: 700,
    padding: "8px 10px",
    textAlign: "left"
  },
  headerRow: {},
  letterCell: {
    borderRight: "none",
    width: "20%"
  },
  scoreCell: {
    width: "25%"
  },
  studentCell: {
    width: "30%"
  },
  table: {
    borderCollapse: "collapse",
    tableLayout: "fixed",
    width: "100%"
  },
  wrap: {
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    marginTop: 8,
    overflow: "hidden"
  }
};

function extractCorrectionFormat(parsed: ParsedDocument) {
  const infoSection = findSection(parsed.sections, /student\s*information/i);
  if (!infoSection) {
    return "Standard";
  }

  for (const block of infoSection.blocks) {
    if (block.type === "paragraph") {
      const match = block.text.match(/format\s*:\s*([a-z]+)/i);
      if (match?.[1]) {
        return match[1][0].toUpperCase() + match[1].slice(1).toLowerCase();
      }
    }
  }

  return "Standard";
}

function CorrectionWritingLines() {
  return (
    <View style={styles.writingLinesWrap}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={`line-${index}`} style={styles.writingLine} />
      ))}
    </View>
  );
}

function TestCorrectionBlocks({ parsed }: { parsed: ParsedDocument }) {
  const promptsSection = findSection(parsed.sections, /correction\s*prompts/i);

  if (!promptsSection) {
    return null;
  }

  const format = extractCorrectionFormat(parsed);
  const items = promptsSection.blocks.filter(
    (block): block is { type: "item"; text: string; number?: number } => block.type === "item"
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionBand}>
        <Text style={styles.sectionTitle}>Correction Prompts</Text>
      </View>
      <View style={styles.correctionStack}>
        {items.map((item, index) => (
          <View key={`corr-${index}`} style={styles.correctionCard}>
            <View style={styles.correctionCardHeader}>
              <Text style={styles.correctionCardTitle}>Question {index + 1}</Text>
              <View style={styles.formatBadge}>
                <Text style={styles.formatBadgeText}>{format}</Text>
              </View>
            </View>
            <Text style={styles.originalQuestionText}>
              {sanitizeDisplayText(item.text)}
            </Text>
            <Text style={styles.responsePrompt}>Correction Response:</Text>
            <CorrectionWritingLines />
          </View>
        ))}
      </View>
    </View>
  );
}

type QuestionItemBlock = Extract<DocumentBlock, { type: "item" }>;

function QuestionItem({
  block,
  stackChoices
}: {
  block: QuestionItemBlock;
  stackChoices: boolean;
}) {
  const { stem, choices } = resolveItemDisplay(block);
  const shouldStack = stackChoices && choices.length > 0;

  if (!shouldStack) {
    return (
      <View style={styles.itemRow}>
        <Text style={styles.itemNumber}>{block.number}.</Text>
        <Text style={styles.itemText}>{block.text}</Text>
      </View>
    );
  }

  return (
    <View style={styles.questionBlock}>
      <View style={styles.itemRow}>
        <Text style={styles.itemNumber}>{block.number}.</Text>
        <Text style={styles.questionStem}>{stem}</Text>
      </View>
      <View style={styles.choicesWrap}>
        {choices.map((choice) => (
          <View key={`${block.number}-${choice.letter}`} style={styles.choiceRow}>
            <Text style={styles.choiceText}>
              <Text style={styles.choiceLetter}>{choice.letter})</Text> {choice.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function renderDefaultSection(
  section: DocumentSection,
  sectionIndex: number,
  options?: { stackChoices?: boolean }
) {
  const stackChoices = Boolean(
    options?.stackChoices && isQuestionSection(section.title)
  );

  return (
    <View
      key={`${section.title}-${sectionIndex}`}
      style={styles.sectionWrap}
      testID={/teacher\s*note/i.test(section.title) ? "teacher-note-section" : undefined}
    >
      <View style={styles.sectionBand}>
        <Text style={styles.sectionTitle}>{sanitizeDisplayText(section.title)}</Text>
      </View>

      <View style={styles.sectionBody}>
        {section.blocks.map((block, blockIndex) => {
          if (block.type === "paragraph") {
            return (
              <Text key={`${sectionIndex}-p-${blockIndex}`} style={styles.paragraph}>
                {sanitizeDisplayText(block.text)}
              </Text>
            );
          }

          if (block.type === "item") {
            return (
              <QuestionItem
                key={`${sectionIndex}-i-${blockIndex}`}
                block={block}
                stackChoices={stackChoices}
              />
            );
          }

          if (block.type === "answerKey") {
            return (
              <View key={`${sectionIndex}-a-${blockIndex}`} style={styles.answerKeyBox}>
                <Text style={styles.answerKeyTitle}>Answer Key</Text>
                {block.lines
                  .filter((line) => line.trim())
                  .map((line, lineIndex) => (
                    <Text
                      key={`${sectionIndex}-a-${blockIndex}-${lineIndex}`}
                      style={styles.answerLine}
                    >
                      {sanitizeDisplayText(line)}
                    </Text>
                  ))}
              </View>
            );
          }

          if (block.type === "rubric") {
            return <RubricTable key={`${sectionIndex}-r-${blockIndex}`} rows={block.rows} />;
          }

          return null;
        })}
      </View>
    </View>
  );
}

function renderParsedByMode(parsed: ParsedDocument, mode: GenerationMode) {
  const stackChoices = mode === "Problem Set" || mode === "Practice Test";

  if (mode === "Grade Curve Calculator") {
    return parsed.sections.map((section, index) => {
      if (/student\s*score\s*changes/i.test(section.title)) {
        return <GradeCurveTable key={`curve-${index}`} parsed={parsed} />;
      }

      return renderDefaultSection(section, index, { stackChoices });
    });
  }

  if (mode === "Test Correction Form Generator") {
    return parsed.sections.map((section, index) => {
      if (/correction\s*prompts/i.test(section.title)) {
        return <TestCorrectionBlocks key={`correction-${index}`} parsed={parsed} />;
      }

      return renderDefaultSection(section, index, { stackChoices });
    });
  }

  return parsed.sections.map((section, index) =>
    renderDefaultSection(section, index, { stackChoices })
  );
}

export function DocumentRenderer({
  content,
  createdAt,
  mode,
  subject,
  teacherName
}: DocumentRendererProps) {
  const parsed = safeParseDocument(content);

  return (
    <View style={styles.documentPage} testID="tf-print-root">
      <View style={styles.headerRow}>
        <Text style={styles.schoolName}>Salisbury School</Text>
        <Text style={styles.modeName}>{getModeLabel(mode, subject)}</Text>
      </View>
      <View style={styles.headerDivider} />

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Teacher: {teacherName?.trim() || "Teacher Name"}</Text>
        <Text style={styles.metaText}>Subject: {subject?.trim() || "Subject"}</Text>
        <Text style={styles.metaText}>Date: {formatDate(createdAt)}</Text>
      </View>

      <Text style={styles.documentTitle}>{sanitizeDisplayText(parsed.title)}</Text>

      <View style={styles.contentWrap}>{renderParsedByMode(parsed, mode)}</View>
    </View>
  );
}

const sharedCellBorder = {
  borderRightColor: "#cbd5e1",
  borderRightWidth: 1
} as const;

const styles = StyleSheet.create({
  altRow: {
    backgroundColor: "#f8fafc"
  },
  answerKeyBox: {
    backgroundColor: "#fef9c3",
    borderColor: "#facc15",
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    marginTop: spacing.sm,
    padding: spacing.md
  },
  answerKeyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  answerLine: {
    color: colors.text,
    ...typography.body
  },
  contentWrap: {
    gap: spacing.md
  },
  correctionCard: {
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md
  },
  correctionCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  correctionCardTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  },
  correctionStack: {
    gap: spacing.md,
    paddingTop: spacing.sm
  },
  curveCell: {
    ...sharedCellBorder,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  curveHeaderCell: {
    ...sharedCellBorder,
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  curveHeaderRow: {
    backgroundColor: "#f1f5f9"
  },
  curveRow: {
    borderBottomColor: "#cbd5e1",
    borderBottomWidth: 1,
    flexDirection: "row"
  },
  curveTable: {
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: spacing.sm,
    overflow: "hidden"
  },
  documentPage: {
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing.lg
  },
  documentTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    marginBottom: spacing.md,
    marginTop: spacing.md
  },
  formatBadge: {
    backgroundColor: "#dbeafe",
    borderColor: "#93c5fd",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  formatBadgeText: {
    color: "#1e3a8a",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase"
  },
  headerDivider: {
    backgroundColor: "#cbd5e1",
    height: 1,
    marginTop: spacing.sm
  },
  headerRow: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  itemNumber: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
    minWidth: 22,
    paddingTop: 1
  },
  choiceLetter: {
    color: colors.text,
    fontWeight: "800"
  },
  choiceRow: {
    marginBottom: spacing.xs,
    marginLeft: spacing.lg,
    paddingLeft: spacing.sm
  },
  choiceText: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    lineHeight: 22
  },
  choicesWrap: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
    marginLeft: spacing.xl,
    marginTop: spacing.xs
  },
  itemRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingLeft: 4
  },
  itemText: {
    color: colors.text,
    flex: 1,
    ...typography.body
  },
  questionBlock: {
    marginBottom: spacing.md
  },
  questionStem: {
    color: colors.text,
    flex: 1,
    ...typography.body,
    marginBottom: spacing.sm
  },
  letterCell: {
    borderRightWidth: 0,
    flex: 1.2
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.sm
  },
  metaText: {
    color: colors.textMuted,
    ...typography.meta
  },
  modeName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600"
  },
  originalQuestionText: {
    color: "#64748b",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20
  },
  paragraph: {
    color: colors.text,
    ...typography.body
  },
  responsePrompt: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600"
  },
  rubricCell: {
    ...sharedCellBorder,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  rubricCriteriaCell: {
    flex: 2
  },
  rubricDescCell: {
    borderRightWidth: 0,
    flex: 4
  },
  rubricHeaderCell: {
    ...sharedCellBorder,
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  rubricHeaderRow: {
    backgroundColor: "#f1f5f9"
  },
  rubricPointsCell: {
    flex: 1
  },
  rubricRow: {
    borderBottomColor: "#cbd5e1",
    borderBottomWidth: 1,
    flexDirection: "row"
  },
  rubricTable: {
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: spacing.sm,
    overflow: "hidden"
  },
  schoolName: {
    color: colors.text,
    fontFamily: "Georgia",
    fontSize: 26,
    fontWeight: "700"
  },
  scoreCell: {
    flex: 1.2
  },
  sectionBand: {
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  sectionBody: {
    gap: spacing.xs,
    paddingTop: spacing.sm
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  sectionWrap: {
    gap: 2,
    marginBottom: spacing.md
  },
  studentNumberCell: {
    flex: 1.4
  },
  writingLine: {
    borderBottomColor: "#cbd5e1",
    borderBottomWidth: 1,
    height: 24
  },
  writingLinesWrap: {
    gap: 8
  }
});
