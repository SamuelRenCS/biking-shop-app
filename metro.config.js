const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Import .svg files as React components (react-native-svg-transformer).
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer/expo",
);
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

// inlineRem 16 makes Tailwind's spacing scale match Figma pt (NativeWind defaults to 14, which
// would render `p-4` as 14pt instead of 16).
module.exports = withNativeWind(config, { input: "./src/global.css", inlineRem: 16 });
