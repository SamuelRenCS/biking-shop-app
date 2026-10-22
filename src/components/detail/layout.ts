import type { EdgeInsets } from "react-native-safe-area-context";

import type { BackdropGeometry } from "@/components/ui/DiagonalBackdrop";
import { designFrame } from "@/theme";

/**
 * Product Detail frames, in Figma pt on the 390 × 844 frame (docs/figma-export.css, "Detail").
 *
 * The bottom sheet keeps its design height (it holds the text and purchase bar). The carousel
 * takes whatever is left between the header and the sheet: on the 13 mini that's less than the
 * design's 290pt, so the image shrinks to fit; on the Pro Max it scales with width and is centred.
 */

const CAROUSEL_DESIGN_HEIGHT = 290; // header bottom (104) to sheet top (394)
const SHEET_DESIGN_HEIGHT = 450;
const DESIGN_HOME_INDICATOR = 34;

export function detailLayout(
  width: number,
  height: number,
  insets: EdgeInsets,
) {
  const s = width / designFrame.width;
  const dy = insets.top - designFrame.statusBar;

  const headerBottom = insets.top + 16 + 44;
  const sheetHeight =
    SHEET_DESIGN_HEIGHT + (insets.bottom - DESIGN_HOME_INDICATOR);
  const sheetTop = height - sheetHeight;

  const region = sheetTop - headerBottom;
  const v = Math.min(s, region / CAROUSEL_DESIGN_HEIGHT);
  const blockTop = headerBottom + (region - CAROUSEL_DESIGN_HEIGHT * v) / 2;

  const imageWidth = 284.73 * v;
  const imageHeight = 208.41 * v;
  const image = {
    x: (width - imageWidth) / 2,
    y: blockTop + 27 * v,
    width: imageWidth,
    height: imageHeight,
    scale: v,
  };
  const dotsY = blockTop + 243.64 * v;
  const lift = 50;

  // Here the panel's long edge runs 0.486pt left per 1pt down (about 26° from vertical), entering
  // at the top near x 316 and passing behind the bike's rear wheel.
  const backdrop: BackdropGeometry = {
    vertexX: 316 * s + 0.475 * lift,
    vertexY: -4 + dy - lift,
    run: 0.475,
    cornerRadius: 24 * s,
    gradientBox: { x: 8 * s, y: -80 + dy, width: 413.5 * s, height: 720.5 * s },
  };

  return {
    image,
    dotsY,
    backdrop,
    sheet: { top: sheetTop, height: sheetHeight },
    purchaseBarHeight: 70 + insets.bottom,
  };
}

export type DetailLayout = ReturnType<typeof detailLayout>;
