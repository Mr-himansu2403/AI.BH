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
        sand: {
          50: '#FAF9F6',
          100: "#F5F5F0",
          200: "#E6E6DC",
          300: "#D7D7C8",
          400: "#C8C8B4",
          500: "#B8B89F",
          600: "#999977",
          700: "#7A7A5C",
        },
        warm: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: '#9A3412',
          900: "#7C2D12",
        },
        beige: {
          50: '#FDFBF7',
          100: '#F7F3E9',
          200: '#EFE8D8',
          300: '#E5DBC5',
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