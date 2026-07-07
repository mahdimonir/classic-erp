import React, { createContext, useState, useEffect, useContext } from "react"
import API from "../services/api"

interface IUser {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
}

interface IAuthContext {
  user: IUser | null
  loading: boolean
  login: (token: string, userData: IUser) => void
  logout: () => void
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<IAuthContext | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await API.get("/auth/me")
        if (response.data?.success) {
          setUser(response.data.data)
        } else {
          localStorage.removeItem("token")
        }
      } catch (error) {
        console.error("Session restore failed:", error)
        localStorage.removeItem("token")
      } finally {
        setLoading(false)
      }
    }

    fetchMe()
  }, [])

  const login = (token: string, userData: IUser) => {
    localStorage.setItem("token", token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.permissions.includes(permission) || user.permissions.includes("roles:manage")
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
