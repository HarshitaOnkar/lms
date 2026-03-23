/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#FFC107",
          dark: "#F59E0B",
          light: "#FFF8E1",
          cream: "#FFFDE7",
          ink: "#1F2937"
        }
      }
    }
  },
  plugins: []
};

