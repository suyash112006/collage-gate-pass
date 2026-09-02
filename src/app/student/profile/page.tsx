import React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ErrorState } from "@/components/ui/error-state"
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StudentProfileClient } from "./student-profile-client"

export default async function StudentProfilePage() {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    redirect('/student/login')
  }

  // Fetch student profile & related profiles data
  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .select(`
      student_id,
      roll_no,
      department,
      year,
      division,
      profiles (
        full_name,
        email,
        phone
      )
    `)
    .eq('user_id', authData.user.id)
    .single()

  if (studentError || !studentData) {
    return (
      <DashboardLayout userRole="STUDENT">
        <ErrorState title="Profile Error" message="Student profile not found. Please contact administration." />
      </DashboardLayout>
    )
  }

  type ProfileType = { full_name: string; email: string; phone: string | null }
  const profileRaw = studentData.profiles as unknown as ProfileType | ProfileType[] | null
  const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw

  const studentName = profile?.full_name || "Student"
  const studentEmail = profile?.email || authData.user.email || "N/A"
  const studentPhone = profile?.phone || "Not provided"

  return (
    <DashboardLayout userRole="STUDENT">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">My Profile</h1>
          <p className="text-xs text-[var(--color-secondary)] mt-0.5">
            View and verify your personal student profile information.
          </p>
        </div>

        <StudentProfileClient 
          studentData={studentData} 
          studentName={studentName}
          studentEmail={studentEmail}
          studentPhone={studentPhone}
        />
      </div>
    </DashboardLayout>
  )
}
