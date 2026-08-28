/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1E1730",
        wall: "#4B3B6B",
        wallDeep: "#3A2C55",
        wood: "#A9714B",
        woodDeep: "#7A4E33",
        lamp: "#FFD98E",
        mint: "#9FD8BE",
        blush: "#F5A3B0",
        cream: "#FFF3E0",
      },
      fontFamily: {
        display: ['"Baloo 2"', "system-ui", "sans-serif"],
        body: ['"Nunito"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
