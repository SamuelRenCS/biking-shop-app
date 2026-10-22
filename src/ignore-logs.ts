import { LogBox } from "react-native";

// NativeWind 4 (react-native-css-interop) wraps every core component at import time, including
// ImageBackground, which RN 0.88 deprecates. The app doesn't use ImageBackground.
LogBox.ignoreLogs(["ImageBackground is deprecated"]);
