import { router } from "expo-router";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useEffect, useMemo, useRef, type FC } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";

import {
  NavBicycleIcon,
  NavCartIcon,
  NavDocumentIcon,
  NavMapIcon,
  NavProfileIcon,
} from "@/components/ui/icons";
import { SkewedSurface, type EdgeHighlight, type Point } from "@/components/ui/SkewedSurface";
import { colors, gradients, shadows } from "@/theme";

const SLANT = 20; // the bar's top edge drops 20pt from right to left
const ROW_HEIGHT = 49;
const ICON_CENTER_Y = SLANT + 18.7; // Figma centres icons 5.8pt above the 49pt row's middle

type TabItem = {
  label: string;
  Icon: FC<SvgProps>;
  width: number;
  height: number;
  /** A tab route in (tabs)/, or a pushed screen (the cart opens over the tabs). */
  route?: string;
  href?: "/cart";
};

const ITEMS: TabItem[] = [
  { label: "Discover", route: "index", Icon: NavBicycleIcon, width: 28, height: 18 },
  { label: "Map", route: "map", Icon: NavMapIcon, width: 19, height: 18 },
  { label: "Cart", href: "/cart", Icon: NavCartIcon, width: 21, height: 18 },
  { label: "Profile", route: "profile", Icon: NavProfileIcon, width: 15, height: 16 },
  { label: "Documents", route: "documents", Icon: NavDocumentIcon, width: 16, height: 20 },
];

/** Total height including the slant and the home-indicator inset. Screens pad their content by it. */
export function useTabBarHeight() {
  const { bottom } = useSafeAreaInsets();
  return SLANT + ROW_HEIGHT + bottom;
}

// selected_button.svg: a 60pt parallelogram rising 12pt to the right, with an overlay hairline.
const TILE_POINTS: Point[] = [
  [0, 12],
  [60, 0],
  [60, 48],
  [0, 60],
];
const TILE_HIGHLIGHT: EdgeHighlight = {
  from: [0, 0],
  to: [0.57, 1.2],
  stops: [
    { color: "white", at: 0 },
    { color: "black", at: 1 },
  ],
  width: 1,
  opacity: 0.6,
  blendMode: "overlay",
};
// Figma nudges the tile 8pt right of its slot centre.
const TILE_OFFSET_X = 8;
const TILE_SIZE = 60;

// Switching tabs: the tile glides over and leans into the move; icons crossfade on the same beat.
const GLIDE = { duration: 300, easing: Easing.out(Easing.cubic) };
const FADE = { duration: 220, easing: Easing.out(Easing.quad) };
const LEAN_DEG = 5;
const PRESS_SCALE = 0.92;

