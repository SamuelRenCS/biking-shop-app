import { Canvas, Group, LinearGradient, Path, Rect } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { roundedPolygon } from "@/components/ui/SkewedSurface";
import { colors, gradients } from "@/theme";
import { skiaGradient } from "@/theme/skia";

import type { DiscoverLayout } from "./layout";

const OVERSCAN = 2000; // keeps the shape filled during overscroll bounce

type Props = { layout: DiscoverLayout; width: number; height: number };

/**
 * The dark page with the blue diagonal panel, as Skia nodes in screen-content coordinates.
 * It is drawn once behind the scroll content, and glass surfaces draw it again (offset and
 * blurred) to imitate `backdrop-filter`.
 */
export function DiagonalBackdropNodes({ layout, width, height }: Props) {
  const { vertexX, vertexY, run, cornerRadius } = layout.backdrop;
  const s = layout.scale;

  const path = useMemo(() => {
    const bottom = height + OVERSCAN;
    const right = width + OVERSCAN;
    // The short top-right edge is perpendicular to the long diagonal: across 1, down `run`.
    return roundedPolygon(
      [
        [vertexX, vertexY],
        [right, vertexY + (right - vertexX) * run],
        [right, bottom],
        [vertexX - run * (bottom - vertexY), bottom],
      ],
      [cornerRadius, 0, 0, 0],
    );
  }, [vertexX, vertexY, run, cornerRadius, width, height]);

  // Figma's gradient box for the panel: 413.5 × 720.5 starting 20pt left of the frame.
  const gradientBox = { x: -20 * s, y: vertexY - 41 * s, width: 413.5 * s, height: 720.5 * s };

  return (
    <Group>
      <Rect x={-OVERSCAN} y={-OVERSCAN} width={width + OVERSCAN * 2} height={height + OVERSCAN * 2} color={colors.bg} />
      <Path path={path}>
        <LinearGradient {...skiaGradient(gradients.backdrop, gradientBox)} />
      </Path>
    </Group>
  );
}

/** Full-size backdrop canvas, placed behind the Discover scroll content. */
export function DiagonalBackdrop(props: Props) {
  return (
    <Canvas pointerEvents="none" style={[StyleSheet.absoluteFill, { height: props.height }]}>
      <DiagonalBackdropNodes {...props} />
    </Canvas>
  );
}

/** The backdrop translated into a child surface's local coordinates. */
export function BackdropBehind({ x, y, ...props }: Props & { x: number; y: number }) {
  return (
    <Group transform={[{ translateX: -x }, { translateY: -y }]}>
      <DiagonalBackdropNodes {...props} />
    </Group>
  );
}
