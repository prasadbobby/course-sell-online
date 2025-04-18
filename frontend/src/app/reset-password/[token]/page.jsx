import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata = {
  title: "Reset Password - Course Platform",
  description: "Create a new password for your account",
}

export default function ResetPasswordPage({ params }) {
  const { token } = params

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="flex-1 flex items-center justify-center py-12">
        <ResetPasswordForm token={token} />
      </div>
      <Footer />
    </div>
  )
}