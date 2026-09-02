import React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StudentSettingsClient } from "./student-settings-client"

export default function StudentSettingsPage() {
  return (
    <DashboardLayout userRole="STUDENT">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Settings</h1>
          <p className="text-xs text-[var(--color-secondary)] mt-0.5">
            Manage your account settings, preferences, and security.
          </p>
        </div>

        <StudentSettingsClient />
      </div>
    </DashboardLayout>
  )
}
