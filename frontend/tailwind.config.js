/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Electric Cyan
        primary: {
          DEFAULT: '#00E5FF',
          50: '#E0FAFF',
          100: '#B3F5FF',
          200: '#80EFFF',
          300: '#4DE9FF',
          400: '#26E6FF',
          500: '#00E5FF',
          600: '#00B8CC',
          700: '#008A99',
          800: '#005C66',
          900: '#002E33',
        },
        // Electric Purple
        secondary: {
          DEFAULT: '#B400FF',
          50: '#F7E0FF',
          100: '#EEB3FF',
          200: '#E280FF',
          300: '#D64DFF',
          400: '#CC26FF',
          500: '#B400FF',
          600: '#9000CC',
          700: '#6C0099',
          800: '#480066',
          900: '#240033',
        },
        // Deep Navy
        navy: {
          DEFAULT: '#0A0F24',
          50: '#F0F2F8',
          100: '#D1D7E8',
          200: '#A3B0D4',
          300: '#7588C0',
          400: '#4D62A8',
          500: '#324785',
          600: '#223266',
          700: '#15214D',
          800: '#0C1433',
          900: '#0A0F24',
          950: '#050814',
        },
        // Text colors
        text: {
          DEFAULT: '#F8FAFC',
          light: '#94A3B8',
          lighter: '#64748B',
          dark: '#0F172A',
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