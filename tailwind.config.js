/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#4361ee',
          600: '#3a0ca3',
          700: '#7209b7',
          800: '#1e1b4b',
          900: '#0f172a',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        accent: {
          cyan: '#22D3EE',
          purple: '#C084FC',
          mint: '#14F195',
          gold: '#FFD700',
          pink: '#F472B6',
          orange: '#FB923C',
          indigo: '#6366F1',
          green: '#10B981',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #4361ee, #7209b7)',
        'gradient-solana': 'linear-gradient(90deg, #9945FF, #14F195)',
        'gradient-gold': 'linear-gradient(90deg, #FFD700, #FFA500)',
        'gradient-platinum': 'linear-gradient(90deg, #E5E4E2, #89CFF0)',
        'gradient-diamond': 'linear-gradient(90deg, #B9F2FF, #7209b7)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(67, 97, 238, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(114, 9, 183, 0.8)' },
        }
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transformOrigin: {
        "0": "0%",
      },
      zIndex: {
        "-1": "-1",
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.rotate-y-0': {
          transform: 'rotateY(0deg)',
        },
        '.rotate-y-180': {
          transform: 'rotateY(180deg)',
        },
        '.preserve-3d': {
          transformStyle: 'preserve-3d',
        },
        '.perspective': {
          perspective: '1000px',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}