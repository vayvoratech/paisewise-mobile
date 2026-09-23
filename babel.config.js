module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated's babel plugin MUST be listed last.
    plugins: ['react-native-reanimated/plugin'],
  };
};