export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const height = useTabBarHeight();
  const slotWidth = width / ITEMS.length;
  const activeRoute = state.routes[state.index]?.name;
  const activeIndex = Math.max(0, ITEMS.findIndex((item) => item.route === activeRoute));

  const barPoints = useMemo<Point[]>(
    () => [
      [0, SLANT],
      [width, 0],
      [width, height],
      [0, height],
    ],
    [width, height],
  );

  // Where the tile sits for each slot. Figma only shows it on Discover; on the other tabs it rides
  // the bar's sloped top edge so it sits on the bar the same way.
  const tileFrame = (index: number) => {
    const centerX = slotWidth * (index + 0.5) + TILE_OFFSET_X;
    const edgeY = (x: number) => SLANT * (1 - x / width);
    const homeX = slotWidth * 0.5 + TILE_OFFSET_X;
    return { x: centerX - TILE_SIZE / 2, y: edgeY(centerX) - edgeY(homeX) };
  };

  const tileX = useSharedValue(tileFrame(activeIndex).x);
  const tileY = useSharedValue(tileFrame(activeIndex).y);
  const lean = useSharedValue(0);
  const pressed = useSharedValue(0);
  const previousIndex = useRef(activeIndex);

  useEffect(() => {
    const { x, y } = tileFrame(activeIndex);
    if (previousIndex.current === activeIndex) {
      // Layout change (e.g. rotation or first render): jump, don't glide.
      tileX.value = x;
      tileY.value = y;
      return;
    }
    const direction = Math.sign(activeIndex - previousIndex.current);
    previousIndex.current = activeIndex;
    tileX.value = withTiming(x, GLIDE);
    tileY.value = withTiming(y, GLIDE);
    lean.value = withSequence(
      withTiming(direction * LEAN_DEG, { duration: 110, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) }),
    );
    // tileFrame only depends on width/slotWidth, which are already covered by `width`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, width]);

  const tileStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tileX.value },
      { translateY: tileY.value },
      { rotate: `${lean.value}deg` },
      // The tile is an accent button: it shrinks while its tab is pressed.
      { scale: 1 - (1 - PRESS_SCALE) * pressed.value },
    ],
  }));

  const press = (item: TabItem) => {
    if (item.href) {
      router.push(item.href);
      return;
    }
    const target = state.routes.find((r) => r.name === item.route);
    if (!target) return;
    // Same contract as the stock tab bar: emit tabPress, then switch unless prevented.
    const event = emitter.emit({ type: "tabPress", target: target.key, canPreventDefault: true });
    if (!event.defaultPrevented && activeRoute !== item.route) navigateToTab(target.key);
  };

  return (
    <View style={[styles.container, { height }]}>
      <SkewedSurface width={width} height={height} points={barPoints} radius={0} fill={gradients.tabBar} />

      {/* Muted icons in the bar; each fades out while the tile covers its slot. */}
      {ITEMS.map((item, i) => (
        <SlotIcon key={item.label} item={item} active={i === activeIndex} centerX={slotWidth * (i + 0.5)} />
      ))}

      <Animated.View pointerEvents="none" style={[styles.tile, tileStyle]}>
        <SkewedSurface
          width={TILE_SIZE}
          height={TILE_SIZE}
          points={TILE_POINTS}
          radius={10}
          fill={gradients.accent}
          shadows={shadows.floating}
          highlight={TILE_HIGHLIGHT}
        >
          {/* White icons stacked in the tile; the outgoing one fades as the incoming one fades in. */}
          {ITEMS.filter((item) => item.route).map((item) => (
            <TileIcon key={item.label} item={item} active={item.route === activeRoute} />
          ))}
        </SkewedSurface>
      </Animated.View>

      {ITEMS.map((item, i) => {
        const isActive = i === activeIndex;
        return (
          <Pressable
            key={item.label}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => press(item)}
            onPressIn={() => {
              if (isActive) pressed.value = withTiming(1, { duration: 90 });
            }}
            onPressOut={() => {
              pressed.value = withTiming(0, { duration: 160 });
            }}
            style={{ position: "absolute", left: slotWidth * i, width: slotWidth, top: 0, height: SLANT + ROW_HEIGHT }}
          />
        );
      })}
    </View>
  );
}

function useCrossfade(active: boolean) {
  const progress = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, FADE);
  }, [active, progress]);
  return progress;
}

function SlotIcon({ item, active, centerX }: { item: TabItem; active: boolean; centerX: number }) {
  const progress = useCrossfade(active);
  const style = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: "absolute", left: centerX - item.width / 2, top: ICON_CENTER_Y - item.height / 2 },
        style,
      ]}
    >
      <item.Icon width={item.width} height={item.height} color={colors.textMuted} />
    </Animated.View>
  );
}

function TileIcon({ item, active }: { item: TabItem; active: boolean }) {
  const progress = useCrossfade(active);
  const style = useAnimatedStyle(() => ({ opacity: progress.value }));
  return (
    <Animated.View style={[styles.tileIcon, style]}>
      <item.Icon width={item.width} height={item.height} color={colors.white} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", left: 0, right: 0, bottom: 0 },
  tile: { position: "absolute", left: 0, top: 0 },
  tileIcon: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
});
