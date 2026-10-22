import { Blur, Group, Oval } from "@shopify/react-native-skia";
import { Image } from "expo-image";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { HeartIcon, HeartLikedIcon } from "@/components/ui/icons";
import { SkewedSurface, type EdgeHighlight, type Point } from "@/components/ui/SkewedSurface";
import type { Product } from "@/data/products";
import { colors, gradients, shadows } from "@/theme";
import { formatPrice } from "@/utils/format";

import { BackdropBehind } from "./DiagonalBackdrop";
import type { CardFrame, DiscoverLayout } from "./layout";

// From item_card.svg: white fading to transparent by 84%, 20% opacity, 2pt inside the edge.
const HIGHLIGHT: EdgeHighlight = {
  from: [0.112, 0.037],
  to: [0.901, 0.403],
  stops: [
    { color: "white", at: 0 },
    { color: "black", at: 0.8445 },
    { color: "black", at: 1 },
  ],
  width: 2,
  opacity: 0.2,
};

/**
 * Content placement per card type, in Figma pt on a 165-wide card. Figma itself is inconsistent
 * between cards, so the two cards in the first viewport (Peugeot, Smith helmet) set the template.
 */
const TEMPLATES = {
  bike: { image: { x: 22, y: 38, width: 121, height: 88.57 }, text: { x: 18, y: 144 } },
  accessory: { image: { x: 10, y: 22, width: 134.64, height: 104 }, text: { x: 10, y: 135 } },
} as const;

type Props = {
  product: Product;
  liked: boolean;
  frame: CardFrame;
  layout: DiscoverLayout;
  contentWidth: number;
  contentHeight: number;
  onPress: () => void;
};

export function ProductCard({ product, liked, frame, layout, contentWidth, contentHeight, onPress }: Props) {
  const { x, y, width, height, slant, scale: k, overBackdrop: glass } = frame;
  const template = TEMPLATES[product.kind];
  const points = useMemo<Point[]>(
    () => [
      [0, slant],
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
      accessibilityLabel={`${product.name}, ${formatPrice(product.price)}`}
      style={{ position: "absolute", left: x, top: y }}
    >
      <SkewedSurface
        width={width}
        height={height}
        points={points}
        radius={20 * k}
        fill={glass ? gradients.surfaceGlass : gradients.surface}
        shadows={glass ? [] : shadows.card}
        highlight={HIGHLIGHT}
        backdrop={
          glass ? (
            <BackdropBehind layout={layout} width={contentWidth} height={contentHeight} x={x} y={y} />
          ) : undefined
        }
        backdropBlur={glass ? 20 : 0}
        decorations={product.kind === "bike" ? <ContactShadow k={k} /> : undefined}
      >
        <View className="absolute h-6 w-6 items-center justify-center" style={{ left: 125 * k, top: 22 * k }}>
          {liked ? <HeartLikedIcon width={20} height={18} /> : <HeartIcon width={20} height={18} color={colors.white} />}
        </View>
        <Image
          source={product.image}
          contentFit="contain"
          style={{
            position: "absolute",
            left: template.image.x * k,
            top: template.image.y * k,
            width: template.image.width * k,
            height: template.image.height * k,
          }}
        />
        <View className="absolute" style={{ left: template.text.x * k, top: template.text.y * k, right: 10 * k }}>
          <Text className="font-poppins-medium text-caption text-text-muted">{product.category}</Text>
          <Text className="font-poppins-bold text-body text-white" numberOfLines={1}>
            {product.shortName ?? product.name}
          </Text>
          <Text className="font-poppins-medium text-caption text-text-muted">{formatPrice(product.price)}</Text>
        </View>
      </SkewedSurface>
    </Pressable>
  );
}

/** Two soft ellipses under the wheels (Figma "Shadow" group; CSS blur() is a standard deviation). */
function ContactShadow({ k }: { k: number }) {
  return (
    <Group>
      <Oval x={30 * k} y={115 * k} width={50.29 * k} height={5.94 * k} color="rgba(0, 0, 0, 0.1)">
        <Blur blur={2.29} />
      </Oval>
      <Oval x={91.89 * k} y={115 * k} width={52.11 * k} height={5.94 * k} color="rgba(0, 0, 0, 0.1)">
        <Blur blur={2.29} />
      </Oval>
    </Group>
  );
}
