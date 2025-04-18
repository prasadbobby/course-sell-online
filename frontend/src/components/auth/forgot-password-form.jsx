"use client"

import { useState } from "react"
import Link from "next/link"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await axios.post("/auth/forgot-password", { email })
      setIsSubmitted(true)
      toast.success("Reset link sent to your email")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Forgot Password</h1>
        <p className="text-muted-foreground">
          Enter your email and we'll send you a reset link
        </p>
      </div>
      
      {isSubmitted ? (
        <div className="space-y-4">
          <div className="bg-primary/10 p-4 rounded-lg text-center">
            <p className="text-sm">
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your email and follow the instructions.
            </p>
          </div>
          <div className="flex justify-center">
            <Link href="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
          <div className="text-center text-sm">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}