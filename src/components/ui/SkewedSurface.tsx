import {
  Blur,
  Canvas,
  Group,
  LinearGradient,
  Paint,
  Path,
  Shadow,
  Skia,
  vec,
  type SkPath,
} from "@shopify/react-native-skia";
import { useMemo, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { skiaGradient, skiaShadow, shadowOutset } from "@/theme/skia";
import type { GradientStop, LinearGradientToken, ShadowToken } from "@/theme";

export type Point = readonly [number, number];

/** A closed polygon whose corners are rounded with circular arcs (radius per corner or shared). */
export function roundedPolygon(points: readonly Point[], radius: number | readonly number[]): SkPath {
  const builder = Skia.PathBuilder.Make();
  const n = points.length;
  const r = (i: number) => (typeof radius === "number" ? radius : radius[i] ?? 0);
  const last = points[n - 1];
  builder.moveTo((last[0] + points[0][0]) / 2, (last[1] + points[0][1]) / 2);
  for (let i = 0; i < n; i++) {
    const [x, y] = points[i];
    const [nx, ny] = points[(i + 1) % n];
    if (r(i) > 0) builder.arcToTangent(x, y, nx, ny, r(i));
    else builder.lineTo(x, y);
  }
  return builder.close().detach();
}

/**
 * Figma's inner hairline: a gradient stroke between two points, given as fractions of the box.
 * Drawn at double width and clipped to the shape, so only the inside half shows (the export uses
 * the same trick: stroke-width 4 masked by the shape).
 */
export type EdgeHighlight = {
  from: Point;
  to: Point;
  stops: readonly GradientStop[];
  width: number;
  opacity: number;
  blendMode?: "overlay" | "srcOver";
};

type Props = {
  /** Bounding box of the polygon; the view takes this size. */
  width: number;
  height: number;
  points: readonly Point[];
  radius: number | readonly number[];
  fill: LinearGradientToken;
  shadows?: readonly ShadowToken[];
  highlight?: EdgeHighlight;
  /**
   * What sits behind the surface, drawn in this surface's local coordinates. It is blurred by
   * `backdropBlur` (a CSS blur radius) and clipped to the shape, standing in for CSS
   * `backdrop-filter`, which RN and Skia can't apply to native views underneath.
   */
  backdrop?: ReactNode;
  backdropBlur?: number;
  /** Extra Skia nodes painted over the fill (e.g. soft contact shadows under a product). */
  decorations?: ReactNode;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/** A non-rectangular surface (slanted card, tab bar, tilted tile) drawn with Skia. Children render on top. */
export function SkewedSurface({
  width,
  height,
  points,
  radius,
  fill,
  shadows = [],
  highlight,
  backdrop,
  backdropBlur = 0,
  decorations,
  style,
  children,
}: Props) {
  const path = useMemo(() => roundedPolygon(points, radius), [points, radius]);
  const box = { x: 0, y: 0, width, height };
  // The canvas extends past the view so shadows aren't clipped.
  const pad = Math.ceil(shadowOutset(shadows));

  return (
    <View style={[{ width, height }, style]}>
      <Canvas
        pointerEvents="none"
        style={{ position: "absolute", left: -pad, top: -pad, width: width + pad * 2, height: height + pad * 2 }}
      >
        <Group transform={[{ translateX: pad }, { translateY: pad }]}>
          {shadows.length > 0 && (
            // Figma/CSS drop shadows never show through the shape itself.
            <Group clip={path} invertClip>
              {shadows.map((s, i) => (
                <Path key={i} path={path} color="black">
                  <Shadow {...skiaShadow(s)} shadowOnly />
                </Path>
              ))}
            </Group>
          )}

          {backdrop && (
            <Group clip={path}>
              <Group
                layer={
                  backdropBlur > 0 ? (
                    <Paint>
                      <Blur blur={backdropBlur / 2} mode="clamp" />
                    </Paint>
                  ) : undefined
                }
              >
                {backdrop}
              </Group>
            </Group>
          )}

          <Path path={path}>
            <LinearGradient {...skiaGradient(fill, box)} />
          </Path>

          {decorations}

          {highlight && (
            <Group clip={path}>
              <Path
                path={path}
                style="stroke"
                strokeWidth={highlight.width * 2}
                opacity={highlight.opacity}
                blendMode={highlight.blendMode ?? "srcOver"}
              >
                <LinearGradient
                  start={vec(highlight.from[0] * width, highlight.from[1] * height)}
                  end={vec(highlight.to[0] * width, highlight.to[1] * height)}
                  colors={highlight.stops.map((s) => s.color)}
                  positions={highlight.stops.map((s) => s.at)}
                />
              </Path>
            </Group>
          )}
        </Group>
      </Canvas>
      {children && <View style={StyleSheet.absoluteFill}>{children}</View>}
    </View>
  );
}
