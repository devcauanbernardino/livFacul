module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Remova "expo-router/babel" se estiver aí (SDK 50+)
      ["module-resolver", {
        root: ["./"],
        alias: {
          "@": "./src"
        },
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
      }]
    ]
  };
};
