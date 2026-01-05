/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', 
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}", // only direct packages
  ],  
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#ffffff",
          dark: "#0b0b0f",
        },

        surface: {
          DEFAULT: "#f5f5f7",
          dark: "#16161d",
        },

        primary: {
          DEFAULT: "#0ea5e9", // sky-500
          dark: "#38bdf8",
        },

        accent: {
          DEFAULT: "#22c55e", // green-500
          dark: "#4ade80",
        },

        danger: {
          DEFAULT: "#ef4444",
          dark: "#f87171",
        },

        text: {
          DEFAULT: "#0f172a",
          dark: "#e5e7eb",
          muted: "#64748b",
        },
      },
    },
  },
  plugins: [],
}