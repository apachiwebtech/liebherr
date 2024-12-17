const path = require("path");

module.exports = function override(config, env) {
  if (env === "production") {
    // Disable filename hashing for JS files
    config.output.filename = "static/js/liebh.js";
    config.output.chunkFilename = "static/js/liebh.chunk.js";

    // Update CSS filename handling
    config.plugins.forEach((plugin) => {
      if (plugin.options && plugin.options.filename) {
        // Use a unique name for CSS chunks to avoid conflicts
        plugin.options.filename = "static/css/liebh.v1.css"; // Main CSS file
        plugin.options.chunkFilename = "static/css/liebh2.v2.chunk.css"; // Chunk files
      }
    });
  }
  return config;
};
