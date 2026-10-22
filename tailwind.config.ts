import type { Config } from "tailwindcss";

import { colors, fonts, radii, typeScale } from "./src/theme/tokens";

const fontSize = Object.fromEntries(
  Object.entries(typeScale).map(([name, [size, lineHeight, letterSpacing]]) => [
    name,
    [`${size}px`, { lineHeight: `${lineHeight}px`, letterSpacing: `${letterSpacing}px` }],
  ]),
) as NonNullable<Config["theme"]>["fontSize"];

export default {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: colors.bg,
        "surface-100": colors.surface100,
        "surface-200": colors.surface200,
        "surface-300": colors.surface300,
        "surface-400": colors.surface400,
        accent: colors.accentText,
        "text-high": colors.textHigh,
        "text-muted": colors.textMuted,
      },
      fontFamily: {
        poppins: [fonts.regular],
        "poppins-medium": [fonts.medium],
        "poppins-semibold": [fonts.semibold],
        "poppins-bold": [fonts.bold],
      },
      fontSize,
      borderRadius: {
        xs: `${radii.xs}px`,
        sm: `${radii.sm}px`,
        md: `${radii.md}px`,
        lg: `${radii.lg}px`,
        xl: `${radii.xl}px`,
      },
    },
  },
  plugins: [],
} satisfies Config;
