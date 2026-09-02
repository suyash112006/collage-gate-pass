import React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TgAccessClient } from "./tg-access-client"

export default function TgAccessPage() {
  return (
    <DashboardLayout userRole="TG">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Student Access</h1>
          <p className="text-[var(--color-secondary)]">Manage the fixed student portal URL and QR code.</p>
        </div>
        
        <TgAccessClient />
      </div>
    </DashboardLayout>
  )
}
