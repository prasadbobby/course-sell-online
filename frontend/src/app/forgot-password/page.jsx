import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata = {
  title: "Forgot Password - Course Platform",
  description: "Reset your password to regain access to your account",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="flex-1 flex items-center justify-center py-12">
        <ForgotPasswordForm />
      </div>
      <Footer />
    </div>
  )
}