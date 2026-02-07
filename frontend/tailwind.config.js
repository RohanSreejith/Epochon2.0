/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'legal-blue': '#0F172A', // Keep for backward compat if needed, or replace usages
        'kiosk-bg': '#000000',
        'alert-red': '#EF4444',
        'safe-green': '#10B981',
        // Government Theme Colors
        'gov-saffron': '#FF9933',
        'gov-white': '#FFFFFF',
        'gov-green': '#138808',
        'gov-blue': '#000080', // Navy Blue
        'gov-bg': '#F3F4F6',   // Light Gray background
        'gov-text': '#1F2937', // Dark Slate text
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shatter': 'shatter 0.5s ease-in-out forwards',
      },
      keyframes: {
        shatter: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.1)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
