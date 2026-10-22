import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESSED_SCALE = 0.92;
const PRESS_IN = { duration: 90, easing: Easing.out(Easing.quad) };
const PRESS_OUT = { duration: 160, easing: Easing.out(Easing.quad) };

type Props = Omit<PressableProps, "style"> & { style?: StyleProp<ViewStyle> };

/** Motion spec 2: accent-coloured buttons shrink while pressed. */
export function PressableScale({ style, onPressIn, onPressOut, children, ...rest }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      style={[style, animatedStyle]}
      onPressIn={(e) => {
        scale.value = withTiming(PRESSED_SCALE, PRESS_IN);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, PRESS_OUT);
        onPressOut?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
