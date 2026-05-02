/* eslint-env node */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  safelist: ["theme-midnight", "accent-blue", "accent-red", "accent-orange", "accent-purple"],
  theme: {
    extend: {},
  },
  plugins: [],
};
