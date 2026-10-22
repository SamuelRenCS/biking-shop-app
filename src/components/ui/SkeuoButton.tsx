import { useEffect, type ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const TRANSITION = { duration: 260, easing: Easing.inOut(Easing.quad) };

type Props = {
  selected: boolean;
  onPress?: () => void;
  /** Surface when not selected: gradient, shadow, radius. */
  idleStyle: StyleProp<ViewStyle>;
  /** Surface when selected. Crossfaded over the idle surface. */
  selectedStyle: StyleProp<ViewStyle>;
  /** Content opacity when not selected (Figma dims idle icons and labels to 60%). */
  idleContentOpacity?: number;
  /**
   * Content shown when selected, if it differs from `children` (e.g. a label that turns bold and
   * gradient). The two crossfade instead of `children` brightening.
   */
  selectedContent?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  children: ReactNode;
};

/**
 * Motion spec 3: skeuomorphic buttons move smoothly between idle and selected.
 *
 * RN can't interpolate between two gradients or two shadow stacks, so the idle and selected
 * surfaces are sibling layers and the selected one fades in over the idle one. The content
 * brightens (or crossfades to `selectedContent`) over the same timing.
 *
 * The idle surface must be its own layer, not the button's style: on iOS a view's inset shadow
 * is drawn above its children, so a pressed-in idle style would cover the raised selected layer.
 */
export function SkeuoButton({
  selected,
  onPress,
  idleStyle,
  selectedStyle,
  idleContentOpacity = 0.6,
  selectedContent,
  style,
  accessibilityLabel,
  children,
}: Props) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, TRANSITION);
  }, [selected, progress]);

  const selectedLayer = useAnimatedStyle(() => ({ opacity: progress.value }));
  const swapsContent = selectedContent !== undefined;
  const content = useAnimatedStyle(() => ({
    opacity: swapsContent
      ? 1 - progress.value
      : interpolate(progress.value, [0, 1], [idleContentOpacity, 1]),
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.base, style]}
    >
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, idleStyle]} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, selectedStyle, selectedLayer]} />
      <Animated.View style={content}>{children}</Animated.View>
      {swapsContent && (
        <Animated.View pointerEvents="none" style={[styles.overlay, selectedLayer]}>
          {selectedContent}
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
  overlay: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
});
