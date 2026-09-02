import React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ErrorState } from "@/components/ui/error-state"
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TgProfileClient } from "./tg-profile-client"

export default async function TgProfilePage() {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    redirect('/tg/login')
  }

  // Fetch TG profile & related profiles data
  const { data: tgData, error: tgError } = await supabase
    .from('tgs')
    .select(`
      teacher_id,
      department,
      profiles (
        full_name,
        email,
        phone
      )
    `)
    .eq('user_id', authData.user.id)
    .single()

  if (tgError || !tgData) {
    return (
      <DashboardLayout userRole="TG">
        <ErrorState title="Profile Error" message="Teacher Guardian profile not found. Please contact administration." />
      </DashboardLayout>
    )
  }

  type ProfileType = { full_name: string; email: string; phone: string | null }
  const profileRaw = tgData.profiles as unknown as ProfileType | ProfileType[] | null
  const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw

  const tgName = profile?.full_name || "Teacher Guardian"
  const tgEmail = profile?.email || authData.user.email || "N/A"
  const tgPhone = profile?.phone || "Not provided"

  return (
    <DashboardLayout userRole="TG">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">My Profile</h1>
          <p className="text-xs text-[var(--color-secondary)] mt-0.5">
            View and verify your Teacher Guardian profile information.
          </p>
        </div>

        <TgProfileClient 
          tgData={tgData} 
          tgName={tgName}
          tgEmail={tgEmail}
          tgPhone={tgPhone}
        />
      </div>
    </DashboardLayout>
  )
}
