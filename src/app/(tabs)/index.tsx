import { router } from "expo-router";
import { useMemo } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryChips } from "@/components/discover/CategoryChips";
import { DiagonalBackdrop } from "@/components/discover/DiagonalBackdrop";
import { DiscoverHeader } from "@/components/discover/DiscoverHeader";
import { HeroCard } from "@/components/discover/HeroCard";
import { discoverLayout } from "@/components/discover/layout";
import { ProductCard } from "@/components/discover/ProductCard";
import { useTabBarHeight } from "@/components/navigation/TabBar";
import { discoverFeed, products } from "@/data/products";
import { colors } from "@/theme";

const feed = discoverFeed.map((entry) => ({ ...entry, product: products[entry.productId] }));

export default function DiscoverScreen() {
  const { width } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();

  const layout = useMemo(
    () => discoverLayout(width, top, feed.map((entry) => entry.product.kind)),
    [width, top],
  );
  const contentHeight = layout.contentHeight + tabBarHeight + 24;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ height: contentHeight }}
      showsVerticalScrollIndicator={false}
    >
      {/* Back to front, in Figma's layer order: the hero sits above chips and cards. */}
      <DiagonalBackdrop layout={layout} width={width} height={contentHeight} />
      <DiscoverHeader top={layout.header.y} />
      <CategoryChips layout={layout} />
      {feed.map((entry, i) => (
        <ProductCard
          key={i}
          product={entry.product}
          liked={entry.liked}
          frame={layout.cards[i]}
          layout={layout}
          contentWidth={width}
          contentHeight={contentHeight}
          onPress={() => router.push({ pathname: "/product/[id]", params: { id: entry.product.id } })}
        />
      ))}
      <HeroCard layout={layout} contentWidth={width} contentHeight={contentHeight} />
    </ScrollView>
  );
}
