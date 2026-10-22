import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";

type Props = ViewProps & {
  /** The inset surface: background, inset `boxShadow`, radius. */
  surface: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/**
 * A pressed-in container (stepper, promo field, checkout track, data panel).
 *
 * On iOS a view's inset shadow is drawn above its children, so putting it on the container
 * would darken whatever sits inside (the checkout knob, the Apply button). The surface goes on
 * its own layer behind the children instead.
 */
export function Well({ surface, style, children, ...rest }: Props) {
  return (
    <View {...rest} style={style}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, surface]} />
      {children}
    </View>
  );
}
