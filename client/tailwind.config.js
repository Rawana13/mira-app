/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0A1628",
        "dark-blue": "#122040",
        "sky-blue": "#2E72B0",
        "light-blue": "#A8CCEA",
        "near-white": "#F2F5F9",
        urgent: "#E8534A",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

