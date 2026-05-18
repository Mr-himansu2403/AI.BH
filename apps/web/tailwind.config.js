/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          700: "#1E293B",
          800: "#0F172A",
          900: "#0B0F19",
        },
        sand: {
          100: "#F5F5F0",
          200: "#E6E6DC",
          300: "#D7D7C8",
          500: "#B8B89F",
          600: "#999977",
          700: "#7A7A5C",
        },
        warm: {
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          900: "#7C2D12",
        },
      },
    },
  },
  plugins: [],
};
