import { useState } from "react";
import { Text } from "react-native";

import { AccentButton } from "@/components/ui/AccentButton";
import { AddIcon, RemoveIcon } from "@/components/ui/icons";
import { SkeuoButton } from "@/components/ui/SkeuoButton";
import { Well } from "@/components/ui/Well";
import { colors, cssShadow, gradients, radii, shadows } from "@/theme";

// The "−" is a skeuomorphic key: it eases into a pressed-in look while held. The "+" is an
// accent button, so it shrinks on press.
const minusIdle = { backgroundColor: colors.surface400, borderRadius: radii.xs };
const minusPressed = { backgroundColor: colors.surface200, boxShadow: cssShadow(shadows.well), borderRadius: radii.xs };

type Props = { quantity: number; onChange: (quantity: number) => void; label: string };

/** Figma "Frame 3661": a 30pt well holding −, the count and +. Going below 1 removes the item. */
export function QuantityStepper({ quantity, onChange, label }: Props) {
  const [minusDown, setMinusDown] = useState(false);
  return (
    <Well
      className="h-[30px] flex-row items-center px-[3px]"
      style={{ gap: 10 }}
      surface={{ backgroundColor: colors.bg, boxShadow: cssShadow(shadows.well), borderRadius: radii.sm }}
    >
      <SkeuoButton
        selected={minusDown}
        onPressIn={() => setMinusDown(true)}
        onPressOut={() => setMinusDown(false)}
        onPress={() => onChange(quantity - 1)}
        idleStyle={minusIdle}
        selectedStyle={minusPressed}
        idleContentOpacity={1}
        accessibilityLabel={quantity === 1 ? `Remove ${label}` : `Decrease ${label}`}
        style={{ width: 24, height: 24 }}
      >
        {/* White at 60% as in Figma (react-native-svg ignores an rgba currentColor's alpha). */}
        <RemoveIcon width={16} height={2} color={colors.white} opacity={0.6} />
      </SkeuoButton>
      <Text className="min-w-[5px] text-center font-poppins-semibold text-caption text-text-muted">{quantity}</Text>
      <AccentButton
        size={24}
        radius={radii.xs}
        gradient={gradients.accentSmall}
        shadow={[]}
        onPress={() => onChange(quantity + 1)}
        accessibilityLabel={`Increase ${label}`}
      >
        <AddIcon width={16} height={16} color={colors.white} />
      </AccentButton>
    </Well>
  );
}
