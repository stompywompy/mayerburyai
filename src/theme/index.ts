export const theme = {
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  colors: {
    background: "#ffffff",
    surface: "#ffffff",
    surfaceAlt: "#f8fafc",
    accent: "#3b82f6",
    accentSoft: "#dbeafe",
    accentContrast: "#ffffff",
    text: "#0f172a",
    textMuted: "#475569",
    border: "#cbd5e1",
    borderStrong: "#94a3b8",
    white: "#ffffff",
    danger: "#dc2626",
    dangerSoft: "#b91c1c",
    navy: "#1e293b",
    amber: "#60a5fa",
    amberSoft: "#bfdbfe"
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 10,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    xxxl: 32
  },
  radii: {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    pill: 999
  },
  typography: {
    eyebrow: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 13,
      fontWeight: "700" as const,
      letterSpacing: 1.2
    },
    titleHero: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 30,
      fontWeight: "800" as const,
      letterSpacing: -0.6,
      lineHeight: 36
    },
    titleScreen: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 18,
      fontWeight: "700" as const
    },
    titleCard: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 17,
      fontWeight: "700" as const
    },
    titleSection: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 18,
      fontWeight: "700" as const
    },
    body: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 15,
      lineHeight: 23
    },
    bodySmall: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 14,
      lineHeight: 21
    },
    label: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 15,
      fontWeight: "700" as const
    },
    labelSmall: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 14,
      fontWeight: "700" as const
    },
    meta: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 12,
      fontWeight: "600" as const
    },
    button: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 16,
      fontWeight: "700" as const,
      letterSpacing: 0.15
    }
  },
  motion: {
    cardDuration: 420,
    cardOffset: 18,
    cardStagger: 90
  }
} as const;

export const { colors, motion, radii, spacing, typography } = theme;
