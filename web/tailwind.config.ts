import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#2563eb',
          violet: '#7c3aed',
          cyan: '#06b6d4',
        },
        bg: {
          dark: '#0f172a',
          light: '#1e293b',
          mid: '#111827',
        },
        tag: {
          analyse: '#22c55e',
          algebre: '#3b82f6',
          proba: '#f97316',
          geom: '#8b5cf6',
          trigo: '#eab308',
          arith: '#ec4899',
        },
      },
      boxShadow: {
        default: '0 4px 12px rgba(0,0,0,0.25)',
        glow: '0 0 12px rgba(6,182,212,0.6)',
      },
      borderRadius: {
        soft: '16px',
      },
    },
  },
  plugins: [],
}
export default config
