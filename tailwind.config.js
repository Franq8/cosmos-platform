/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          dark: '#0A0A1A',
          light: '#1E1E3F',
          accent: '#6366F1',
          blue: '#1E3A8A',
          purple: '#5B21B6',
          glow: '#8B5CF6',
        }
      },
      animation: {
        'cosmic-pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'star-twinkle': 'twinkle 4s ease-in-out infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        }
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(to right, #0A0A1A, #1E1E3F, #0A0A1A)',
      }
    },
  },
  plugins: [],
} 