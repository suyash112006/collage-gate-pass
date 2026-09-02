import React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { CreatePassForm } from "./create-pass-form"
import { redirect } from "next/navigation"

export default async function CreateGatePassPage() {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    redirect('/student/login')
  }

  // Fetch student and profile data
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
        phone
      )
    `)
    .eq('user_id', authData.user.id)
    .single()

  if (studentError || !studentData) {
    return (
      <DashboardLayout userRole="STUDENT">
        <div className="rounded-md bg-red-50 p-4 border border-red-200 text-sm font-medium text-red-800">
          Student profile not found. Please contact administration.
        </div>
      </DashboardLayout>
    )
  }

  // Supabase returns related objects as an array or a single object depending on the foreign key definition
  type ProfileType = { full_name: string; phone: string | null }
  const profileRaw = studentData.profiles as unknown as ProfileType | ProfileType[] | null
  const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw

  const flattenedStudentData = {
    full_name: profile?.full_name || '',
    student_id: studentData.student_id,
    roll_no: studentData.roll_no,
    department: studentData.department,
    year: studentData.year,
    division: studentData.division,
    phone: profile?.phone || null,
  }

  return (
    <DashboardLayout userRole="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Create Gate Pass</h1>
          <p className="text-[var(--color-secondary)]">Submit a new request to your Teacher Guardian.</p>
        </div>

        <CreatePassForm studentData={flattenedStudentData} />
      </div>
    </DashboardLayout>
  )
}
