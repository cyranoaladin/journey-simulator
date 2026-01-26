import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppMode = 'demo' | 'real'

interface ModeState {
  mode: AppMode
  isRealMode: boolean
  setMode: (mode: AppMode) => void
  toggleMode: () => void
  enableRealMode: () => void
  enableDemoMode: () => void
}

export const useModeStore = create<ModeState>()(
  persist(
    (set, get) => ({
      mode: 'demo',
      isRealMode: false,

      setMode: (mode: AppMode) =>
        set({
          mode,
          isRealMode: mode === 'real',
        }),

      toggleMode: () => {
        const currentMode = get().mode
        const newMode = currentMode === 'demo' ? 'real' : 'demo'
        set({
          mode: newMode,
          isRealMode: newMode === 'real',
        })
      },

      enableRealMode: () =>
        set({
          mode: 'real',
          isRealMode: true,
        }),

      enableDemoMode: () =>
        set({
          mode: 'demo',
          isRealMode: false,
        }),
    }),
    {
      name: 'mfai-mode-storage',
      partialize: (state) => ({
        mode: state.mode,
        isRealMode: state.isRealMode,
      }),
    }
  )
)
