import { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { ChevronForwardIcon } from "@/components/ui/icons";
import { Well } from "@/components/ui/Well";
import { colors, cssGradient, cssShadow, gradients, radii, shadows } from "@/theme";

const TRACK_WIDTH = 174;
const KNOB = 44;
const TRAVEL = TRACK_WIDTH - KNOB;
const COMPLETE_AT = 0.7; // drag at least 70% of the way (or flick) to confirm
const SLIDE = { duration: 220, easing: Easing.out(Easing.cubic) };
const PRESS = { duration: 120, easing: Easing.out(Easing.quad) };
const RESET_AFTER_MS = 1800;

type Props = { disabled?: boolean };

/**
 * Motion spec 4: checkout slides from left to right. Drag the accent knob along the inset track;
 * past 70% (or with a flick) it finishes the slide and confirms, otherwise it slides back. The
 * knob is an accent button, so it also shrinks while held. Screen readers get an "activate"
 * action instead of the drag.
 *
 * Everything follows the knob's position `x`: "Checkout" fades as the knob covers it, and
 * "Done!" is revealed in the track the knob has passed (clipped to it, fading in). Sliding back,
 * whether released early or reset after confirming, hides it again the same way.
 */
export function CheckoutSlider({ disabled = false }: Props) {
  const x = useSharedValue(0);
  const pressed = useSharedValue(0);
  const [done, setDone] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(resetTimer.current), []);

  // There is no order flow in the design (or a backend): hold on "Done!", then slide back.
  const complete = () => {
    setDone(true);
    resetTimer.current = setTimeout(() => {
      x.value = withTiming(0, SLIDE);
      setDone(false);
    }, RESET_AFTER_MS);
  };
  // Worklets need a stable JS function to schedule; it forwards to the latest `complete`.
  const completeRef = useRef(complete);
  completeRef.current = complete;
  const [notifyComplete] = useState(() => () => completeRef.current());

  const pan = usePanGesture({
    enabled: !disabled && !done,
    activeOffsetX: [-8, 8],
    onBegin: () => {
      pressed.value = withTiming(1, PRESS);
    },
    onUpdate: (e) => {
      x.value = Math.min(TRAVEL, Math.max(0, e.translationX));
    },
    onDeactivate: (e) => {
      const confirm = x.value > TRAVEL * COMPLETE_AT || (e.velocityX > 800 && x.value > TRAVEL * 0.3);
      x.value = withTiming(confirm ? TRAVEL : 0, SLIDE, (finished) => {
        if (finished && confirm) scheduleOnRN(notifyComplete);
      });
    },
    onFinalize: () => {
      pressed.value = withTiming(0, PRESS);
    },
  });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { scale: interpolate(pressed.value, [0, 1], [1, 0.92]) }],
  }));
  // The label fades as the knob slides over it.
  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, TRAVEL * 0.6], [1, 0], "clamp"),
  }));
  // "Done!" lives in the space behind the knob: clipped to the track up to the knob's left edge,
  // and fading in over the second half of the slide so it reads fully only at the end.
  const doneClip = useAnimatedStyle(() => ({ width: x.value }));
  const doneStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [TRAVEL * 0.35, TRAVEL], [0, 1], "clamp"),
  }));

  return (
    <Well
      style={[styles.track, disabled && { opacity: 0.5 }]}
      surface={styles.trackSurface}
      accessible
      accessibilityRole="button"
      accessibilityLabel={done ? "Done" : "Slide to checkout"}
      accessibilityState={{ disabled }}
      accessibilityActions={[{ name: "activate" }]}
      onAccessibilityAction={() => {
        if (disabled || done) return;
        x.value = withTiming(TRAVEL, SLIDE, (finished) => {
          if (finished) scheduleOnRN(notifyComplete);
        });
      }}
    >
      <Animated.Text
        className="absolute font-poppins-medium text-body text-text-muted"
        style={[{ left: 67, letterSpacing: -0.08 }, labelStyle]}
      >
        Checkout
      </Animated.Text>
      <Animated.View pointerEvents="none" style={[styles.doneClip, doneClip]}>
        <Animated.Text
          className="text-center font-poppins-medium text-body text-white"
          style={[styles.doneText, doneStyle]}
        >
          Done!
        </Animated.Text>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.knob, knobStyle]}>
          <ChevronForwardIcon width={9} height={16} color={colors.white} />
        </Animated.View>
      </GestureDetector>
    </Well>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: KNOB,
    justifyContent: "center",
    alignSelf: "center",
  },
  trackSurface: {
    backgroundColor: colors.bg,
    boxShadow: cssShadow(shadows.checkoutTrack),
    borderRadius: radii.md,
  },
  doneClip: { position: "absolute", left: 0, top: 0, bottom: 0, overflow: "hidden", justifyContent: "center" },
  // Fixed to the full passed-over area, so the clip uncovers it rather than re-centring it.
  doneText: { width: TRAVEL, letterSpacing: -0.08 },
  knob: {
    position: "absolute",
    left: 0,
    width: KNOB,
    height: KNOB,
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: cssGradient(gradients.accent),
    borderRadius: radii.md,
  },
});
