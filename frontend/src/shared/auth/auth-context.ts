import { createContext } from 'react'

export type AuthUser = { id: string; email: string; roleId: string }
export type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  sessionExpired: boolean
  dismissSessionExpired: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
