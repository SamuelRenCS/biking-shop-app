import { Image } from "expo-image";
import { useMemo } from "react";
import { Pressable, Text } from "react-native";

import { BackdropBehind } from "@/components/ui/DiagonalBackdrop";
import { SkewedSurface, type EdgeHighlight, type Point } from "@/components/ui/SkewedSurface";
import { heroPromo, products } from "@/data/products";
import { gradients, shadows } from "@/theme";

import type { DiscoverLayout } from "./layout";

// From top_card.svg: a white-to-transparent inner hairline at 20% opacity, running top-left to
// lower-middle.
const HIGHLIGHT: EdgeHighlight = {
  from: [0.112, 0.037],
  to: [0.489, 0.823],
  stops: [
    { color: "white", at: 0 },
    { color: "black", at: 1 },
  ],
  width: 2,
  opacity: 0.2,
};

type Props = { layout: DiscoverLayout; contentWidth: number; contentHeight: number; onPress: () => void };

/** Glass promo card: flat top, bottom edge rising to the right, blurred backdrop showing through. */
export function HeroCard({ layout, contentWidth, contentHeight, onPress }: Props) {
  const { x, y, width, height, slant } = layout.hero;
  const product = products[heroPromo.productId];
  const s = layout.scale;
  const points = useMemo<Point[]>(
    () => [
      [0, 0],
      [width, 0],
      [width, height - slant],
      [0, height],
    ],
    [width, height, slant],
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${heroPromo.label}`}
      style={{ position: "absolute", left: x, top: y }}
    >
      <SkewedSurface
        width={width}
        height={height}
        points={points}
        radius={20 * s}
        fill={gradients.hero}
        shadows={shadows.hero}
        highlight={HIGHLIGHT}
        backdrop={<BackdropBehind geometry={layout.backdrop} width={contentWidth} height={contentHeight} x={x} y={y} />}
        backdropBlur={50}
      >
        <Image
          source={heroPromo.image}
          contentFit="contain"
          style={{ position: "absolute", left: 17 * s, top: 30 * s, width: 316.82 * s, height: 153 * s }}
        />
        <Text
          className="absolute font-poppins-bold text-promo text-text-muted"
          style={{ left: 16, top: 177 * s }}
        >
          {heroPromo.label}
        </Text>
      </SkewedSurface>
    </Pressable>
  );
}
