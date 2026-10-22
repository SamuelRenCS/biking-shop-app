import type { LinearGradientToken, ShadowToken } from "./tokens";

/** `linear-gradient(...)` string for RN's `backgroundImage` style prop. */
export function cssGradient({ angle, stops }: LinearGradientToken): string {
  const list = stops.map((s) => `${s.color} ${+(s.at * 100).toFixed(2)}%`).join(", ");
  return `linear-gradient(${angle}deg, ${list})`;
}

/** CSS `box-shadow` string for RN's `boxShadow` style prop (New Architecture). */
export function cssShadow(shadows: readonly ShadowToken[]): string {
  return shadows
    .map((s) => `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.color}`)
    .join(", ");
}
