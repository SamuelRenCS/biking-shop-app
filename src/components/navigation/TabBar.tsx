import { router } from "expo-router";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useMemo, type FC } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";

import {
  NavBicycleIcon,
  NavCartIcon,
  NavDocumentIcon,
  NavMapIcon,
  NavProfileIcon,
} from "@/components/ui/icons";
import { PressableScale } from "@/components/ui/PressableScale";
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

export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const height = useTabBarHeight();
  const slotWidth = width / ITEMS.length;
  const activeRoute = state.routes[state.index]?.name;

  const barPoints = useMemo<Point[]>(
    () => [
      [0, SLANT],
      [width, 0],
      [width, height],
      [0, height],
    ],
    [width, height],
  );

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

      {ITEMS.map((item, i) => {
        const center = slotWidth * (i + 0.5);
        const isActive = item.route === activeRoute;
        if (isActive) {
          return (
            <PressableScale
              key={item.label}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: true }}
              onPress={() => press(item)}
              style={{ position: "absolute", top: 0, left: center - 30 + TILE_OFFSET_X }}
            >
              <SkewedSurface
                width={60}
                height={60}
                points={TILE_POINTS}
                radius={10}
                fill={gradients.accent}
                shadows={shadows.floating}
                highlight={TILE_HIGHLIGHT}
              >
                <View style={styles.tileIcon}>
                  <item.Icon width={item.width} height={item.height} color={colors.white} />
                </View>
              </SkewedSurface>
            </PressableScale>
          );
        }
        return (
          <Pressable
            key={item.label}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            onPress={() => press(item)}
            hitSlop={8}
            style={{
              position: "absolute",
              left: center - slotWidth / 2,
              width: slotWidth,
              top: SLANT,
              height: ROW_HEIGHT,
            }}
          >
            <View style={{ position: "absolute", left: slotWidth / 2 - item.width / 2, top: ICON_CENTER_Y - SLANT - item.height / 2 }}>
              <item.Icon width={item.width} height={item.height} color={colors.textMuted} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", left: 0, right: 0, bottom: 0 },
  tileIcon: { flex: 1, alignItems: "center", justifyContent: "center" },
});
