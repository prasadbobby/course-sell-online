import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata = {
  title: "Register - Course Platform",
  description: "Create your account to access thousands of courses",
}

export default function RegisterPage() {
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