import { Text, View } from "react-native";

import type { CartTotals } from "@/state/pricing";
import { colors } from "@/theme";
import { formatMoney } from "@/utils/format";

type Props = { totals: CartTotals; totalGap: number };

/** Subtotal / Delivery Fee / Discount, then the Total line (Figma "Frame 3676", "Subtotal Total"). */
export function OrderSummary({ totals, totalGap }: Props) {
  const rows: [string, string][] = [
    ["Subtotal:", formatMoney(totals.subtotal)],
    ["Delivery Fee:", formatMoney(totals.delivery)],
    ["Discount:", `${Math.round(totals.discountRate * 100)}%`],
  ];
  return (
    <View className="px-5">
      <View style={{ gap: 8 }}>
        {rows.map(([label, value]) => (
          <View key={label} className="flex-row justify-between">
            <Text className="font-poppins-medium text-body" style={{ color: colors.textHigh }}>
              {label}
            </Text>
            <Text className="font-poppins text-body text-text-muted">{value}</Text>
          </View>
        ))}
      </View>
      <View className="flex-row items-center justify-between" style={{ marginTop: totalGap }}>
        <Text className="font-poppins-medium text-body" style={{ color: colors.textHigh }}>
          Total:
        </Text>
        <Text className="font-poppins-bold text-heading" style={{ color: colors.totalText }}>
          {formatMoney(totals.total)}
        </Text>
      </View>
    </View>
  );
}
