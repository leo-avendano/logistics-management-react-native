const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = false;

// Add resolver configuration for Firebase
config.resolver.alias = {
  ...config.resolver.alias,
};

// Add platform extensions
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add source extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'];

module.exports = config; 

