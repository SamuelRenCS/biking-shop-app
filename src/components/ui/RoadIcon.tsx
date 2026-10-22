import { StyleSheet, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import RoadShape from "@assets/icons/icon_road.svg";

// The SVG export dropped the lane markings: four black rectangles (Figma "Rectangle 476–479"),
// in the icon's 30×30 space.
const LANES = [
  [14.49, 13, 1.1, 1.19],
  [14.28, 15.64, 1.49, 1.27],
  [13.77, 19.12, 2.42, 2.29],
  [13.47, 24.39, 3.1, 2.8],
] as const;

export function RoadIcon({ width = 30, height = 30, color }: { width?: number; height?: number; color?: string }) {
  return (
    <View style={{ width, height }}>
      <RoadShape width={width} height={height} color={color} />
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 30 30">
        {LANES.map(([x, y, w, h]) => (
          <Rect key={y} x={x} y={y} width={w} height={h} fill="#000" />
        ))}
      </Svg>
    </View>
  );
}
