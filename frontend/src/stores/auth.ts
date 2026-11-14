import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

interface User {
  id: string
  name: string
  username: string
  keyPrefix: string
  rateLimit: string
}

interface AdminUser {
  id: string
  name: string
  username: string
  email: string
  fullName?: string
  isSuperuser: boolean
}

type AuthType = 'api' | 'admin' | null

interface AuthState {
  isAuthenticated: boolean
  authType: AuthType
  user: User | null
  admin: AdminUser | null
  apiKey: string | null
  adminToken: string | null
  login: (apiKey: string) => Promise<void>
  adminLogin: (token: string, admin: AdminUser) => void
  logout: () => void
  checkAuth: () => Promise<void>
  setAdminToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      authType: null,
      user: null,
      admin: null,
      apiKey: null,
      adminToken: null,

      login: async (apiKey: string) => {
        api.defaults.headers.common['X-API-Key'] = apiKey
        try {
          await api.get('/jobs?limit=1')
          set({
            isAuthenticated: true,
            authType: 'api',
            apiKey,
            user: {
              id: 'current',
              name: 'API User',
              username: 'api_user',
              keyPrefix: apiKey.slice(0, 12),
              rateLimit: '100/minute',
            },
            admin: null,
            adminToken: null,
          })
        } catch (error) {
          delete api.defaults.headers.common['X-API-Key']
          throw error
        }
      },

      adminLogin: (token: string, admin: AdminUser) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        delete api.defaults.headers.common['X-API-Key']
        localStorage.setItem('osint-admin-token', token)
        const adminWithName = { ...admin, name: admin.name || admin.fullName || admin.username }
        set({
          isAuthenticated: true,
          authType: 'admin',
          adminToken: token,
          admin: adminWithName,
          apiKey: null,
          user: null,
        })
      },

      setAdminToken: (token: string) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        delete api.defaults.headers.common['X-API-Key']
        localStorage.setItem('osint-admin-token', token)
        set({ adminToken: token, authType: 'admin' })
      },

      logout: () => {
        delete api.defaults.headers.common['X-API-Key']
        delete api.defaults.headers.common['Authorization']
        localStorage.removeItem('osint-admin-token')
        set({ isAuthenticated: false, authType: null, user: null, admin: null, apiKey: null, adminToken: null })
      },

      checkAuth: async () => {
        const { apiKey, adminToken } = get()
        if (adminToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`
          try {
            await api.get('/admin/me')
            set({ isAuthenticated: true, authType: 'admin' })
            return
          } catch {
            get().logout()
            return
          }
        }
        if (apiKey) {
          api.defaults.headers.common['X-API-Key'] = apiKey
          try {
            await api.get('/jobs?limit=1')
            set({ isAuthenticated: true, authType: 'api' })
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
        admin: state.admin,
        adminToken: state.adminToken,
        authType: state.authType,
      }),
    }
  )
)