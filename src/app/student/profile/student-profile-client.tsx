"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Phone, Hash, Building, Layers, Edit2, X, Check } from "lucide-react"
import { updateStudentProfile } from "@/app/actions/profile"

type StudentProfileProps = {
  studentData: {
    department: string
    year: string
    division: string
    student_id: string
    roll_no: string
  }
  studentName: string
  studentEmail: string
  studentPhone: string
}

export function StudentProfileClient({ studentData, studentName, studentEmail, studentPhone }: StudentProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: studentName,
    email: studentEmail,
    student_id: studentData.student_id,
    roll_no: studentData.roll_no,
    phone: studentPhone === "Not provided" ? "" : studentPhone,
    department: studentData.department,
    year: studentData.year,
    division: studentData.division,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    
    const submitData = new FormData()
    submitData.append("full_name", formData.full_name)
    submitData.append("student_id", formData.student_id)
    submitData.append("roll_no", formData.roll_no)
    submitData.append("phone", formData.phone)
    submitData.append("department", formData.department)
    submitData.append("year", formData.year)
    submitData.append("division", formData.division)

    const result = await updateStudentProfile(submitData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setIsEditing(false)
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Polished Header Banner */}
      <div className="bg-[var(--color-portal-light)]/40 dark:bg-[var(--color-portal-light)] relative p-4 sm:p-6 border-b border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full">
            <Avatar name={formData.full_name} size="lg" className="w-28 h-28 text-3xl ring-4 ring-[var(--color-surface)] shadow-md" />
            <div className="mt-2 sm:mt-0 flex-1">
              <h2 className="text-2xl font-bold text-[var(--color-text)]">{formData.full_name}</h2>
              <p className="text-sm font-mono text-[var(--color-portal)] font-semibold mt-1">ID: {formData.student_id}</p>
              <p className="text-sm text-[var(--color-secondary)] mt-1">{formData.department} • {formData.year} Year (Div {formData.division})</p>
            </div>
            
            <div className="flex flex-col gap-3 self-center sm:self-center w-full sm:w-auto mt-4 sm:mt-0 items-center sm:items-end">
              <span className="px-3 py-1.5 rounded-full bg-[var(--color-portal)] text-white text-xs font-semibold shadow-sm text-center">
                Student Account Active
              </span>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2 bg-[var(--color-surface)] shadow-sm">
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isLoading} className="text-red-500 hover:text-red-600 bg-[var(--color-surface)] shadow-sm">
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} isLoading={isLoading} className="shadow-sm">
                    <Check className="w-4 h-4 mr-1" /> Confirm
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6 pt-8 relative">
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Profile Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          
          <div className="space-y-2 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] shadow-sm transition-colors duration-200">
            <span className="text-[var(--color-secondary)] font-medium flex items-center gap-2 text-xs uppercase tracking-wider">
              <User className="w-4 h-4 text-[var(--color-portal)]" /> Full Name
            </span>
            {isEditing ? (
              <Input name="full_name" value={formData.full_name} onChange={handleChange} className="h-8 text-sm" placeholder="Full Name" />
            ) : (
              <p className="font-semibold text-[var(--color-text)]">{studentName}</p>
            )}
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] shadow-sm transition-colors duration-200">
            <span className="text-[var(--color-secondary)] font-medium flex items-center gap-2 text-xs uppercase tracking-wider">
              <Mail className="w-4 h-4 text-[var(--color-portal)]" /> Email Address
            </span>
            <p className="font-semibold text-[var(--color-text)]">{studentEmail}</p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] shadow-sm transition-colors duration-200">
            <span className="text-[var(--color-secondary)] font-medium flex items-center gap-2 text-xs uppercase tracking-wider">
              <Hash className="w-4 h-4 text-[var(--color-portal)]" /> Student ID / Roll No
            </span>
            {isEditing ? (
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--color-secondary)] whitespace-nowrap">Stu</span>
                  <Input name="student_id" value={formData.student_id} onChange={handleChange} className="h-8 text-sm w-28 font-mono text-center" placeholder="STU-001" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--color-secondary)] whitespace-nowrap">R</span>
                  <Input name="roll_no" value={formData.roll_no} onChange={handleChange} className="h-8 text-sm w-24 font-mono text-center" placeholder="R-01" />
                </div>
              </div>
            ) : (
              <p className="font-mono font-semibold text-[var(--color-text)]">{studentData.student_id} / {studentData.roll_no}</p>
            )}
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] shadow-sm transition-colors duration-200">
            <span className="text-[var(--color-secondary)] font-medium flex items-center gap-2 text-xs uppercase tracking-wider">
              <Phone className="w-4 h-4 text-[var(--color-portal)]" /> Phone Number
            </span>
            {isEditing ? (
              <Input name="phone" value={formData.phone} onChange={handleChange} className="h-8 text-sm" placeholder="e.g. 1234567890" />
            ) : (
              <p className="font-semibold text-[var(--color-text)]">{studentPhone}</p>
            )}
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] shadow-sm transition-colors duration-200">
            <span className="text-[var(--color-secondary)] font-medium flex items-center gap-2 text-xs uppercase tracking-wider">
              <Building className="w-4 h-4 text-[var(--color-portal)]" /> Department
            </span>
            {isEditing ? (
              <Input name="department" value={formData.department} onChange={handleChange} className="h-8 text-sm" placeholder="e.g. Computer Science" />
            ) : (
              <p className="font-semibold text-[var(--color-text)]">{studentData.department}</p>
            )}
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] shadow-sm transition-colors duration-200">
            <span className="text-[var(--color-secondary)] font-medium flex items-center gap-2 text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4 text-[var(--color-portal)]" /> Year & Division
            </span>
            {isEditing ? (
              <div className="flex items-center gap-6 mt-1">
                <div className="flex items-center gap-2">
                  <Input name="year" value={formData.year} onChange={handleChange} className="h-8 text-sm w-16 text-center" placeholder="3" />
                  <span className="text-sm font-medium text-[var(--color-secondary)] whitespace-nowrap">Year</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--color-secondary)] whitespace-nowrap">Div</span>
                  <Input name="division" value={formData.division} onChange={handleChange} className="h-8 text-sm w-16 text-center" placeholder="A" />
                </div>
              </div>
            ) : (
              <p className="font-semibold text-[var(--color-text)]">{studentData.year} Year / Division {studentData.division}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
