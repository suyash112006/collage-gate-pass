"use client"

import React, { useState } from "react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

import { studentSignUp, fetchAvailableTGs } from "@/app/actions/auth"

export default function StudentSignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "", studentId: "", roll: "", department: "",
    year: "", division: "", phone: "", email: "",
    password: "", confirmPassword: "", tgId: ""
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tgs, setTgs] = useState<Array<{tg_id: string, full_name: string, department: string}>>([])
  
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  React.useEffect(() => {
    async function loadTGs() {
      const { data, error } = await fetchAvailableTGs()
      if (data) {
        setTgs(data)
      } else if (error) {
        console.error("Failed to load TGs:", error)
      }
    }
    loadTGs()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
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

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must be 10 digits.")
      newErrors.phone = true
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
    formDataObj.append('phone', formData.phone)
    formDataObj.append('password', formData.password)
    formDataObj.append('studentId', formData.studentId)
    formDataObj.append('roll', formData.roll)
    formDataObj.append('department', formData.department)
    formDataObj.append('year', formData.year)
    formDataObj.append('division', formData.division)
    formDataObj.append('tgId', formData.tgId)
    
    const result = await studentSignUp(formDataObj)
    
    setIsLoading(false)
    
    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      router.push('/student/login')
    }
  }



  return (
    <AuthLayout title="Student Registration" subtitle="Create your student account to manage gate passes">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name" className={errors.name ? "text-[var(--color-declined)]" : ""}>Full Name</Label>
            <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} error={errors.name} disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="studentId" className={errors.studentId ? "text-[var(--color-declined)]" : ""}>Student ID</Label>
            <Input id="studentId" name="studentId" type="text" value={formData.studentId} onChange={handleChange} error={errors.studentId} disabled={isLoading} />
          </div>
          
          <div>
            <Label htmlFor="roll" className={errors.roll ? "text-[var(--color-declined)]" : ""}>Roll Number</Label>
            <Input id="roll" name="roll" type="text" value={formData.roll} onChange={handleChange} error={errors.roll} disabled={isLoading} />
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

          <div>
            <Label htmlFor="year" className={errors.year ? "text-[var(--color-declined)]" : ""}>Year</Label>
            <Select id="year" name="year" value={formData.year} onChange={handleChange} error={errors.year} disabled={isLoading}>
              <option value="">Select Year</option>
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
              <option value="Third Year">Third Year</option>
              <option value="Fourth Year">Fourth Year</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="division" className={errors.division ? "text-[var(--color-declined)]" : ""}>Division</Label>
            <Select id="division" name="division" value={formData.division} onChange={handleChange} error={errors.division} disabled={isLoading}>
              <option value="">Select Division</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="phone" className={errors.phone ? "text-[var(--color-declined)]" : ""}>Phone Number</Label>
            <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} error={errors.phone} disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="email" className={errors.email ? "text-[var(--color-declined)]" : ""}>Student Email</Label>
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

        <div className="pt-2">
          <Label htmlFor="tgId" className={errors.tgId ? "text-[var(--color-declined)]" : ""}>Teacher Guardian</Label>
          <Select id="tgId" name="tgId" value={formData.tgId} onChange={handleChange} error={errors.tgId} disabled={isLoading}>
            <option value="">Select Teacher Guardian</option>
            {tgs.map(tg => (
              <option key={tg.tg_id} value={tg.tg_id}>
                {tg.full_name} ({tg.department})
              </option>
            ))}
          </Select>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full" isLoading={isLoading}>Create Account</Button>
        </div>

        <div className="text-sm text-center pt-2">
          <a href="/student/login" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
            Already have an account? Sign in
          </a>
        </div>
      </form>
    </AuthLayout>
  )
}
