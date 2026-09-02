"use client"

import React, { useState } from "react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

import { login } from "@/app/actions/auth"

import { useRouter } from "next/navigation"

export default function TgLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setEmailError(false)
    setPasswordError(false)

    let hasError = false
    if (!email || !email.includes("@")) {
      setEmailError(true)
      hasError = true
    }
    if (!password) {
      setPasswordError(true)
      hasError = true
    }

    if (hasError) return

    setIsLoading(true)
    
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    
    const result = await login(formData)
    
    if (result.error) {
      setIsLoading(false)
      setError(result.error)
    } else if (result.success) {
      router.push('/tg/dashboard')
    }
  }

  return (
    <AuthLayout title="Teacher Guardian Portal" subtitle="Sign in to manage student gate passes">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
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
              autoComplete="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              disabled={isLoading}
            />
            {emailError && <p className="mt-1 text-xs text-[var(--color-declined)]">Please enter a valid email address.</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="password" className={passwordError ? "text-[var(--color-declined)]" : ""}>
            Password
          </Label>
          <div className="mt-1">
            <Input 
              id="password" 
              name="password" 
              type={showPassword ? "text" : "password"}
              autoComplete="current-password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              disabled={isLoading}
              rightElement={
                <button 
                  type="button" 
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            {passwordError && <p className="mt-1 text-xs text-[var(--color-declined)]">This field is required.</p>}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input 
              id="remember-me" 
              name="remember-me" 
              type="checkbox" 
              className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" 
              disabled={isLoading}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--color-text)]">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <a href="/tg/forgot-password" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
              Forgot your password?
            </a>
          </div>
        </div>

        <div>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign in
          </Button>
        </div>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-[var(--color-secondary)]">Don&apos;t have an account? </span>
          <a href="/tg/signup" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
            Create an account
          </a>
        </div>
      </form>
    </AuthLayout>
  )
}
