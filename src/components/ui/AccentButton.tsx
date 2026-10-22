import type { ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";

import { cssGradient, cssShadow, gradients, radii, shadows, type ShadowToken } from "@/theme";

import { PressableScale } from "./PressableScale";

type Props = Omit<PressableProps, "style" | "children"> & {
  size?: number;
  radius?: number;
  shadow?: readonly ShadowToken[];
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/** Square accent-gradient icon button (search, back, cart "+"). Shrinks on press. */
export function AccentButton({
  size = 44,
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
          width: size,
          height: size,
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
