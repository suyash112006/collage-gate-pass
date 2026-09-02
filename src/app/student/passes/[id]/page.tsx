import { getStudentGatePassDetail } from "@/app/actions/gate-pass"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorState } from "@/components/ui/error-state"
import { Clock, FileText, MessageSquare, Calendar, ChevronLeft, User, Info } from "lucide-react"
import Link from "next/link"

type GatePassDetail = {
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
  tgs: {
    profiles: {
      full_name: string
    } | { full_name: string }[] | null
  } | {
    profiles: {
      full_name: string
    } | { full_name: string }[] | null
  }[] | null
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

function formatTime(timeString: string) {
  if (!timeString) return ""
  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(parseInt(hours, 10))
  date.setMinutes(parseInt(minutes, 10))
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

export default async function StudentRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const result = await getStudentGatePassDetail(resolvedParams.id)

  if (result.error || !result.success || !result.data) {
    return (
      <DashboardLayout userRole="STUDENT">
        <div className="space-y-6">
          <Link href="/student/passes" className="inline-flex items-center text-xs font-semibold text-[var(--color-portal)] hover:underline">
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Back to My Passes
          </Link>
          <ErrorState title="Request Not Found" message={result.error || "Gate pass request not found."} />
        </div>
      </DashboardLayout>
    )
  }

  const req = result.data as unknown as GatePassDetail
  const tgData = Array.isArray(req.tgs) ? req.tgs[0] : req.tgs
  const tgProfile = tgData ? (Array.isArray(tgData.profiles) ? tgData.profiles[0] : tgData.profiles) : null
  const tgName = tgProfile?.full_name || "Assigned Teacher Guardian"

  return (
    <DashboardLayout userRole="STUDENT">
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/student/passes"
              className="inline-flex items-center text-xs font-semibold text-[var(--color-portal)] hover:underline mb-2"
            >
              <ChevronLeft className="mr-1 h-3.5 w-3.5" />
              Back to My Passes
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Gate Pass Details</h1>
            <p className="text-xs text-[var(--color-secondary)] mt-0.5">
              View your gate pass request information.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={req.status.toUpperCase() as "PENDING" | "APPROVED" | "DECLINED"} />
          </div>
        </div>

        {/* 2 Grid Cards — Matching Reference Image 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Request Information Card */}
          <Card>
            <CardHeader className="border-b border-[var(--color-border)] py-4">
              <CardTitle className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--color-portal)]" />
                <span>Request Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-secondary)] font-medium">Reason</span>
                <span className="font-semibold text-[var(--color-text)]">{req.reason}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-secondary)] font-medium">Destination</span>
                <span className="font-semibold text-[var(--color-text)]">{req.destination}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-secondary)] font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Pass Date
                </span>
                <span className="font-medium text-[var(--color-text)]">{req.pass_date === req.return_date ? formatDate(req.pass_date) : `${formatDate(req.pass_date)} - ${formatDate(req.return_date)}`}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-secondary)] font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Leaving Time
                </span>
                <span className="font-medium text-[var(--color-text)]">{formatTime(req.leaving_time)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-secondary)] font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Expected Return
                </span>
                <span className="font-medium text-[var(--color-text)]">{formatTime(req.expected_return_time)}</span>
              </div>
              {req.additional_info && (
                <div className="py-1">
                  <span className="text-[var(--color-secondary)] font-medium flex items-center gap-1 mb-1">
                    <MessageSquare className="h-3 w-3" /> Additional Information
                  </span>
                  <p className="text-xs text-[var(--color-text)] bg-[var(--color-background)] p-2 rounded border border-[var(--color-border)]">
                    {req.additional_info}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Information Card */}
          <Card>
            <CardHeader className="border-b border-[var(--color-border)] py-4">
              <CardTitle className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                <Info className="h-4 w-4 text-[var(--color-portal)]" />
                <span>Status Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-secondary)] font-medium">Status</span>
                <StatusBadge status={req.status.toUpperCase() as "PENDING" | "APPROVED" | "DECLINED"} />
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-secondary)] font-medium">Submitted On</span>
                <span className="font-medium text-[var(--color-text)]">
                  {formatDate(req.created_at)}, {formatTime(req.created_at.split('T')[1]?.substring(0,5) || "00:00")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-secondary)] font-medium flex items-center gap-1">
                  <User className="h-3 w-3" /> Reviewing Authority
                </span>
                <span className="font-semibold text-[var(--color-text)]">{tgName}</span>
              </div>
              <div className="py-1">
                <span className="text-[var(--color-secondary)] font-medium flex items-center gap-1 mb-1">
                  <MessageSquare className="h-3 w-3" /> TG Remark
                </span>
                <p className="text-xs text-[var(--color-text)] bg-[var(--color-background)] p-2.5 rounded border border-[var(--color-border)]">
                  {req.tg_remark || "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>You will receive an in-app and Web Push notification once your request status is reviewed by your Teacher Guardian.</span>
        </div>
      </div>
    </DashboardLayout>
  )
}
