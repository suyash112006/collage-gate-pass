import React from "react"

import { createClient, getAuthUser } from "@/lib/supabase/server"
import { DashboardShell } from "./dashboard-shell"

export async function DashboardLayout({ children, userRole }: { children: React.ReactNode; userRole: "STUDENT" | "TG" }) {
  let unreadCount = 0
  let userName = userRole === "STUDENT" ? "Student" : "Teacher Guardian"
  
  try {
    const supabase = await createClient()
    const { data: authData } = await getAuthUser()
    
    if (authData?.user) {
      // Safely run independent DB queries in parallel using the authenticated user
      const [profileResult, notifResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', authData.user.id)
          .single(),
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', authData.user.id)
          .eq('is_read', false)
      ])

      if (profileResult.data?.full_name) {
        userName = profileResult.data.full_name
      }
      
      if (notifResult.count !== null && notifResult.count !== undefined) {
        unreadCount = notifResult.count
      }
    }
  } catch (error) {
    // Next.js throws this error to interrupt static generation and switch to dynamic rendering.
    // If we swallow it, the route fails to build correctly.
    const err = error as { digest?: string; message?: string };
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) {
      throw error
    }
    console.error("Error fetching dashboard layout data:", error)
  }

  return (
    <DashboardShell userRole={userRole} unreadCount={unreadCount} userName={userName}>
      {children}
    </DashboardShell>
  )
}
