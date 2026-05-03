/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Purple
        primary: {
          DEFAULT: '#7B61FF',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7B61FF',
          700: '#6B51EF',
          800: '#5B41DF',
          900: '#4B31CF',
        },
        // Baby Blue
        secondary: {
          DEFAULT: '#A7C7E7',
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#C7E0FF',
          300: '#A7C7E7',
          400: '#87B7D7',
          500: '#67A7C7',
          600: '#5797B7',
          700: '#4787A7',
          800: '#377797',
          900: '#276787',
        },
        // Soft Beige
        beige: {
          DEFAULT: '#F5F0E6',
          50: '#FEFDFB',
          100: '#F9F6F0',
          200: '#F5F0E6',
          300: '#EDE4D6',
          400: '#E5D8C6',
          500: '#DDCCB6',
          600: '#D5C0A6',
          700: '#CDB496',
          800: '#C5A886',
          900: '#BD9C76',
        },
        // Text colors
        text: {
          DEFAULT: '#2E2E2E',
          light: '#6B7280',
          lighter: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'gradient': 'gradient 3s ease infinite',
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
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundSize: {
        'gradient-animate': '200% 200%',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}