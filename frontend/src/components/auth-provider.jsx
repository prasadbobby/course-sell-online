"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { toast } from "sonner"

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()


useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem("token")
    
    if (token) {
      try {
        const response = await axios.get("/auth/me")
        setUser(response.data.user)
      } catch (error) {
        console.error("Auth error:", error)
        localStorage.removeItem("token")
      }
    }
    
    setLoading(false)
  }
  
  checkAuth()
}, [])

  const login = async (email, password) => {
    try {
      const response = await axios.post("/auth/login", { email, password })
      
      localStorage.setItem("token", response.data.token)
      setUser(response.data.user)
      
      return response.data.user
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post("/auth/register", userData)
      
      localStorage.setItem("token", response.data.token)
      setUser(response.data.user)
      
      return response.data.user
    } catch (error) {
      console.error("Register error:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await axios.post("/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("token")
      setUser(null)
      router.push("/")
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put("/users/me", profileData)
      setUser(response.data.user)
      toast.success("Profile updated successfully")
      return response.data.user
    } catch (error) {
      console.error("Update profile error:", error)
      toast.error("Failed to update profile")
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider")
  return context
}