import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  theme: Theme
  isLoading: boolean
  error: string | null
  sidebarOpen: boolean
  setTheme: (theme: Theme) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'system',
  isLoading: false,
  error: null,
  sidebarOpen: false,

  setTheme: (theme) => {
    set({ theme })
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark')
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      document.documentElement.classList.add(systemTheme)
    } else {
      document.documentElement.classList.add(theme)
    }
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
})) 