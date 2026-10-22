/**
 * Design tokens, transcribed from the Figma CSS export (docs/figma-export.css).
 *
 * This file is plain data with no React Native imports, so tailwind.config.ts can load it too.
 * Gradients and shadows keep their CSS shape. `css.ts` turns them into RN style strings
 * (`backgroundImage`, `boxShadow`), and `skia.ts` turns them into Skia shader and shadow props.
 */

export type GradientStop = { color: string; at: number }; // `at` is a fraction, may fall outside 0..1 like the CSS
export type LinearGradientToken = { angle: number; stops: GradientStop[] };
export type ShadowToken = { x: number; y: number; blur: number; color: string; inset?: boolean };

const stop = (color: string, percent: number): GradientStop => ({ color, at: percent / 100 });

export const colors = {
  bg: "#242C3B",
  surface100: "#262E3D",
  surface200: "#28303F",
  surface300: "#323B4F",
  surface400: "#353F54",
  surfaceDeep: "#222834",
  accentFrom: "#34C8E8",
  accentTo: "#4E4AF2",
  accentText: "#3C9EEA",
  white: "#FFFFFF",
  textHigh: "rgba(255, 255, 255, 0.87)",
  textMuted: "rgba(255, 255, 255, 0.6)",
  separator: "rgba(255, 255, 255, 0.5)",
  iconOn: "#FAFEFF",
} as const;

export const gradients = {
  /** Accent buttons and selected states: search, back, selected chip, selected tab, Add to Cart. */
  accent: { angle: 152.72, stops: [stop("#34C8E8", 1.7), stop("#4E4AF2", 114.52)] },
  /** Liked heart icon. */
  accentIcon: { angle: 144.6, stops: [stop("#34CAE8", -0.37), stop("#4E49F2", 105.55)] },
  /** Cart quantity "+" button. */
  accentSmall: { angle: 151.1, stops: [stop("#34C8E8", 1.78), stop("#4E4AF2", 95.56)] },
  /** Active segmented-tab label (Detail). */
  accentLabel: { angle: 90.11, stops: [stop("#3CA4EB", 0.13), stop("#4286EE", 99.94)] },
  /** Diagonal blue backdrop shape behind Discover / Detail. */
  backdrop: { angle: 170.76, stops: [stop("#37B6E9", 6.44), stop("#4B4CED", 99.29)] },
  /** Opaque raised surface: chips and cards sitting on the dark background. */
  surface: { angle: 169.98, stops: [stop("#353F54", 27.98), stop("#222834", 81.2)] },
  /** Translucent surface for chips and cards sitting on the blue backdrop. */
  surfaceGlass: {
    angle: 167.4,
    stops: [stop("rgba(54, 62, 81, 0.6)", 25.94), stop("rgba(25, 30, 38, 0.6)", 68.26)],
  },
  /** Hero promo card (glass over the backdrop). */
  hero: {
    angle: 169.98,
    stops: [stop("rgba(53, 63, 84, 0.6)", 27.98), stop("rgba(34, 40, 52, 0.6)", 81.2)],
  },
  /** Detail bottom sheet. */
  sheet: { angle: 157.91, stops: [stop("#353F54", 0), stop("#222834", 58.47)] },
  /** Bottom tab bar. */
  tabBar: { angle: 180, stops: [stop("#363E51", -4.83), stop("#181C24", 116.91)] },
  /** Cart product thumbnail tile. */
  thumb: { angle: 322.57, stops: [stop("#363E51", 7.8), stop("#4C5770", 91.33)] },
} satisfies Record<string, LinearGradientToken>;

export const shadows = {
  /** Accent buttons and chips. */
  raised: [
    { x: 0, y: -20, blur: 30, color: "rgba(43, 52, 69, 0.5)" },
    { x: 0, y: 20, blur: 30, color: "#10141C" },
  ],
  /** Opaque product card. */
  card: [
    { x: 0, y: -20, blur: 40, color: "rgba(43, 52, 69, 0.5)" },
    { x: 0, y: 20, blur: 60, color: "#10141C" },
  ],
  hero: [
    { x: 0, y: -20, blur: 60, color: "rgba(59, 71, 95, 0.5)" },
    { x: 0, y: 20, blur: 60, color: "rgba(16, 20, 28, 0.6)" },
  ],
  /** Selected tab-bar tile. */
  floating: [{ x: 0, y: 20, blur: 30, color: "rgba(16, 20, 28, 0.6)" }],
  sheet: [{ x: 0, y: -20, blur: 60, color: "rgba(0, 0, 0, 0.25)" }],
  bottomBar: [{ x: 0, y: -10, blur: 40, color: "#1C222E" }],
  ctaButton: [{ x: 0, y: 30, blur: 60, color: "#1A1F2C" }],
  /** Skeuomorphic pill, raised (Detail segmented tabs). */
  neuRaised: [
    { x: -4, y: -4, blur: 10, color: "#38445A" },
    { x: 4, y: 4, blur: 10, color: "#252B39" },
  ],
  /** Skeuomorphic pill, pressed in. */
  neuPressed: [
    { x: -4, y: -4, blur: 8, color: "#364055", inset: true },
    { x: 4, y: 4, blur: 8, color: "#202633", inset: true },
  ],
  /** Cart stepper "−" and promo field wells. */
  well: [
    { x: -2, y: -2, blur: 4, color: "#273041", inset: true },
    { x: 2, y: 2, blur: 4, color: "#1E2531", inset: true },
  ],
  wellDeep: [
    { x: -2, y: -2, blur: 8, color: "#2B3545", inset: true },
    { x: 4, y: 4, blur: 30, color: "#11161E", inset: true },
  ],
  checkoutTrack: [{ x: 4, y: 10, blur: 30, color: "#191E29", inset: true }],
} satisfies Record<string, ShadowToken[]>;

export const radii = {
  xs: 5,
  sm: 8,
  md: 10,
  lg: 20,
  xl: 30,
} as const;

/** Poppins families as registered by @expo-google-fonts/poppins (RN needs one family per weight). */
export const fonts = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
} as const;

/**
 * [fontSize, lineHeight, letterSpacing] in pt. Weight is chosen separately via the font family.
 * Figma sets Poppins at 150% line height; the CSS export rounds it (22.5 → 22, 19.5 → 20), which
 * drifts by ~0.5pt per line in long copy, so the exact values are used here.
 */
export const typeScale = {
  micro: [11, 16.5, 0],
  caption: [13, 19.5, -0.3],
  body: [15, 22.5, -0.3],
  heading: [17, 25.5, -0.3],
  title: [20, 30, -0.3],
  price: [24, 36, -0.3],
  promo: [26, 39, 0],
} as const;

/** The Figma frame every screen was drawn on (iPhone 13/14, 390 × 844 pt). */
export const designFrame = { width: 390, height: 844, statusBar: 44 } as const;
