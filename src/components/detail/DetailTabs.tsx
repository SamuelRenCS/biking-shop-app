import { Text, View } from "react-native";

import { GradientText } from "@/components/ui/GradientText";
import { SkeuoButton } from "@/components/ui/SkeuoButton";
import { colors, cssShadow, gradients, radii, shadows } from "@/theme";

export type DetailTab = "description" | "specification";

// Figma sizes each pill to its label, which is wider when bold, so the row shifts a few pt
// between the two frames. Fixed widths (the Description frame's; bold "Specification" still
// fits) keep it still as the selection moves.
const TABS: { key: DetailTab; label: string; width: number }[] = [
  { key: "description", label: "Description", width: 133 },
  { key: "specification", label: "Specification", width: 142 },
];

// Selected tabs are raised; the other is pressed into the sheet.
const raised = { backgroundColor: colors.surface300, boxShadow: cssShadow(shadows.neuRaised), borderRadius: radii.md };
const pressed = { backgroundColor: colors.surface200, boxShadow: cssShadow(shadows.neuPressed), borderRadius: radii.md };

const LABEL_SPACING = { letterSpacing: 0.35 };

type Props = { selected: DetailTab; onSelect: (tab: DetailTab) => void };

export function DetailTabs({ selected, onSelect }: Props) {
  return (
    <View className="flex-row justify-center" style={{ gap: 30 }} accessibilityRole="tablist">
      {TABS.map((tab) => (
        <SkeuoButton
          key={tab.key}
          selected={selected === tab.key}
          onPress={() => onSelect(tab.key)}
          accessibilityLabel={tab.label}
          idleStyle={pressed}
          selectedStyle={raised}
          style={{ width: tab.width, height: 43 }}
          selectedContent={
            <GradientText gradient={gradients.accentLabel} className="font-poppins-bold text-body" style={LABEL_SPACING}>
              {tab.label}
            </GradientText>
          }
        >
          <Text className="font-poppins text-body text-text-muted" style={LABEL_SPACING}>
            {tab.label}
          </Text>
        </SkeuoButton>
      ))}
    </View>
  );
}
