import { useEffect, useRef } from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

import { useFavorites } from "@/state/favorites";
import { colors } from "@/theme";

import { HeartIcon, HeartLikedIcon } from "./icons";

const POP_SCALE = 1.25;

/**
 * Favourite toggle: the white outline turns into the blue Figma heart (icon_heart_liked.svg, the
 * same #34CAE8 → #4E49F2 gradient as `gradients.accentIcon`) and back, with a small scale pop.
 * Sized like Figma's 24 × 24 "heart / 24 / Outline" box.
 */
export function HeartButton({ productId, style }: { productId: string; style?: StyleProp<ViewStyle> }) {
  const { isFavorite, toggle } = useFavorites();
  const liked = isFavorite(productId);
  const scale = useSharedValue(1);

  // Pop on every change after mount, whichever direction it goes.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    scale.value = withSequence(
      withTiming(POP_SCALE, { duration: 110, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) }),
    );
  }, [liked, scale]);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={() => toggle(productId)}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Favourite"
      accessibilityState={{ selected: liked }}
      style={[{ width: 24, height: 24, alignItems: "center", justifyContent: "center" }, style]}
    >
      <Animated.View style={popStyle}>
        {liked ? <HeartLikedIcon width={20} height={18} /> : <HeartIcon width={20} height={18} color={colors.white} />}
      </Animated.View>
    </Pressable>
  );
}
