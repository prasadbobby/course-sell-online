import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Login - Course Platform",
  description: "Login to your account to access your courses",
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="flex-1 flex items-center justify-center py-12">
        <LoginForm />
      </div>
      <Footer />
    </div>
  )
}