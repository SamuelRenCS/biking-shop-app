import { Blur, Canvas, Group, Oval } from "@shopify/react-native-skia";
import { Image } from "expo-image";
import { useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";

import type { Product, ProductKind } from "@/data/products";

import type { DetailLayout } from "./layout";

/**
 * Each product has one photo, so the carousel shows it whole and then two close-ups.
 * `focus` is the point (as a fraction of the image) that stays centred when zoomed.
 */
type Crop = { zoom: number; focus: readonly [number, number] };
const CROPS: Record<ProductKind, Crop[]> = {
  bike: [
    { zoom: 1, focus: [0.5, 0.5] },
    { zoom: 2, focus: [0.38, 0.66] }, // drivetrain
    { zoom: 2, focus: [0.62, 0.28] }, // saddle to bars
  ],
  accessory: [
    { zoom: 1, focus: [0.5, 0.5] },
    { zoom: 1.8, focus: [0.5, 0.36] }, // shell and vents
    { zoom: 1.8, focus: [0.5, 0.75] }, // straps
  ],
};

// Keep the pages clear of the screen edges so they never fight the swipe-back gesture.
const EDGE_INSET = 30;

type Props = { product: Product; layout: DetailLayout };

export function ImageCarousel({ product, layout }: Props) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const crops = CROPS[product.kind];
  const pageWidth = width - EDGE_INSET * 2;
  const { image } = layout;
  // A little taller than the photo so the blurred ground shadow isn't clipped.
  const pageHeight = image.height + 16;

  return (
    <>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / pageWidth))}
        style={{ position: "absolute", left: EDGE_INSET, top: image.y, width: pageWidth, height: pageHeight }}
        accessibilityLabel={`${product.name} photos`}
      >
        {crops.map((crop, i) => (
          <View key={i} style={{ width: pageWidth, height: pageHeight, alignItems: "center" }}>
            {i === 0 && product.kind === "bike" && <GroundShadow layout={layout} />}
            <CroppedImage source={product.image} crop={crop} width={image.width} height={image.height} />
          </View>
        ))}
      </ScrollView>
      <PaginationDots count={crops.length} active={page} top={layout.dotsY} />
    </>
  );
}

function CroppedImage({ source, crop, width, height }: { source: number; crop: Crop; width: number; height: number }) {
  const w = width * crop.zoom;
  const h = height * crop.zoom;
  // Centre the focus point, without letting the image edge come inside the frame.
  const left = Math.min(0, Math.max(width - w, width / 2 - crop.focus[0] * w));
  const top = Math.min(0, Math.max(height - h, height / 2 - crop.focus[1] * h));
  return (
    <View style={{ width, height, overflow: "hidden" }}>
      <Image source={source} contentFit="contain" style={{ position: "absolute", left, top, width: w, height: h }} />
    </View>
  );
}

/** Figma "Group 6": three blurred ellipses under the wheels (CSS blur() is a standard deviation). */
function GroundShadow({ layout }: { layout: DetailLayout }) {
  const { width, height, scale: v } = layout.image;
  const pad = 20;
  return (
    <Canvas
      pointerEvents="none"
      style={{ position: "absolute", top: -pad, width: width + pad * 2, height: height + pad * 2, alignSelf: "center" }}
    >
      <Group transform={[{ translateX: pad }, { translateY: pad }]}>
        <Oval x={-3 * v} y={188.23 * v} width={98.6 * v} height={4.48 * v} color="rgba(0, 0, 0, 0.2)">
          <Blur blur={4.48} />
        </Oval>
        <Oval x={177.17 * v} y={188.23 * v} width={102.18 * v} height={4.48 * v} color="rgba(0, 0, 0, 0.2)">
          <Blur blur={4.48} />
        </Oval>
        <Oval x={6.86 * v} y={181.96 * v} width={272.49 * v} height={9.86 * v} color="rgba(0, 0, 0, 0.1)">
          <Blur blur={4.48} />
        </Oval>
      </Group>
    </Canvas>
  );
}

const DOT = 5.38;
const DOT_GAP = 7.17;

function PaginationDots({ count, active, top }: { count: number; active: number; top: number }) {
  return (
    <View style={[styles.dots, { top }]} pointerEvents="none">
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={{
            width: DOT,
            height: DOT,
            borderRadius: DOT / 2,
            marginLeft: i === 0 ? 0 : DOT_GAP,
            backgroundColor: i === active ? "#FFFFFF" : "rgba(255, 255, 255, 0.2)",
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { position: "absolute", left: 0, right: 0, flexDirection: "row", justifyContent: "center" },
});
