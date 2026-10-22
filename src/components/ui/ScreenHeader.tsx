import { router } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme";

import { AccentButton } from "./AccentButton";
import { ChevronLeftIcon } from "./icons";

/** Back button plus centred title, as on Detail and Cart (top 60pt on the 44pt-status-bar frame). */
export function ScreenHeader({ title }: { title: string }) {
  const { top } = useSafeAreaInsets();
  return (
    <View className="h-11 flex-row items-center px-5" style={{ marginTop: top + 16 }}>
      <AccentButton accessibilityLabel="Back" onPress={() => router.back()}>
        <ChevronLeftIcon width={9} height={16} color={colors.white} />
      </AccentButton>
      <Text className="mr-11 flex-1 text-center font-poppins-bold text-title text-white" numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}
