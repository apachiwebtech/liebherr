const { override } = require("customize-cra");

module.exports = override((config) => {
    if (process.env.NODE_ENV === "production") {
        config.devtool = false; // Disables source maps
      }
  return config;
});