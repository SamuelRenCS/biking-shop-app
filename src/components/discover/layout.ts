import type { BackdropGeometry } from "@/components/ui/DiagonalBackdrop";
import { designFrame } from "@/theme";
import type { ProductKind } from "@/data/products";

/**
 * Discover is a composed scene rather than a flex layout. The blue backdrop's diagonal edge passes
 * between cards and decides whether each card and chip is opaque or glass, so every frame comes
 * from this one function.
 *
 * Numbers are Figma pt on the 390-wide frame, measured from docs/figma-export.css and the shape
 * SVGs. Artwork (hero, cards, backdrop) scales with screen width so it keeps its composition on
 * the 13 mini (375) and 17 Pro Max (440). Text, chips and fixed gaps don't scale.
 */

export type Frame = { x: number; y: number; width: number; height: number };
export type CardFrame = Frame & {
  slant: number;
  scale: number;
  overBackdrop: boolean;
};

const GUTTER = 20;
const COLUMN_GAP = 20;
const CHIP_SIZE = 50;
const CHIP_INSET = 30;
const CHIP_COUNT = 5;

/** Card bounding heights in Figma: bike cards 240, accessory cards 219 (both 165 wide). */
const CARD_HEIGHT: Record<ProductKind, number> = { bike: 240, accessory: 219 };

export function discoverLayout(
  width: number,
  topInset: number,
  kinds: ProductKind[],
) {
  const s = width / designFrame.width;

  const header = { y: topInset + 16, height: 44 };

  const heroY = header.y + header.height + 32;
  const hero = {
    x: GUTTER,
    y: heroY,
    width: width - GUTTER * 2,
    height: 240 * s,
    slant: 40 * s,
  };

  // The backdrop's left edge falls 0.625pt left for every 1pt down (about 32° from vertical). Its
  // top corner sits 54pt below the hero top and 20pt in from the right edge (Figma 370, 190).
  const backdrop: BackdropGeometry = {
    vertexX: 310 * s,
    vertexY: heroY + 36 * s,
    run: 0.475,
    cornerRadius: 24 * s,
    // Figma layer bounds: 413.5 × 720.5 at (-20, 149), with the corner at y 190.
    gradientBox: {
      x: -20 * s,
      y: heroY + 13 * s,
      width: 413.5 * s,
      height: 720.5 * s,
    },
  };
  const edgeX = (y: number) =>
    backdrop.vertexX - backdrop.run * (y - backdrop.vertexY);
  const isOverBackdrop = (x: number, y: number) =>
    y > backdrop.vertexY && x > edgeX(y);

  // Chips rise 10pt per step to the right, following the hero's slanted bottom edge.
  const chipsTop = hero.y + hero.height - 8 * s;
  const chipStep = (width - CHIP_INSET * 2 - CHIP_SIZE) / (CHIP_COUNT - 1);
  const chips = Array.from({ length: CHIP_COUNT }, (_, i) => {
    const frame = {
      x: CHIP_INSET + i * chipStep,
      y: chipsTop + (CHIP_COUNT - 1 - i) * 10 * s,
      width: CHIP_SIZE,
      height: CHIP_SIZE,
    };
    return {
      ...frame,
      overBackdrop: isOverBackdrop(
        frame.x + CHIP_SIZE / 2,
        frame.y + CHIP_SIZE / 2,
      ),
    };
  });

  // Two staggered columns; the left starts 25pt lower. Cards stack edge to edge by bounding box,
  // which reads as a 20pt gap because neighbouring slanted edges run parallel.
  const columnWidth = (width - GUTTER * 2 - COLUMN_GAP) / 2;
  const k = columnWidth / 165;
  const gridTop = chipsTop + 74 * s;
  const columnBottoms = [gridTop + 25 * k, gridTop];
  const cards: CardFrame[] = kinds.map((kind, i) => {
    const column = i % 2;
    const height = CARD_HEIGHT[kind] * k;
    const frame = {
      x: GUTTER + column * (columnWidth + COLUMN_GAP),
      y: columnBottoms[column],
      width: columnWidth,
      height,
      slant: 20 * k,
      scale: k,
    };
    columnBottoms[column] += height;
    return {
      ...frame,
      overBackdrop: isOverBackdrop(
        frame.x + frame.width / 2,
        frame.y + frame.height / 2,
      ),
    };
  });

  const contentHeight = Math.max(...columnBottoms);

  return { scale: s, header, hero, backdrop, chips, cards, contentHeight };
}

export type DiscoverLayout = ReturnType<typeof discoverLayout>;
