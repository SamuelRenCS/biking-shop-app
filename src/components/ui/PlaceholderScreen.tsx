import type { ReactNode } from "react";
import { Text, View } from "react-native";

/** Stand-in for screens outside the three designed ones. */
export function PlaceholderScreen({ title, header, note }: { title: string; header?: ReactNode; note?: string }) {
  return (
    <View className="flex-1 bg-bg">
      {header}
      <View className="flex-1 items-center justify-center px-10">
        <Text className="font-poppins-bold text-title text-white">{title}</Text>
        {note && <Text className="mt-2 text-center font-poppins text-caption text-text-muted">{note}</Text>}
      </View>
    </View>
  );
}
