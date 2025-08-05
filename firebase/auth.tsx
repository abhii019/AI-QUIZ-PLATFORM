// firebase/auth.ts
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, getAuth, signOut, User } from "firebase/auth"
import { loginWithGoogle, loginWithEmail, signupWithEmail } from "./auth-utils"
import { app } from "./config" // make sure this is your initialized Firebase app

interface AuthContextType {
  user: User | null
  loading: boolean
  loginWithGoogle: (role: string) => Promise<string>
  loginWithEmail: (email: string, password: string) => Promise<string>
  signupWithEmail: (email: string, password: string, role: string) => Promise<string>
  logout: () => Promise<void>
}

// ✅ Export the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const auth = getAuth(app)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  const contextValue: AuthContextType = {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
