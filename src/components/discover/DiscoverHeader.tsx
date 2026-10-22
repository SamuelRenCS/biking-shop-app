import { Text, View } from "react-native";

import { AccentButton } from "@/components/ui/AccentButton";
import { SearchIcon } from "@/components/ui/icons";
import { colors } from "@/theme";

export function DiscoverHeader({ top }: { top: number }) {
  return (
    <View className="absolute left-5 right-5 h-11 flex-row items-center justify-between" style={{ top }}>
      <Text className="font-poppins-bold text-title tracking-normal text-white">Choose Your Bike</Text>
      <AccentButton accessibilityLabel="Search">
        <SearchIcon width={20} height={20} color={colors.iconOn} />
      </AccentButton>
    </View>
  );
}
