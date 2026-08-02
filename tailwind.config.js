/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FE8C00",
        white: {
          DEFAULT: "#ffffff",
          100: "#fafafa",
          200: "#FE8C00",
        },
        gray: {
          100: "#878787",
          200: "#878787",
        },
        dark: {
          DEFAULT: "#181C2E",
          100: "#181C2E",
          500: "#181C2E",
        },
        error: "#F14141",
        success: "#2F9B65",
      },
      fontFamily: {
        quicksand: ["QuickSand-Regular", "sans-serif"],
        "quicksand-bold": ["QuickSand-Bold", "sans-serif"],
        "quicksand-semibold": ["QuickSand-SemiBold", "sans-serif"],
        "quicksand-light": ["QuickSand-Light", "sans-serif"],
        "quicksand-medium": ["QuickSand-Medium", "sans-serif"],
      },
    },
  },
  plugins: [],
};
