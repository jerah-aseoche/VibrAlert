/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
  colors: {
    c003A6B: "#003A6B",
    c1B5886: "#1B5886",
    c3776A1: "#3776A1",
    c5293BB: "#5293BB",
    c6EB1D6: "#6EB1D6",
    c89CFF1: "#89CFF1",

    white: "#ffffff",

    zinc: {
      50: "#fafafa",
      100: "#f4f4f5",
      200: "#e4e4e7",
      300: "#d4d4d8",
      400: "#a1a1aa",
      500: "#71717a",
      600: "#52525b",
      700: "#3f3f46",
      800: "#27272a",
      900: "#18181b",
    }
  }
}
  },
  plugins: [],
};
