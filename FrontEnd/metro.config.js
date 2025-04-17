const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
newConfig = withNativeWind(config, { input: './global.css' });
newConfig.resolver.assetExts.push('ort');

module.exports = newConfig;