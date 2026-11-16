import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { configureApiClient } from '../../services/api-client'
import { clearToken, loadToken, saveToken } from '../../services/token-storage'
import { SessionUser } from '../../types'
import { login as loginRequest } from './auth-api'
import { isTokenExpired, sessionUserFromToken } from './jwt'

interface AuthContextValue {
  user: SessionUser | null
  /** true enquanto restaura a sessão salva no armazenamento seguro. */
  restoring: boolean
  signIn: (email: string, senha: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [restoring, setRestoring] = useState(true)
  const tokenRef = useRef<string | null>(null)

  const signOut = useCallback(async () => {
    tokenRef.current = null
    setUser(null)
    await clearToken()
  }, [])

  useEffect(() => {
    configureApiClient({
      getToken: () => tokenRef.current,
      onUnauthorized: () => {
        void signOut()
      },
    })
  }, [signOut])

  useEffect(() => {
    let active = true
    ;(async () => {
      const stored = await loadToken()
      if (stored && !isTokenExpired(stored)) {
        const restored = sessionUserFromToken(stored)
        if (restored && active) {
          tokenRef.current = stored
          setUser(restored)
        }
      } else if (stored) {
        await clearToken()
      }
      if (active) setRestoring(false)
    })()
    return () => {
      active = false
    }
  }, [])

  const signIn = useCallback(async (email: string, senha: string) => {
    const token = await loginRequest(email, senha)
    const sessionUser = sessionUserFromToken(token)
    if (!sessionUser) throw new Error('Token inválido recebido da API')
    tokenRef.current = token
    await saveToken(token)
    setUser(sessionUser)
  }, [])

  const value = useMemo(() => ({ user, restoring, signIn, signOut }), [user, restoring, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
