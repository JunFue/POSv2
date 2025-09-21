export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // This plugin converts modern oklab/oklch colors to rgba, which html2canvas understands.
    "postcss-oklab-function": {
      preserve: false, // This ensures the original oklch() is replaced, not kept.
    },
  },
};
