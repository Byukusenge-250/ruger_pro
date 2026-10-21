/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f6f6f4",
          100: "#e9e8e3",
          200: "#d3d1c8",
          300: "#b3b0a3",
          400: "#8c8978",
          500: "#6f6c5d",
          600: "#565547",
          700: "#454439",
          800: "#2c2b24",
          900: "#1a1a15",
          950: "#0e0e0a",
        },
        accent: {
          50: "#fbf7ee",
          100: "#f4e9cf",
          200: "#e9d199",
          300: "#dcb45f",
          400: "#cf9c39",
          500: "#b8822a",
          600: "#976622",
          700: "#744c1f",
          800: "#5e3d20",
          900: "#4f341e",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      letterSpacing: { tight: "-0.02em" },
    },
  },
  plugins: [],
};
