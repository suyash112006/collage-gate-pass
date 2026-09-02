"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Phone, Hash, Building, Edit2, X, Check } from "lucide-react"
import { updateTgProfile } from "@/app/actions/tg-profile"

type TgProfileProps = {
  tgData: {
    department: string
    teacher_id: string
  }
  tgName: string
  tgEmail: string
  tgPhone: string
}

export function TgProfileClient({ tgData, tgName, tgEmail, tgPhone }: TgProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: tgName,
    email: tgEmail,
    teacher_id: tgData.teacher_id,
    phone: tgPhone === "Not provided" ? "" : tgPhone,
    department: tgData.department,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    
    const submitData = new FormData()
    submitData.append("full_name", formData.full_name)
    submitData.append("phone", formData.phone)
    submitData.append("teacher_id", formData.teacher_id)
    submitData.append("department", formData.department)
    // Immutable fields are not updated: email

    const result = await updateTgProfile(submitData)

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
            <Avatar name={formData.full_name} size="lg" className="w-28 h-28 text-3xl shadow-md" />
            <div className="mt-2 sm:mt-0 flex-1">
              <h2 className="text-2xl font-bold text-[var(--color-text)]">{formData.full_name}</h2>
              <p className="text-sm font-mono text-[var(--color-portal)] font-semibold mt-1">ID: {formData.teacher_id}</p>
              <p className="text-sm text-[var(--color-secondary)] mt-1">{formData.department}</p>
            </div>
            
            <div className="flex flex-col gap-3 self-center sm:self-center w-full sm:w-auto mt-4 sm:mt-0 items-center sm:items-end">
              <span className="px-3 py-1.5 rounded-full bg-[var(--color-portal)] text-white text-xs font-semibold shadow-sm text-center">
                TG Account Active
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
              <p className="font-semibold text-[var(--color-text)]">{formData.full_name}</p>
            )}
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] shadow-sm transition-colors duration-200">
            <span className="text-[var(--color-secondary)] font-medium flex items-center gap-2 text-xs uppercase tracking-wider">
              <Mail className="w-4 h-4 text-[var(--color-portal)]" /> Email Address
            </span>
            <p className="font-semibold text-[var(--color-text)]">{tgEmail}</p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] shadow-sm transition-colors duration-200">
            <span className="text-[var(--color-secondary)] font-medium flex items-center gap-2 text-xs uppercase tracking-wider">
              <Hash className="w-4 h-4 text-[var(--color-portal)]" /> Teacher ID
            </span>
            {isEditing ? (
              <Input name="teacher_id" value={formData.teacher_id} onChange={handleChange} className="h-8 text-sm font-mono" placeholder="Teacher ID" />
            ) : (
              <p className="font-mono font-semibold text-[var(--color-text)]">{formData.teacher_id}</p>
            )}
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] shadow-sm transition-colors duration-200">
            <span className="text-[var(--color-secondary)] font-medium flex items-center gap-2 text-xs uppercase tracking-wider">
              <Phone className="w-4 h-4 text-[var(--color-portal)]" /> Phone Number
            </span>
            {isEditing ? (
              <Input name="phone" value={formData.phone} onChange={handleChange} className="h-8 text-sm" placeholder="e.g. 1234567890" />
            ) : (
              <p className="font-semibold text-[var(--color-text)]">{tgPhone}</p>
            )}
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] shadow-sm transition-colors duration-200">
            <span className="text-[var(--color-secondary)] font-medium flex items-center gap-2 text-xs uppercase tracking-wider">
              <Building className="w-4 h-4 text-[var(--color-portal)]" /> Department
            </span>
            {isEditing ? (
              <Input name="department" value={formData.department} onChange={handleChange} className="h-8 text-sm" placeholder="Department (e.g. Computer Science)" />
            ) : (
              <p className="font-semibold text-[var(--color-text)]">{formData.department}</p>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
