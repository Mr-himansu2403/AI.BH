/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Beige/Sand Theme
        beige: {
          50: '#fefdfb',
          100: '#fdf9f3',
          200: '#f9f0e4',
          300: '#f4e4d1',
          400: '#edd5b7',
          500: '#e4c29f',
          600: '#d4a574',
          700: '#c4956b',
          800: '#a67c5a',
          900: '#8b6914',
        },
        sand: {
          50: '#fefcf9',
          100: '#fdf7f0',
          200: '#f9ede1',
          300: '#f3dfc8',
          400: '#ebcca6',
          500: '#e1b584',
          600: '#d19a5b',
          700: '#b8834a',
          800: '#966b3d',
          900: '#7a5530',
        },
        warm: {
          50: '#faf9f7',
          100: '#f3f1ed',
          200: '#e8e4dd',
          300: '#d9d2c7',
          400: '#c6baaa',
          500: '#b5a394',
          600: '#a08d7c',
          700: '#8b7a6b',
          800: '#73645a',
          900: '#5e534a',
        },
        gold: {
          50: '#fffef7',
          100: '#fffbeb',
          200: '#fef3c7',
          300: '#fde68a',
          400: '#fcd34d',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}