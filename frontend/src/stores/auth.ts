import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

interface User {
  id: string
  name: string
  keyPrefix: string
  rateLimit: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  apiKey: string | null
  login: (apiKey: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      apiKey: null,

      login: async (apiKey: string) => {
        api.defaults.headers.common['X-API-Key'] = apiKey
        try {
          await api.get('/jobs?limit=1')
          // If we get here, the key is valid
          // In a real app, you'd have a /me endpoint
          set({
            isAuthenticated: true,
            apiKey,
            user: {
              id: 'current',
              name: 'API User',
              keyPrefix: apiKey.slice(0, 12),
              rateLimit: '100/minute',
            },
          })
        } catch (error) {
          delete api.defaults.headers.common['X-API-Key']
          throw error
        }
      },

      logout: () => {
        delete api.defaults.headers.common['X-API-Key']
        set({ isAuthenticated: false, user: null, apiKey: null })
      },

      checkAuth: async () => {
        const { apiKey } = get()
        if (apiKey) {
          api.defaults.headers.common['X-API-Key'] = apiKey
          try {
            await api.get('/jobs?limit=1')
            set({ isAuthenticated: true })
          } catch {
            get().logout()
          }
        }
      },
    }),
    {
      name: 'osint-auth',
      partialize: (state) => ({
        apiKey: state.apiKey,
        user: state.user,
      }),
    }
  )
)