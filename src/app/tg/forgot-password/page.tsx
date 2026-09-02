"use client"

import React, { useState } from "react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

import { resetPassword } from "@/app/actions/auth"

export default function TgForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [emailError, setEmailError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setEmailError(false)
    setSuccess(false)

    if (!email || !email.includes("@")) {
      setEmailError(true)
      return
    }

    setIsLoading(true)
    
    const formData = new FormData()
    formData.append('email', email)
    
    const result = await resetPassword(formData)
    
    setIsLoading(false)
    
    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="Mock UI state only">
        <div className="text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
            <svg className="h-8 w-8 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-[var(--color-text)]">
            We have sent a password reset link to <strong>{email}</strong>.
          </p>
          <p className="text-sm text-[var(--color-secondary)]">
            (This is a frontend demonstration. No email was actually sent.)
          </p>
          <Button onClick={() => router.push('/tg/login')} className="w-full">
            Return to Login
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email to receive a password reset link">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        )}

        <div>
          <Label htmlFor="email" className={emailError ? "text-[var(--color-declined)]" : ""}>
            Email address
          </Label>
          <div className="mt-1">
            <Input 
              id="email" 
              name="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              disabled={isLoading}
            />
            {emailError && <p className="mt-1 text-xs text-[var(--color-declined)]">Please enter a valid email address.</p>}
          </div>
        </div>

        <div>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Send Reset Link
          </Button>
        </div>

        <div className="text-sm text-center">
          <a href="/tg/login" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
            Back to login
          </a>
        </div>
      </form>
    </AuthLayout>
  )
}
