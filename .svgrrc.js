// Icons are exported from Figma with a baked-in white fill (some at 0.6 opacity).
// Swap both for currentColor/inherited opacity so state (selected, inactive) is set in code.
module.exports = {
  replaceAttrValues: { white: "currentColor", "#FAFEFF": "currentColor" },
  svgoConfig: {
    plugins: [
      { name: "preset-default", params: { overrides: { removeViewBox: false } } },
      { name: "removeAttrs", params: { attrs: "fill-opacity" } },
    ],
  },
};
