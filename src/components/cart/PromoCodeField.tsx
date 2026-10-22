import { useState } from "react";
import { Keyboard, Text, TextInput } from "react-native";

import { AccentButton } from "@/components/ui/AccentButton";
import { Well } from "@/components/ui/Well";
import { useCart } from "@/state/cart";
import { colors, cssShadow, fonts, radii, shadows } from "@/theme";

const APPLY_WIDTH = 114;

/** Figma "Coupon": an inset field with the Apply button docked on the right. */
export function PromoCodeField() {
  const { promoCode, applyPromo } = useCart();
  const [text, setText] = useState(promoCode ?? "");
  const [invalid, setInvalid] = useState(false);

  const apply = () => {
    setInvalid(!applyPromo(text));
    Keyboard.dismiss();
  };

  return (
    <Well
      className="mx-5 h-11 justify-center"
      surface={{ backgroundColor: colors.bg, boxShadow: cssShadow(shadows.inputWell), borderRadius: radii.sm }}
    >
      <TextInput
        value={text}
        onChangeText={(value) => {
          setText(value);
          setInvalid(false);
        }}
        onSubmitEditing={apply}
        placeholder="Promo code"
        placeholderTextColor="rgba(255, 255, 255, 0.3)"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        accessibilityLabel="Promo code"
        style={{
          position: "absolute",
          left: 12,
          right: APPLY_WIDTH + (invalid ? 110 : 12),
          height: 44,
          paddingVertical: 0,
          fontFamily: fonts.regular,
          fontSize: 13,
          letterSpacing: -0.08,
          color: colors.textMuted,
        }}
      />
      {invalid && (
        <Text
          className="absolute font-poppins-medium text-caption"
          style={{ right: APPLY_WIDTH + 12, color: colors.danger }}
          accessibilityLiveRegion="polite"
        >
          Invalid code
        </Text>
      )}
      <AccentButton
        width={APPLY_WIDTH}
        height={44}
        shadow={[]}
        onPress={apply}
        accessibilityLabel="Apply promo code"
        style={{ position: "absolute", right: 0 }}
      >
        <Text className="font-poppins-bold text-caption text-white" style={{ letterSpacing: -0.08 }}>
          Apply
        </Text>
      </AccentButton>
    </Well>
  );
}
