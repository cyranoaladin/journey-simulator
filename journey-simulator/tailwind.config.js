/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

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
        background: '#000000', // True Black
        foreground: '#F9FAFB',
        primary: {
          50: '#F2E6FF',
          100: '#E5CCFF',
          200: '#D199FF',
          300: '#BD66FF',
          400: '#9945FF', // Solana Purple
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#2E1065',
        },
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A', // Slate 900
          950: '#020617',
        },
        muted: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        success: '#14F195', // Solana Green
        warning: '#FFD512',
        danger: '#FF4F4F',
        info: '#00C2FF',
        accent: {
          DEFAULT: '#9945FF',
          neon: '#14F195',
          pulse: '#7C3AED',
          glow: '#C485FC',
        },
        'accent-cyan': '#06B6D4',
        light: '#F9FAFB',
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