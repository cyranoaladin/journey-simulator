import { create } from 'zustand'

interface ThemeState {
  isDark: boolean
  isNeon: boolean
  toggleTheme: () => void
  toggleNeon: () => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: true, // Default to dark theme for MFAI aesthetic
  isNeon: false,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
  toggleNeon: () => set((state) => ({ isNeon: !state.isNeon })),
}))
