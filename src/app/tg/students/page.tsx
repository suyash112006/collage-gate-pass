import React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { StudentManagementClient } from "@/components/tg/student-management-client"

export default async function TGStudentsPage() {
  const supabase = await createClient()
  const { data: authData } = await getAuthUser()

  if (!authData?.user) {
    return null
  }

  // Get TG's internal ID
  const { data: tgRecord } = await supabase
    .from('tgs')
    .select('id')
    .eq('user_id', authData.user.id)
    .single()

  let students: Array<{
    id: string
    student_id: string
    department: string
    year: string
    status: string
    created_at: string
    full_name: string
    email: string
  }> = []

  if (tgRecord) {
    // Fetch all students assigned to this TG
    // We also need their profile details (name, email)
    const { data: studentsData } = await supabase
      .from('students')
      .select(`
        id,
        student_id,
        department,
        year,
        status,
        created_at,
        profiles!user_id (
          full_name,
          email
        )
      `)
      .eq('tg_id', tgRecord.id)
      .order('created_at', { ascending: false })

    if (studentsData) {
      students = studentsData.map(s => {
        const profile = s.profiles as unknown as Record<string, string>
        return {
          id: s.id,
          student_id: s.student_id,
          department: s.department,
          year: s.year,
          status: s.status,
          created_at: s.created_at,
          full_name: profile?.full_name || 'Unknown',
          email: profile?.email || ''
        }
      })
    }
  }

  return (
    <DashboardLayout userRole="TG">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Student Management</h1>
          <p className="text-sm text-[var(--color-secondary)] mt-1">
            Manage student access and approval requests
          </p>
        </div>

        <StudentManagementClient initialStudents={students} />
      </div>
    </DashboardLayout>
  )
}
