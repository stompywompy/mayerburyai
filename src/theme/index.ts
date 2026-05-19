export const theme = {
  colors: {
    background: "#090909",
    surface: "#131313",
    surfaceAlt: "#1A1A1A",
    accent: "#8F1D2C",
    accentSoft: "#D45A6C",
    accentContrast: "#FFF4F6",
    text: "#F7F9FC",
    textMuted: "#B0A4A7",
    border: "#342326",
    borderStrong: "#5B2A32",
    white: "#FFFFFF",
    danger: "#D95656",
    dangerSoft: "#FFC0C0"
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
      fontSize: 13,
      fontWeight: "700" as const,
      letterSpacing: 1.2
    },
    titleHero: {
      fontSize: 32,
      fontWeight: "800" as const,
      letterSpacing: -0.8,
      lineHeight: 38
    },
    titleScreen: {
      fontSize: 18,
      fontWeight: "700" as const
    },
    titleCard: {
      fontSize: 17,
      fontWeight: "700" as const
    },
    titleSection: {
      fontSize: 18,
      fontWeight: "700" as const
    },
    body: {
      fontSize: 15,
      lineHeight: 23
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 21
    },
    label: {
      fontSize: 15,
      fontWeight: "700" as const
    },
    labelSmall: {
      fontSize: 14,
      fontWeight: "700" as const
    },
    meta: {
      fontSize: 12,
      fontWeight: "600" as const
    },
    button: {
      fontSize: 16,
      fontWeight: "800" as const,
      letterSpacing: 0.2
    }
  },
  motion: {
    cardDuration: 420,
    cardOffset: 18,
    cardStagger: 90
  }
} as const;

export const { colors, motion, radii, spacing, typography } = theme;
