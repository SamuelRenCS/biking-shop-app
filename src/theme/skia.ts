import { vec } from "@shopify/react-native-skia";

import type { LinearGradientToken, ShadowToken } from "./tokens";

type Rect = { x: number; y: number; width: number; height: number };

/**
 * Resolve a CSS-style angled gradient into Skia `<LinearGradient>` props for a given box.
 *
 * CSS defines the gradient line through the box centre at `angle` (0deg points up, clockwise),
 * long enough that the corners land on 0% and 100%. Skia wants explicit start/end points and
 * positions inside 0..1, so stops outside that range (Figma exports e.g. -4.83% or 114.52%)
 * are folded into the start/end points instead.
 */
export function skiaGradient({ angle, stops }: LinearGradientToken, box: Rect) {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const length = Math.abs(box.width * dx) + Math.abs(box.height * dy);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const sx = cx - (dx * length) / 2;
  const sy = cy - (dy * length) / 2;

  const first = stops[0].at;
  const last = stops[stops.length - 1].at;
  const span = last - first || 1;
  return {
    start: vec(sx + dx * length * first, sy + dy * length * first),
    end: vec(sx + dx * length * last, sy + dy * length * last),
    colors: stops.map((s) => s.color),
    positions: stops.map((s) => (s.at - first) / span),
  };
}

/** CSS blur radius is twice the Gaussian sigma that Skia's `<Shadow blur>` expects. */
export function skiaShadow({ x, y, blur, color, inset }: ShadowToken) {
  return { dx: x, dy: y, blur: blur / 2, color, inner: inset };
}

/** How far a set of shadows can paint outside the shape (about 3 sigma of blur plus offset). */
export function shadowOutset(shadows: readonly ShadowToken[]) {
  return shadows.reduce(
    (max, s) => (s.inset ? max : Math.max(max, Math.max(Math.abs(s.x), Math.abs(s.y)) + s.blur * 1.5)),
    0,
  );
}
