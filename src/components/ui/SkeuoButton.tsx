import { useEffect, type ReactNode } from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
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
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  children: ReactNode;
};

/**
 * Motion spec 3: skeuomorphic buttons move smoothly between idle and selected.
 *
 * RN can't interpolate between two gradients or two shadow stacks, so the selected surface is a
 * separate layer whose opacity animates. The content brightens over the same timing.
 */
export function SkeuoButton({
  selected,
  onPress,
  idleStyle,
  selectedStyle,
  idleContentOpacity = 0.6,
  style,
  accessibilityLabel,
  children,
}: Props) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, TRANSITION);
  }, [selected, progress]);

  const selectedLayer = useAnimatedStyle(() => ({ opacity: progress.value }));
  const content = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [idleContentOpacity, 1]),
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.base, idleStyle, style]}
    >
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, selectedStyle, selectedLayer]} />
      <Animated.View style={content}>{children}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
});
