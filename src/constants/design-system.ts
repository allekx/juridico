/**
 * Design System | Sistema Jurídico
 * Tokens centralizados para uso em JS/TS (gráficos, PDFs, temas dinâmicos)
 */

export const colors = {
  navy: {
    50: "#f4f6f8",
    100: "#e8ecf0",
    200: "#c5d0db",
    300: "#9aafc4",
    400: "#6b87a3",
    500: "#4a6580",
    600: "#354d66",
    700: "#283d52",
    800: "#1e3248",
    900: "#152535",
    950: "#0d1824",
  },
  bronze: {
    50: "#f9f6f1",
    100: "#f0ebe0",
    200: "#e0d4c0",
    300: "#c9b896",
    400: "#b39a6f",
    500: "#9a8058",
    600: "#7d6645",
    700: "#645139",
    800: "#524330",
    900: "#45382a",
  },
  neutral: {
    50: "#fafaf9",
    100: "#f5f5f4",
    200: "#e7e5e4",
    300: "#d6d3d1",
    400: "#a8a29e",
    500: "#78716c",
    600: "#57534e",
    700: "#44403c",
    800: "#292524",
    900: "#1c1917",
  },
} as const;

export const typography = {
  fontFamily: {
    sans: "Plus Jakarta Sans",
    display: "Cormorant Garamond",
    mono: "JetBrains Mono",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 1.75,
  },
} as const;

export const spacing = {
  unit: 4,
  scale: {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
  },
  component: {
    buttonPaddingX: "1rem",
    buttonPaddingY: "0.5rem",
    inputPaddingX: "0.75rem",
    inputPaddingY: "0.5rem",
    cardPadding: "1.5rem",
    sectionPaddingY: "4rem",
    sidebarWidth: "16rem",
    headerHeight: "4rem",
  },
} as const;

export const radius = {
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  full: "9999px",
} as const;

export const shadows = {
  xs: "0 1px 2px 0 rgba(21, 37, 53, 0.04)",
  sm: "0 1px 3px 0 rgba(21, 37, 53, 0.06)",
  md: "0 4px 6px -1px rgba(21, 37, 53, 0.06)",
  lg: "0 10px 15px -3px rgba(21, 37, 53, 0.07)",
  premium: "0 20px 40px -12px rgba(30, 50, 72, 0.12)",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const statusColors = {
  active: "success",
  pending: "warning",
  inactive: "muted",
  urgent: "destructive",
  info: "info",
} as const;
