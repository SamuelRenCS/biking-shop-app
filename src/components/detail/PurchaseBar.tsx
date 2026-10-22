import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

import { AccentButton } from "@/components/ui/AccentButton";
import type { Product } from "@/data/products";
import { useCart } from "@/state/cart";
import { colors, cssShadow, shadows } from "@/theme";
import { formatPrice } from "@/utils/format";

const CONFIRM_MS = 1500;

/** Price and Add to Cart, docked to the bottom of the sheet ("Buy Now" in Figma). */
export function PurchaseBar({ product, height }: { product: Product; height: number }) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const addToCart = () => {
    add(product.id);
    // The design has no added state; a short label change confirms the tap without new UI.
    setJustAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), CONFIRM_MS);
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row justify-between px-[35px] pt-[30px]"
      style={{
        height,
        backgroundColor: colors.surface100,
        boxShadow: cssShadow(shadows.bottomBar),
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
      }}
    >
      <Text className="font-poppins text-price" style={{ color: colors.accentText, marginTop: 4 }}>
        {formatPrice(product.price)}
      </Text>
      <AccentButton
        width={160}
        height={44}
        shadow={shadows.ctaButton}
        onPress={addToCart}
        accessibilityLabel={`Add ${product.name} to cart`}
      >
        <Text className="font-poppins-medium text-body text-white">{justAdded ? "Added to Cart" : "Add to Cart"}</Text>
      </AccentButton>
    </View>
  );
}
