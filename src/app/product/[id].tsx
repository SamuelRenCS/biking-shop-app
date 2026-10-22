import { useLocalSearchParams } from "expo-router";

import { PlaceholderScreen } from "@/components/ui/PlaceholderScreen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { products } from "@/data/products";

// Stub so the Reanimated screen transition can be checked now. Built out in the Detail step.
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = products[id];
  return (
    <PlaceholderScreen
      header={<ScreenHeader title={product?.name ?? "Product"} />}
      title="Product detail"
      note="Next step. Swipe from the left edge or tap back to test the transition."
    />
  );
}
