import { Fragment } from "react";
import { KeyboardAvoidingView, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CartItemRow } from "@/components/cart/CartItemRow";
import { CheckoutSlider } from "@/components/cart/CheckoutSlider";
import { cartLayout } from "@/components/cart/layout";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { PromoCodeField } from "@/components/cart/PromoCodeField";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { products } from "@/data/products";
import { useCart } from "@/state/cart";
import { cartTotals, type CartTotals } from "@/state/pricing";
import { colors } from "@/theme";
import { formatMoney } from "@/utils/format";

export default function CartScreen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { lines, promoCode, setQuantity } = useCart();
  const totals = cartTotals(lines, products, promoCode);
  const { gaps, bottomGap } = cartLayout(height, insets);

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-bg">
      <ScreenHeader title="My Shopping Cart" />

      <ScrollView className="flex-1" style={{ marginTop: gaps.list }} showsVerticalScrollIndicator={false}>
        {lines.length === 0 && (
          <Text className="mt-10 text-center font-poppins text-body text-text-muted">Your cart is empty</Text>
        )}
        {lines.map((line, i) => (
          <Fragment key={line.productId}>
            <CartItemRow
              product={products[line.productId]}
              quantity={line.quantity}
              onQuantityChange={(quantity) => setQuantity(line.productId, quantity)}
            />
            <View
              className="mt-4"
              style={{ height: 1, backgroundColor: colors.separator, marginBottom: i < lines.length - 1 ? 16 : 0 }}
            />
          </Fragment>
        ))}
      </ScrollView>

      <Text className="text-center font-poppins text-body text-text-muted" style={{ marginTop: gaps.message }}>
        {shippingMessage(totals, lines.length)}
      </Text>
      <View style={{ marginTop: gaps.promo }}>
        <PromoCodeField />
      </View>
      <View style={{ marginTop: gaps.summary }}>
        <OrderSummary totals={totals} totalGap={gaps.total} />
      </View>
      <View style={{ marginTop: gaps.checkout, marginBottom: bottomGap }}>
        <CheckoutSlider disabled={lines.length === 0} />
      </View>
    </KeyboardAvoidingView>
  );
}

function shippingMessage(totals: CartTotals, itemCount: number) {
  if (itemCount === 0) return "Add a bike to get free shipping";
  if (totals.qualifiesForFreeShipping) return "Your cart qualifies for free shipping";
  return `Add ${formatMoney(totals.toFreeShipping)} more for free shipping`;
}
