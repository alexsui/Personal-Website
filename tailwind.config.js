/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Noto Serif TC"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#eae7e1',
          secondary: '#f2f0ec',
          elevated: '#ffffff',
          dark: '#1a1815',
          'dark-secondary': '#242220',
          'dark-elevated': '#2e2c29',
        },
        ink: {
          DEFAULT: '#1a1815',
          secondary: '#5c5750',
          muted: '#908a82',
          dark: '#e8e5e0',
          'dark-secondary': '#b5b0a8',
        },
        border: {
          DEFAULT: '#d5d0c9',
          dark: '#3a3835',
        },
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgb(0 0 0 / 0.04)',
        'card': '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 0 0 1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.06), 0 0 0 1px rgb(0 0 0 / 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.7s ease-out both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      letterSpacing: {
        'label': '0.12em',
      },
    },
  },
  plugins: [],
};
