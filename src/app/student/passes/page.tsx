import { getStudentGatePasses } from "@/app/actions/gate-pass"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StudentPassesClient } from "./student-passes-client"
import { ErrorState } from "@/components/ui/error-state"

type GatePass = {
  id: string
  reason: string
  destination: string
  pass_date: string
  return_date: string
  leaving_time: string
  expected_return_time: string
  additional_info: string | null
  status: string
  tg_remark: string | null
  created_at: string
}

export default async function StudentPassHistoryPage() {
  const result = await getStudentGatePasses()

  let passes: GatePass[] = []
  let errorMessage: string | null = null

  if (result.error) {
    errorMessage = result.error
  } else if (result.success && result.data) {
    passes = result.data as GatePass[]
  }

  return (
    <DashboardLayout userRole="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">My Gate Passes</h1>
          <p className="mt-1 text-xs text-[var(--color-secondary)]">
            View and track all your gate pass requests.
          </p>
        </div>

        {errorMessage ? (
          <ErrorState message={errorMessage} />
        ) : (
          <StudentPassesClient initialPasses={passes} />
        )}
      </div>
    </DashboardLayout>
  )
}
