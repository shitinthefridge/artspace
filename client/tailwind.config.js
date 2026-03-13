/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark: "#0e0c0a",
        cream: "#f0ead8",
        burnt: "#e05c22",
      },
      fontFamily: {
        heading: ['"DM Serif Display"', "serif"],
        body: ['"Syne"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
