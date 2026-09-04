"use client"

import React, { useState } from "react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

import { tgSignUp } from "@/app/actions/auth"

export default function TgSignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "", teacherId: "", department: "", email: "",
    password: "", confirmPassword: ""
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    const newErrors: Record<string, boolean> = {}
    let hasError = false

    Object.keys(formData).forEach((key) => {
      if (!formData[key as keyof typeof formData]) {
        newErrors[key] = true
        hasError = true
      }
    })

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.")
      newErrors.password = true
      hasError = true
    } else if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      newErrors.password = true
      newErrors.confirmPassword = true
      hasError = true
    }

    if (!formData.email.includes("@")) {
      newErrors.email = true
      hasError = true
    }

    setErrors(newErrors)
    if (hasError) {
      if (!error) setError("Please correct the errors below.")
      return
    }

    setIsLoading(true)
    
    // Real Supabase Auth call
    const formDataObj = new FormData()
    formDataObj.append('name', formData.name)
    formDataObj.append('email', formData.email)
    formDataObj.append('password', formData.password)
    formDataObj.append('teacherId', formData.teacherId)
    formDataObj.append('department', formData.department)
    
    const result = await tgSignUp(formDataObj)
    
    setIsLoading(false)
    
    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      router.push('/tg/login')
    }
  }



  return (
    <AuthLayout title="TG Registration" subtitle="Register to manage your assigned students">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name" className={errors.name ? "text-[var(--color-declined)]" : ""}>Full Name</Label>
            <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} error={errors.name} disabled={isLoading} />
          </div>
          
          <div>
            <Label htmlFor="teacherId" className={errors.teacherId ? "text-[var(--color-declined)]" : ""}>Teacher ID</Label>
            <Input id="teacherId" name="teacherId" type="text" value={formData.teacherId} onChange={handleChange} error={errors.teacherId} disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="department" className={errors.department ? "text-[var(--color-declined)]" : ""}>Department</Label>
            <Select id="department" name="department" value={formData.department} onChange={handleChange} error={errors.department} disabled={isLoading}>
              <option value="">Select Department</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
              <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Other">Other</option>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="email" className={errors.email ? "text-[var(--color-declined)]" : ""}>Staff Email Address</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} disabled={isLoading} />
          </div>

          <div>
            <Label htmlFor="password" className={errors.password ? "text-[var(--color-declined)]" : ""}>Password</Label>
            <Input 
              id="password" name="password" type={showPassword ? "text" : "password"} 
              value={formData.password} onChange={handleChange} error={errors.password} disabled={isLoading} 
              rightElement={
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 focus:outline-none" disabled={isLoading}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword" className={errors.confirmPassword ? "text-[var(--color-declined)]" : ""}>Confirm Password</Label>
            <Input 
              id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} 
              value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} disabled={isLoading} 
              rightElement={
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 focus:outline-none" disabled={isLoading}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full" isLoading={isLoading}>Create Account</Button>
        </div>
        <div className="text-sm text-center pt-2">
          <a href="/tg/login" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
            Already registered? Sign in
          </a>
        </div>
      </form>
    </AuthLayout>
  )
}
