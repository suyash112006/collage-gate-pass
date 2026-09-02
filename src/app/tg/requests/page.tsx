import { getTgAllRequests } from "@/app/actions/gate-pass"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TgRequestsClient, GatePassRequest } from "./tg-requests-client"
import { ErrorState } from "@/components/ui/error-state"

export default async function TgRequestsPage() {
  const result = await getTgAllRequests()

  if (result.error) {
    return (
      <DashboardLayout userRole="TG">
        <ErrorState 
          title="Failed to load requests" 
          message="There was an error loading the gate pass requests. Please try again." 
        />
      </DashboardLayout>
    )
  }

  const requests = (result.success && result.data) ? result.data : []

  return (
    <DashboardLayout userRole="TG">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Gate Pass Requests</h1>
          <p className="text-sm text-[var(--color-secondary)] mt-1.5">
            Manage gate pass requests submitted by your assigned students.
          </p>
        </div>

        <TgRequestsClient initialRequests={requests as unknown as GatePassRequest[]} />
      </div>
    </DashboardLayout>
  )
}
