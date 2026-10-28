import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api, ApiError } from '../api/client'
import { AuthContext, type AuthContextValue, type AuthUser } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)
  const hasRestoredSession = useRef(false)

  useEffect(() => {
    const handleExpired = () => setSessionExpired(true)
    window.addEventListener('sigel:authentication-expired', handleExpired)
    return () => window.removeEventListener('sigel:authentication-expired', handleExpired)
  }, [])

  useEffect(() => {
    if (hasRestoredSession.current) return
    hasRestoredSession.current = true

    const restoreSession = async (): Promise<AuthUser> => {
      try {
        return await api.get<AuthUser>('/auth/me')
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error
        await api.post('/auth/refresh', {})
        return api.get<AuthUser>('/auth/me')
      }
    }

    void restoreSession()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    async login(email, password) {
      const authenticated = await api.post<AuthUser>('/auth/login', { email, password })
      setUser(authenticated)
      setSessionExpired(false)
    },
    logout() {
      void api.post('/auth/logout', {}).catch(() => undefined)
      setUser(null)
    },
    sessionExpired,
    dismissSessionExpired: () => {
      setUser(null)
      setSessionExpired(false)
    },
  }), [isLoading, sessionExpired, user])
  return <AuthContext.Provider value={value}>{children}{sessionExpired && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-bold text-slate-900">Sessão encerrada</h2><p className="mt-2 text-sm text-slate-600">Sua autenticação não está mais válida. Entre novamente para continuar com segurança.</p><button className="button-primary mt-6 w-full" onClick={value.dismissSessionExpired}>Entrar novamente</button></div></div>}</AuthContext.Provider>
}
