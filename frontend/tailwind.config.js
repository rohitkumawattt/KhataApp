/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4: content paths for all JS/JSX/TS/TSX files
  content: [
    './App.{js,jsx,ts,tsx}',
    './index.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
