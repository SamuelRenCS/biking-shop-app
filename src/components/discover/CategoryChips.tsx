import { useState, type FC } from "react";
import { Text } from "react-native";

import { AccessoryIcon, ElectricIcon, MountainIcon, RoadIcon } from "@/components/ui/icons";
import { SkeuoButton } from "@/components/ui/SkeuoButton";
import { colors, cssGradient, cssShadow, gradients, radii, shadows } from "@/theme";

import type { DiscoverLayout } from "./layout";

type IconComponent = FC<{ width: number; height: number; color?: string }>;
type Category = { key: string; label: string; icon?: { Icon: IconComponent; width: number; height: number } };

const CATEGORIES: Category[] = [
  { key: "all", label: "All" },
  { key: "electric", label: "Electric", icon: { Icon: ElectricIcon, width: 36, height: 24 } },
  { key: "road", label: "Road", icon: { Icon: RoadIcon, width: 30, height: 30 } },
  { key: "mountain", label: "Mountain", icon: { Icon: MountainIcon, width: 30, height: 30 } },
  { key: "accessory", label: "Accessories", icon: { Icon: AccessoryIcon, width: 27, height: 27 } },
];

const solidStyle = {
  borderRadius: radii.md,
  backgroundImage: cssGradient(gradients.surface),
  boxShadow: cssShadow(shadows.raised),
};
// Over the blue backdrop Figma switches to a translucent fill with no shadow.
const glassStyle = { borderRadius: radii.md, backgroundImage: cssGradient(gradients.surfaceGlass) };
const selectedStyle = {
  borderRadius: radii.md,
  backgroundImage: cssGradient(gradients.accent),
  boxShadow: cssShadow(shadows.raised),
};

/** Staggered category buttons. Selecting one only changes the visual state (no filtering). */
export function CategoryChips({ layout }: { layout: DiscoverLayout }) {
  const [selected, setSelected] = useState("all");

  return CATEGORIES.map((category, i) => {
    const frame = layout.chips[i];
    return (
      <SkeuoButton
        key={category.key}
        selected={selected === category.key}
        onPress={() => setSelected(category.key)}
        accessibilityLabel={category.label}
        idleStyle={frame.overBackdrop ? glassStyle : solidStyle}
        selectedStyle={selectedStyle}
        style={{ position: "absolute", left: frame.x, top: frame.y, width: frame.width, height: frame.height }}
      >
        {category.icon ? (
          <category.icon.Icon width={category.icon.width} height={category.icon.height} color={colors.white} />
        ) : (
          <Text className="font-poppins-medium text-caption tracking-normal text-white">{category.label}</Text>
        )}
      </SkeuoButton>
    );
  });
}
