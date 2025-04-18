// src/app/register/page.jsx - Add the same redirect for register page
"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { RegisterForm } from "@/components/auth/register-form"
import { useAuth } from "@/components/auth-provider"

export default function RegisterPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])
  
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="flex-1 flex items-center justify-center py-12">
        <RegisterForm />
      </div>
      <Footer />
    </div>
  )
}