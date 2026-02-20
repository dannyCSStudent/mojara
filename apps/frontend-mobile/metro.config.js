const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// ❌ Disable package exports resolution (this is the key)
config.resolver.unstable_enablePackageExports = false;

// Prefer CommonJS over ESM
config.resolver.sourceExts = [...config.resolver.sourceExts, "cjs"];

module.exports = withNativeWind(config, {
  input: "./global.css",
});
