import { withLayoutContext } from "expo-router";
import {
  createNavigatorFactory,
  StackActions,
  StackRouter,
  useNavigationBuilder,
  type DefaultNavigatorOptions,
  type Descriptor,
  type ParamListBase,
  type Route,
  type StackNavigationState,
  type StackRouterOptions,
} from "expo-router/react-navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { colors } from "@/theme";

/**
 * A stack navigator whose screen transitions run on Reanimated, since the motion spec requires it.
 * The built-in stacks animate natively (native-stack) or with RN Animated (JS stack).
 *
 * - Push: the new screen slides in from the right (right-to-left).
 * - Pop (back button, router.back(), Android back): the top screen slides out to the right.
 * - Swipe back: dragging from the left edge moves the top screen with the finger.
 *   It completes past 35% of the width or on a fast flick, and springs back otherwise.
 *
 * A popped route has already left navigation state when we hear about it, so it is kept in
 * `closing` and rendered until its exit animation finishes.
 */

const TRANSITION = { duration: 350, easing: Easing.out(Easing.cubic) };
const EDGE_WIDTH = 30;

type SlideStackOptions = Record<string, never>;
type Props = DefaultNavigatorOptions<
  ParamListBase,
  string | undefined,
  StackNavigationState<ParamListBase>,
  SlideStackOptions,
  Record<string, never>,
  unknown
> &
  StackRouterOptions;

function SlideStackNavigator({ id, initialRouteName, children, screenListeners, screenOptions, layout }: Props) {
  const { state, descriptors, navigation, NavigationContent } = useNavigationBuilder(StackRouter, {
    id,
    initialRouteName,
    children,
    screenListeners,
    screenOptions,
    layout,
  });

  // Descriptors only exist for routes still in state, so remember them for closing routes.
  const descriptorCache = useRef<Record<string, Descriptor<object, any, any>>>({});
  Object.assign(descriptorCache.current, descriptors);

  // Derive the closing routes during render, so a popped screen never unmounts for a frame.
  const [tracked, setTracked] = useState({ routes: state.routes, closing: [] as Route<string>[] });
  if (tracked.routes !== state.routes) {
    const isLive = (key: string) => state.routes.some((r) => r.key === key);
    const removed = tracked.routes.filter((r) => !isLive(r.key));
    setTracked({
      routes: state.routes,
      closing: [...tracked.closing.filter((r) => !isLive(r.key)), ...removed],
    });
  }

  // Screens present at first render (the initial route) appear without animating.
  const hasMounted = useRef(false);
  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const finishClosing = (key: string) => {
    setTracked((t) => ({ ...t, closing: t.closing.filter((r) => r.key !== key) }));
    delete descriptorCache.current[key];
  };

  return (
    <NavigationContent>
      <View style={styles.container}>
        {state.routes.map((route, index) => (
          <SlideScreen
            key={route.key}
            animateIn={hasMounted.current && index > 0}
            closing={false}
            canSwipeBack={index > 0 && index === state.index}
            onSwipeBack={() =>
              navigation.dispatch({ ...StackActions.pop(), source: route.key, target: state.key })
            }
            onClosed={() => {}}
          >
            {descriptors[route.key].render()}
          </SlideScreen>
        ))}
        {tracked.closing.map((route) => (
          <SlideScreen
            key={route.key}
            animateIn={false}
            closing
            canSwipeBack={false}
            onSwipeBack={() => {}}
            onClosed={() => finishClosing(route.key)}
          >
            {descriptorCache.current[route.key]?.render()}
          </SlideScreen>
        ))}
      </View>
    </NavigationContent>
  );
}

type SlideScreenProps = {
  animateIn: boolean;
  closing: boolean;
  canSwipeBack: boolean;
  onSwipeBack: () => void;
  onClosed: () => void;
  children: ReactNode;
};

function SlideScreen({ animateIn, closing, canSwipeBack, onSwipeBack, onClosed, children }: SlideScreenProps) {
  const { width } = useWindowDimensions();
  // 1 = fully on screen, 0 = fully off to the right.
  const progress = useSharedValue(animateIn ? 0 : 1);

  // Parent callbacks change identity every render; keep stable wrappers for worklets and effects.
  const callbacks = useRef({ onClosed, onSwipeBack });
  callbacks.current = { onClosed, onSwipeBack };
  const [notifyClosed] = useState(() => () => callbacks.current.onClosed());
  const [notifySwipedBack] = useState(() => () => callbacks.current.onSwipeBack());

  useEffect(() => {
    if (animateIn) progress.value = withTiming(1, TRANSITION);
    // Only on mount: whether to animate in is decided once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!closing) return;
    progress.value = withTiming(0, TRANSITION, (finished) => {
      if (finished) scheduleOnRN(notifyClosed);
    });
  }, [closing, notifyClosed, progress]);

  const swipeBack = usePanGesture({
    enabled: canSwipeBack,
    hitSlop: { left: 0, width: EDGE_WIDTH },
    activeOffsetX: 10,
    failOffsetY: [-20, 20],
    onUpdate: (e) => {
      progress.value = Math.min(1, Math.max(0, 1 - e.translationX / width));
    },
    onDeactivate: (e) => {
      const dismiss = e.translationX > width * 0.35 || e.velocityX > 800;
      progress.value = withTiming(dismiss ? 0 : 1, TRANSITION, (finished) => {
        // The pop then lists this route as closing. It is already off screen, so it unmounts at once.
        if (finished && dismiss) scheduleOnRN(notifySwipedBack);
      });
    },
  });

  const slide = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - progress.value) * width }],
  }));

  return (
    <GestureDetector gesture={swipeBack}>
      <Animated.View style={[styles.screen, slide]} pointerEvents={closing ? "none" : "auto"}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  screen: { ...StyleSheet.absoluteFill, backgroundColor: colors.bg },
});

const createSlideStackNavigator = createNavigatorFactory(SlideStackNavigator);

/** File-based (expo-router) version of the navigator, used like `<Stack />` in a `_layout.tsx`. */
export const SlideStack = withLayoutContext<
  SlideStackOptions,
  typeof SlideStackNavigator,
  StackNavigationState<ParamListBase>,
  Record<string, never>
>(createSlideStackNavigator().Navigator);
