import type { ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";

import { cssGradient, cssShadow, gradients, radii, shadows, type ShadowToken } from "@/theme";

import { PressableScale } from "./PressableScale";

type Props = Omit<PressableProps, "style" | "children"> & {
  /** Square size; `width`/`height` override it for rectangular buttons. */
  size?: number;
  width?: number;
  height?: number;
  radius?: number;
  shadow?: readonly ShadowToken[];
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/** Accent-gradient button (search, back, cart "+", Add to Cart). Shrinks on press. */
export function AccentButton({
  size = 44,
  width = size,
  height = size,
  radius = radii.md,
  shadow = shadows.raised,
  style,
  children,
  ...rest
}: Props) {
  return (
    <PressableScale
      accessibilityRole="button"
      {...rest}
      style={[
        {
          width,
          height,
          borderRadius: radius,
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: cssGradient(gradients.accent),
          boxShadow: cssShadow(shadow),
        },
        style,
      ]}
    >
      {children}
    </PressableScale>
  );
}
