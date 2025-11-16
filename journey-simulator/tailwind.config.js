import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        mfai: {
          background: 'var(--color-page)',
          surface: 'var(--color-surface)',
          surfaceAlt: 'var(--color-surface-alt)',
          surfaceMuted: 'var(--color-surface-muted)',
          border: 'var(--color-border)',
          card: 'var(--color-card)',
          divider: 'var(--color-divider)',
          text: 'var(--color-text)',
          textMuted: 'var(--color-muted)',
          accent: 'var(--color-accent)',
          accentStrong: 'var(--color-accent-dark)',
          accentSoft: 'var(--color-accent-soft)',
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          danger: 'var(--color-danger)',
          info: 'var(--color-info)',
          glow: 'var(--color-glow)',
        },
        background: '#0D0B1F',
        foreground: '#E5E7EB',
        primary: {
          50: '#F5ECFF',
          100: '#E9D9FF',
          200: '#D3B5FF',
          300: '#BC90FF',
          400: '#A563F5',
          500: '#8E4AE0',
          600: '#7134C0',
          700: '#55259A',
          800: '#3A1A6E',
          900: '#241047',
        },
        surface: {
          50: '#F5F6FF',
          100: '#E6E7F7',
          200: '#C6C9E4',
          300: '#9AA0C7',
          400: '#5F6A9A',
          500: '#3C4472',
          600: '#272E50',
          700: '#1B223C',
          800: '#141A2D',
          900: '#0F1424',
        },
        muted: {
          50: '#F4F4F5',
          100: '#E4E4E7',
          200: '#D4D4D8',
          300: '#A1A1AA',
          400: '#71717A',
          500: '#52525B',
          600: '#3F3F46',
          700: '#27272A',
          800: '#1F1F23',
          900: '#18181B',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        accent: {
          DEFAULT: '#A563F5',
          neon: '#A563F5',
          pulse: '#7C3AED',
          glow: '#C084FC',
        },
        light: '#E5E7EB',
      },
      boxShadow: {
        glow: '0 0 25px rgba(165, 99, 245, 0.25)',
        'inner-glow': 'inset 0 0 20px rgba(165, 99, 245, 0.15)',
        glass: '0 8px 32px rgba(13, 11, 31, 0.35)',
        'neon-ring': '0 0 40px rgba(165, 99, 245, 0.35)',
        'halo-soft': '0 18px 48px rgba(12, 17, 39, 0.55)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #A563F5 0%, #7C3AED 100%)',
        'gradient-surface': 'linear-gradient(135deg, rgba(165, 99, 245, 0.18) 0%, rgba(12, 17, 39, 1) 100%)',
        'gradient-galaxy': 'radial-gradient(circle at 20% 20%, rgba(165, 99, 245, 0.35), transparent 55%), radial-gradient(circle at 80% 0%, rgba(60, 68, 114, 0.45), transparent 60%)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        levitate: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(165, 99, 245, 0)' },
          '50%': { boxShadow: '0 0 22px rgba(165, 99, 245, 0.35)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        tiltBounce: {
          '0%': { transform: 'rotate3d(1, -1, 0, 0deg)' },
          '50%': { transform: 'rotate3d(1, -1, 0, 2deg)' },
          '100%': { transform: 'rotate3d(1, -1, 0, 0deg)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-out both',
        slideIn: 'slideIn 0.6s ease-out both',
        levitate: 'levitate 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 1.8s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'tilt-bounce': 'tiltBounce 3s ease-in-out infinite',
      },
      transitionProperty: {
        height: 'height',
        spacing: 'margin, padding',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
      },
      transformOrigin: {
        0: '0%',
      },
      zIndex: {
        '-1': '-1',
      },
    },
  },
  plugins: [
    forms,
    typography,
    function ({ addUtilities, addComponents, theme }) {
      const utilities = {
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
      };

      const components = {
        '.card-surface': {
          backgroundColor: theme('colors.mfai.card'),
          borderRadius: theme('borderRadius.3xl'),
          border: `1px solid ${theme('colors.mfai.border')}`,
          boxShadow: theme('boxShadow.glass'),
          backdropFilter: 'blur(24px)',
        },
        '.neon-border': {
          position: 'relative',
          borderRadius: theme('borderRadius.3xl'),
          overflow: 'hidden',
        },
        '.neon-border::before': {
          content: '""',
          position: 'absolute',
          inset: '-2px',
          background: `linear-gradient(140deg, ${theme('colors.accent.glow')}, transparent 45%)`,
          zIndex: '-1',
          opacity: '0.6',
          transition: 'opacity 200ms ease',
        },
        '.neon-border:hover::before': {
          opacity: '1',
        },
        '.inset-panel': {
          background: 'linear-gradient(160deg, rgba(16,16,35,0.65) 0%, rgba(30,28,56,0.9) 100%)',
          borderRadius: theme('borderRadius.2xl'),
          border: `1px solid ${theme('colors.mfai.border')}`,
          boxShadow: theme('boxShadow.halo-soft'),
        },
      };

      addUtilities(utilities);
      addComponents(components);
    },
  ],
};