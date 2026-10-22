import type { EdgeInsets } from "react-native-safe-area-context";

import { typeScale } from "@/theme";

/**
 * Shopping Cart spacing. On the 390 × 844 design frame, three items plus the footer (message,
 * promo field, summary, total, checkout) fill the screen exactly. Shorter screens (13 mini) shrink
 * the vertical gaps, never the content, so all three items still fit; taller screens give the
 * extra room to the item list. More than three items scroll.
 */

const DESIGN_GAPS = { list: 32, message: 24, promo: 24, summary: 16, total: 16, checkout: 20 };
const ROW_BLOCK = 124; // 90 row + 16 + divider + 16
const LIST_HEIGHT = ROW_BLOCK * 3 - 16;

const body = typeScale.body[1];
const CONTENT_HEIGHT =
  LIST_HEIGHT +
  body + // free-shipping message
  44 + // promo field
  (body * 3 + 8 * 2) + // summary rows
  typeScale.heading[1] + // total
  44; // checkout slide

export function cartLayout(height: number, insets: EdgeInsets) {
  const headerBottom = insets.top + 16 + 44;
  // Figma leaves 30pt under the slide on a 34pt home-indicator inset.
  const bottomGap = Math.max(insets.bottom - 4, 16);
  const gapsTotal = Object.values(DESIGN_GAPS).reduce((a, b) => a + b, 0);
  const available = height - headerBottom - bottomGap;
  const g = Math.min(1, Math.max(0.5, (available - CONTENT_HEIGHT) / gapsTotal));

  const gaps = Object.fromEntries(
    Object.entries(DESIGN_GAPS).map(([key, value]) => [key, value * g]),
  ) as typeof DESIGN_GAPS;
  return { gaps, bottomGap };
}
