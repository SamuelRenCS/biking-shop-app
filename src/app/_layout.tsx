import "../global.css";

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { SlideStack } from "@/navigation/SlideStack";
import { CartProvider } from "@/state/cart";
import { FavoritesProvider } from "@/state/favorites";
import { colors } from "@/theme";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      {/* The app background matches the splash colour, so holding render until fonts load shows no flash. */}
      <CartProvider>
        <FavoritesProvider>{fontsLoaded && <SlideStack />}</FavoritesProvider>
      </CartProvider>
    </GestureHandlerRootView>
  );
}
