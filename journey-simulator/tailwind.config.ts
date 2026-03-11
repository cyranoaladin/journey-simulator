import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void:    { DEFAULT: '#080A0E', 50: '#0D1017', 100: '#12151C', 200: '#1A1F29', 300: '#222836' },
        slate:   { 50: '#1E2333', 100: '#252C3D', 200: '#2D3650', 300: '#374060', 400: '#4A5578' },
        gold:    { 50: '#FFF8E7', 100: '#FFECB3', 200: '#FFD966', 300: '#FFCA28', 400: '#FFB300', 500: '#E09000', 600: '#B57300' },
        cyan:    { 50: '#E0FFFE', 100: '#B2FFFD', 200: '#64FFFB', 300: '#00E5FF', 400: '#00B8D9', 500: '#0088AA' },
        emerald: { 400: '#34D399', 500: '#10B981', 600: '#059669' },
        amber:   { 400: '#FBBF24', 500: '#F59E0B' },
        coral:   { 400: '#F87171', 500: '#EF4444' },
        ink:     { 50: '#F8FAFC', 100: '#E2E8F0', 200: '#94A3B8', 300: '#64748B', 400: '#475569' },
      },
      fontFamily: {
        display: ['Clash Display', 'DM Sans', 'system-ui', 'sans-serif'],
        body:    ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        'xs':  ['0.75rem',  { lineHeight: '1rem' }],
        'sm':  ['0.875rem', { lineHeight: '1.25rem' }],
        'base':['1rem',     { lineHeight: '1.5rem' }],
        'lg':  ['1.125rem', { lineHeight: '1.75rem' }],
        'xl':  ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl': ['3rem',     { lineHeight: '1' }],
        '6xl': ['3.75rem',  { lineHeight: '1' }],
        '7xl': ['4.5rem',   { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '92': '23rem',
        '128': '32rem',
      },
      boxShadow: {
        'gold-glow':   '0 0 20px rgba(255, 179, 0, 0.25), 0 0 60px rgba(255, 179, 0, 0.10)',
        'gold-glow-lg':'0 0 40px rgba(255, 179, 0, 0.35), 0 0 80px rgba(255, 179, 0, 0.15)',
        'cyan-glow':   '0 0 20px rgba(0, 229, 255, 0.20), 0 0 60px rgba(0, 229, 255, 0.08)',
        'emerald-glow':'0 0 16px rgba(52, 211, 153, 0.25)',
        'surface':     '0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0, 0, 0, 0.3)',
        'surface-lg':  '0 8px 48px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.4)',
        'inner-gold':  'inset 0 0 0 1px rgba(255, 179, 0, 0.4)',
        'inner-cyan':  'inset 0 0 0 1px rgba(0, 229, 255, 0.3)',
      },
      borderRadius: {
        'sm':  '6px',
        DEFAULT: '10px',
        'md':  '12px',
        'lg':  '16px',
        'xl':  '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 179, 0, 0)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(255, 179, 0, 0.15)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'counter': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'zyno-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.05)' },
        },
      },
      animation: {
        'fade-up':        'fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in':        'fade-in 0.3s ease forwards',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in':       'scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-gold':     'pulse-gold 2s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'zyno-pulse':     'zyno-pulse 2.5s ease-in-out infinite',
      },
      gridTemplateColumns: {
        'layout':    '260px 1fr',
        'layout-lg': '300px 1fr 340px',
        'dashboard': 'repeat(3, 1fr)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '8px',
        DEFAULT: '16px',
        'md': '20px',
        'lg': '32px',
        'xl': '48px',
      },
    },
  },
  plugins: [forms, typography],
};

export default config;
