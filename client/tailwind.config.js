/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vyro: {
          dark: '#080604',
          card: 'rgba(24, 19, 14, 0.85)',
          amber: '#F59E0B',
          gold: '#FBBF24',
          glow: 'rgba(245, 158, 11, 0.35)',
          accent: '#FF7B00',
          border: 'rgba(255, 255, 255, 0.08)',
          muted: '#A3998F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-amber': '0 0 35px -5px rgba(245, 158, 11, 0.3)',
        'glow-lg': '0 0 50px -10px rgba(245, 158, 11, 0.45)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}

