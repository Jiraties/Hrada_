import { create } from 'zustand'

export type Theme = 'light' | 'dark'
const STORAGE_KEY = 'hrada-theme'

export function readSavedTheme(): Theme {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(theme: Theme) {
  if (typeof document !== 'undefined') document.documentElement.dataset.theme = theme
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useTheme = create<ThemeState>((set) => ({
  theme: readSavedTheme(),
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // The toggle still works when browser storage is unavailable.
    }
  },
}))
