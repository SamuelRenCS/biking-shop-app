import { Image } from "expo-image";
import { Text, View } from "react-native";

import type { Product, ProductKind } from "@/data/products";
import { colors, cssGradient, gradients } from "@/theme";
import { formatPrice } from "@/utils/format";

import { QuantityStepper } from "./QuantityStepper";

// Photo placement inside the 100 × 90 tile, from Figma. The helmet overflows the tile and is
// clipped, as on Discover.
const THUMB_IMAGE: Record<ProductKind, { x: number; y: number; width: number; height: number }> = {
  bike: { x: 10, y: 15, width: 80.61, height: 59 },
  accessory: { x: 8, y: 6, width: 83, height: 87.37 },
};

type Props = { product: Product; quantity: number; onQuantityChange: (quantity: number) => void };

/** One cart line: thumbnail tile, name, price and stepper (Figma "Items 1–3"). */
export function CartItemRow({ product, quantity, onQuantityChange }: Props) {
  const image = THUMB_IMAGE[product.kind];
  return (
    <View className="h-[90px] flex-row items-center px-5" style={{ gap: 16 }}>
      <View
        className="h-[90px] w-[100px] overflow-hidden"
        style={{ borderRadius: 20, backgroundImage: cssGradient(gradients.thumb) }}
      >
        <Image
          source={product.image}
          contentFit="contain"
          style={{ position: "absolute", left: image.x, top: image.y, width: image.width, height: image.height }}
        />
      </View>
      <View className="flex-1 justify-between" style={{ height: 77 }}>
        <Text className="font-poppins-bold text-body" style={{ color: colors.textHigh }} numberOfLines={1}>
          {product.name}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="font-poppins text-caption" style={{ color: colors.accentText }}>
            {formatPrice(product.price)}
          </Text>
          <QuantityStepper quantity={quantity} onChange={onQuantityChange} label={product.name} />
        </View>
      </View>
    </View>
  );
}
