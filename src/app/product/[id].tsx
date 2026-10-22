import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DescriptionPanel } from "@/components/detail/DescriptionPanel";
import { DetailTabs, type DetailTab } from "@/components/detail/DetailTabs";
import { ImageCarousel } from "@/components/detail/ImageCarousel";
import { detailLayout } from "@/components/detail/layout";
import { PurchaseBar } from "@/components/detail/PurchaseBar";
import { RidingConditionsPanel } from "@/components/detail/RidingConditionsPanel";
import { DiagonalBackdrop } from "@/components/ui/DiagonalBackdrop";
import { PlaceholderScreen } from "@/components/ui/PlaceholderScreen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { products } from "@/data/products";
import { cssGradient, cssShadow, gradients, radii, shadows } from "@/theme";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<DetailTab>("description");

  const product = products[id];
  if (!product) {
    return <PlaceholderScreen header={<ScreenHeader title="Product" />} title="Product not found" />;
  }

  const layout = detailLayout(width, height, insets);

  return (
    <View className="flex-1">
      <DiagonalBackdrop geometry={layout.backdrop} width={width} height={height} />
      <ScreenHeader title={product.name} />
      <ImageCarousel product={product} layout={layout} />

      <View
        className="absolute left-0 right-0 pt-8"
        style={{
          top: layout.sheet.top,
          height: layout.sheet.height,
          paddingBottom: layout.purchaseBarHeight,
          backgroundImage: cssGradient(gradients.sheet),
          boxShadow: cssShadow(shadows.sheet),
          borderTopLeftRadius: radii.xl,
          borderTopRightRadius: radii.xl,
        }}
      >
        <DetailTabs selected={tab} onSelect={setTab} />
        {/* Both panels stay mounted so the forecast starts loading as soon as the screen opens. */}
        <View className="mt-[29px] flex-1" style={{ display: tab === "description" ? "flex" : "none" }}>
          <DescriptionPanel product={product} />
        </View>
        <View className="mt-[27px]" style={{ display: tab === "specification" ? "flex" : "none" }}>
          <RidingConditionsPanel />
        </View>
      </View>

      <PurchaseBar product={product} height={layout.purchaseBarHeight} />
    </View>
  );
}
