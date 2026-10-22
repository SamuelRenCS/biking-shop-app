import { ScrollView, Text } from "react-native";

import type { Product } from "@/data/products";

/** Product name and copy. Scrolls if the copy outgrows the sheet (narrow screens, long text). */
export function DescriptionPanel({ product }: { product: Product }) {
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingLeft: 20, paddingRight: 35, paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="font-poppins-bold text-heading text-white">{product.name}</Text>
      <Text className="mt-2 font-poppins text-body text-text-muted">{product.description}</Text>
    </ScrollView>
  );
}
