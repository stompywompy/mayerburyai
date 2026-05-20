import type { CSSProperties } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { Components } from "react-markdown";

import { colors, radii, spacing, typography } from "../theme";

type MarkdownOutputProps = {
  content: string;
};

const markdownTheme = {
  text: colors.text,
  heading: colors.white,
  navy: colors.navy,
  amber: colors.amber,
  amberSoft: colors.amberSoft,
  border: colors.borderStrong,
  muted: colors.textMuted
};

const s: Record<string, CSSProperties> = {
  root: {
    color: markdownTheme.text,
    fontSize: 17,
    lineHeight: 1.7,
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    wordBreak: "break-word"
  },
  h1: {
    color: markdownTheme.heading,
    fontSize: 28,
    fontWeight: 800,
    lineHeight: 1.25,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottom: `3px solid ${markdownTheme.amber}`
  },
  h2: {
    color: markdownTheme.heading,
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.3,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
    borderLeft: `4px solid ${markdownTheme.amber}`
  },
  h3: {
    color: markdownTheme.amberSoft,
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.35,
    marginTop: spacing.md,
    marginBottom: spacing.xs
  },
  p: {
    marginTop: 0,
    marginBottom: spacing.md
  },
  strong: {
    color: markdownTheme.heading,
    fontWeight: 800
  },
  em: {
    color: markdownTheme.amberSoft,
    fontStyle: "italic"
  },
  ul: {
    marginTop: 0,
    marginBottom: spacing.md,
    paddingLeft: spacing.xl
  },
  ol: {
    marginTop: 0,
    marginBottom: spacing.md,
    paddingLeft: spacing.xl
  },
  li: {
    marginBottom: spacing.xs
  },
  blockquote: {
    borderLeft: `4px solid ${markdownTheme.amber}`,
    margin: `${spacing.md}px 0`,
    paddingLeft: spacing.md,
    color: markdownTheme.muted,
    fontStyle: "italic"
  },
  hr: {
    border: "none",
    borderTop: `1px solid ${markdownTheme.border}`,
    margin: `${spacing.lg}px 0`
  },
  tableWrap: {
    overflowX: "auto",
    marginBottom: spacing.lg,
    borderRadius: radii.md,
    border: `1px solid ${markdownTheme.border}`
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 15,
    lineHeight: 1.45
  },
  thead: {
    backgroundColor: markdownTheme.navy
  },
  th: {
    color: colors.white,
    fontWeight: 800,
    textAlign: "left",
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderBottom: `2px solid ${markdownTheme.amber}`,
    borderRight: `1px solid ${markdownTheme.border}`
  },
  td: {
    color: markdownTheme.text,
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderBottom: `1px solid ${markdownTheme.border}`,
    borderRight: `1px solid ${markdownTheme.border}`,
    verticalAlign: "top"
  },
  codeInline: {
    backgroundColor: markdownTheme.navy,
    color: markdownTheme.amberSoft,
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: "0.92em",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
  }
};

function WebMarkdown({ content }: MarkdownOutputProps) {
  const components: Components = {
    h1: ({ children }) => <h1 style={s.h1}>{children}</h1>,
    h2: ({ children }) => <h2 style={s.h2}>{children}</h2>,
    h3: ({ children }) => <h3 style={s.h3}>{children}</h3>,
    p: ({ children }) => <p style={s.p}>{children}</p>,
    strong: ({ children }) => <strong style={s.strong}>{children}</strong>,
    em: ({ children }) => <em style={s.em}>{children}</em>,
    ul: ({ children }) => <ul style={s.ul}>{children}</ul>,
    ol: ({ children }) => <ol style={s.ol}>{children}</ol>,
    li: ({ children }) => <li style={s.li}>{children}</li>,
    blockquote: ({ children }) => (
      <blockquote style={s.blockquote}>{children}</blockquote>
    ),
    hr: () => <hr style={s.hr} />,
    table: ({ children }) => (
      <div style={s.tableWrap}>
        <table style={s.table}>{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead style={s.thead}>{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => <th style={s.th}>{children}</th>,
    td: ({ children }) => <td style={s.td}>{children}</td>,
    code: ({ className, children }) => {
      const isBlock = className?.includes("language-");
      if (isBlock) {
        return (
          <pre
            style={{
              backgroundColor: markdownTheme.navy,
              padding: spacing.md,
              borderRadius: radii.md,
              overflowX: "auto",
              marginBottom: spacing.md
            }}
          >
            <code style={{ color: markdownTheme.text, fontSize: 14 }}>
              {children}
            </code>
          </pre>
        );
      }
      return <code style={s.codeInline}>{children}</code>;
    }
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .teacherforge-markdown .katex {
            color: ${markdownTheme.text};
            font-size: 1.12em;
          }
          .teacherforge-markdown .katex-display {
            margin: ${spacing.lg}px 0;
            padding: ${spacing.md}px;
            overflow-x: auto;
            background: rgba(11, 23, 54, 0.45);
            border-radius: ${radii.md}px;
            border: 1px solid ${markdownTheme.border};
          }
          .teacherforge-markdown tbody tr:nth-child(even) {
            background: rgba(11, 23, 54, 0.35);
          }
        `
        }}
      />
      <div className="teacherforge-markdown" style={s.root}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </>
  );
}

function NativeMarkdownFallback({ content }: MarkdownOutputProps) {
  return (
    <View style={nativeStyles.body}>
      <Text selectable style={nativeStyles.text}>
        {content}
      </Text>
    </View>
  );
}

export function MarkdownOutput({ content }: MarkdownOutputProps) {
  if (!content.trim()) {
    return null;
  }

  if (Platform.OS === "web") {
    return <WebMarkdown content={content} />;
  }

  return <NativeMarkdownFallback content={content} />;
}

/** Plain-text preview for history list cards (strips common Markdown syntax). */
export function stripMarkdownForPreview(text: string, maxLength = 160) {
  const plain = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]+\$/g, " ")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\|[^|\n]+\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) {
    return plain;
  }

  return `${plain.slice(0, maxLength).trim()}…`;
}

const nativeStyles = StyleSheet.create({
  body: {
    gap: spacing.xs
  },
  text: {
    color: colors.text,
    ...typography.body
  }
});
