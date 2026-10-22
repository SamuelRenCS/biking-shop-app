import { Canvas, Group, LinearGradient, Path, Rect } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { colors, gradients } from "@/theme";
import { skiaGradient } from "@/theme/skia";

import { roundedPolygon } from "./SkewedSurface";

const OVERSCAN = 2000; // keeps the shape filled past the edges (overscroll bounce, blur sampling)

/**
 * The blue panel from Figma ("BG", a rotated rectangle). Each screen rotates and places it
 * differently, so callers describe it by its top corner and the slope of its long left edge.
 */
export type BackdropGeometry = {
  /** Top corner of the panel. */
  vertexX: number;
  vertexY: number;
  /** How far the long left edge moves left for every 1pt down. */
  run: number;
  cornerRadius: number;
  /** Box the CSS gradient is laid out over (Figma's 413.5 × 720.5 layer bounds). */
  gradientBox: { x: number; y: number; width: number; height: number };
};

type Props = { geometry: BackdropGeometry; width: number; height: number };

/** The dark page with the blue diagonal panel, as Skia nodes in screen-content coordinates. */
export function DiagonalBackdropNodes({ geometry, width, height }: Props) {
  const { vertexX, vertexY, run, cornerRadius, gradientBox } = geometry;

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

  return (
    <Group>
      <Rect x={-OVERSCAN} y={-OVERSCAN} width={width + OVERSCAN * 2} height={height + OVERSCAN * 2} color={colors.bg} />
      <Path path={path}>
        <LinearGradient {...skiaGradient(gradients.backdrop, gradientBox)} />
      </Path>
    </Group>
  );
}

/** Full-size backdrop canvas, placed behind a screen's content. */
export function DiagonalBackdrop(props: Props) {
  return (
    <Canvas pointerEvents="none" style={[StyleSheet.absoluteFill, { height: props.height }]}>
      <DiagonalBackdropNodes {...props} />
    </Canvas>
  );
}

/**
 * The backdrop translated into a child surface's local coordinates, so a glass surface can draw
 * (and blur) exactly what is behind it.
 */
export function BackdropBehind({ x, y, ...props }: Props & { x: number; y: number }) {
  return (
    <Group transform={[{ translateX: -x }, { translateY: -y }]}>
      <DiagonalBackdropNodes {...props} />
    </Group>
  );
}
