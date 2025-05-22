import { create } from 'zustand'
import { AuthState, LoginCredentials, RegisterData, User } from '@/types/auth'
import { AuthService } from '@/services/auth.service'

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setError: (error: string | null) => void
  setLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null })
      const response = await AuthService.login(credentials)
      localStorage.setItem('token', response.token)
      set({ user: response.user, isAuthenticated: true })
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null })
      const response = await AuthService.register(data)
      localStorage.setItem('token', response.token)
      set({ user: response.user, isAuthenticated: true })
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null })
      await AuthService.logout()
      set({ user: null, isAuthenticated: false })
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },
})) 