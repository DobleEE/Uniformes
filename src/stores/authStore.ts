import { create } from 'zustand'

export type UserRole = 'admin' | 'ventas' | 'almacen' | 'confeccion'

interface User {
  id: string
  email: string
  role: UserRole
}

interface AuthState {
  user: User | null
  setAuth: (user: User) => void
  logout: () => void
}

const storedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null') as User | null
  } catch {
    return null
  }
})()

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,

  setAuth: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },

  logout: () => {
    localStorage.removeItem('user')
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {})
    set({ user: null })
  },
}))
