import { getTgGatePassDetail } from "@/app/actions/gate-pass"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin, FileText, MessageSquare, User, Calendar, Phone, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { ReviewControls } from "@/components/gate-pass/review-controls"

type ProfileData = {
  full_name: string
  phone: string
}

type StudentData = {
  id: string
  student_id: string
  roll_no: string
  department: string
  year: string
  division: string
  profiles: ProfileData | ProfileData[] | null
}

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
  student_id: string
  students: StudentData | StudentData[] | null
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

export default async function TgRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const result = await getTgGatePassDetail(resolvedParams.id)

  if (result.error || !result.success || !result.data) {
    return (
      <DashboardLayout userRole="TG">
        <div className="space-y-6">
          <Link
            href="/tg/requests"
            className="inline-flex items-center text-sm font-semibold text-[var(--color-portal)] hover:text-[var(--color-portal-dark)] hover:underline transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Requests
          </Link>
          <div className="rounded-xl bg-red-50 dark:bg-red-500/10 p-5 border border-red-200 dark:border-red-900/50">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-400">Request Not Found</h3>
            <p className="mt-1 text-xs text-red-700 dark:text-red-300">{result.error || "Gate pass request not found."}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const req = result.data as unknown as GatePassDetail
  const student = Array.isArray(req.students) ? req.students[0] : req.students
  const profile = student ? (Array.isArray(student.profiles) ? student.profiles[0] : student.profiles) : null
  const studentName = profile?.full_name || "Unknown Student"
  const studentPhone = profile?.phone || "Not provided"

  return (
    <DashboardLayout userRole="TG">
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/tg/requests"
              className="inline-flex items-center text-sm font-semibold text-[var(--color-portal)] hover:text-[var(--color-portal-dark)] hover:underline transition-colors mb-3"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Requests
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Request Details</h1>
            <p className="text-sm text-[var(--color-secondary)] mt-1.5">
              View complete gate pass request information.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={req.status.toUpperCase() as "PENDING" | "APPROVED" | "DECLINED"} />
          </div>
        </div>

        {/* Two Column Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Information Card */}
          <Card className="border-[var(--color-border)] shadow-sm">
            <CardHeader className="border-b border-[var(--color-border)] py-4 px-6 bg-[var(--color-background)] rounded-t-xl">
              <CardTitle className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                <User className="h-4 w-4 text-[var(--color-portal)]" />
                <span>Student Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col divide-y divide-[var(--color-border)]">
                <div className="flex justify-between items-center py-3 px-6 hover:bg-[var(--color-background)] transition-colors">
                  <span className="text-xs text-[var(--color-secondary)] font-medium">Full Name</span>
                  <span className="text-sm font-semibold text-[var(--color-text)]">{studentName}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-6 hover:bg-[var(--color-background)] transition-colors">
                  <span className="text-xs text-[var(--color-secondary)] font-medium">Student ID</span>
                  <span className="text-sm font-mono font-medium text-[var(--color-text)]">{student?.student_id || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-6 hover:bg-[var(--color-background)] transition-colors">
                  <span className="text-xs text-[var(--color-secondary)] font-medium">Roll Number</span>
                  <span className="text-sm font-mono font-medium text-[var(--color-text)]">{student?.roll_no || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-6 hover:bg-[var(--color-background)] transition-colors">
                  <span className="text-xs text-[var(--color-secondary)] font-medium">Department</span>
                  <span className="text-sm font-medium text-[var(--color-text)]">{student?.department || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-6 hover:bg-[var(--color-background)] transition-colors">
                  <span className="text-xs text-[var(--color-secondary)] font-medium">Year / Division</span>
                  <span className="text-sm font-medium text-[var(--color-text)]">{student ? `${student.year} Year / ${student.division}` : "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-6 hover:bg-[var(--color-background)] transition-colors">
                  <span className="text-xs text-[var(--color-secondary)] font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Phone
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text)]">{studentPhone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gate Pass Information Card */}
          <Card className="border-[var(--color-border)] shadow-sm">
            <CardHeader className="border-b border-[var(--color-border)] py-4 px-6 bg-[var(--color-background)] rounded-t-xl">
              <CardTitle className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--color-portal)]" />
                <span>Gate Pass Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col divide-y divide-[var(--color-border)]">
                <div className="flex justify-between items-center py-3 px-6 hover:bg-[var(--color-background)] transition-colors">
                  <span className="text-xs text-[var(--color-secondary)] font-medium flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Reason
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-text)]">{req.reason}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-6 hover:bg-[var(--color-background)] transition-colors">
                  <span className="text-xs text-[var(--color-secondary)] font-medium flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Destination
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-text)] text-right">{req.destination}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-6 hover:bg-[var(--color-background)] transition-colors">
                  <span className="text-xs text-[var(--color-secondary)] font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Pass Date
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text)]">{req.pass_date === req.return_date ? formatDate(req.pass_date) : `${formatDate(req.pass_date)} - ${formatDate(req.return_date)}`}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-6 hover:bg-[var(--color-background)] transition-colors">
                  <span className="text-xs text-[var(--color-secondary)] font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Leaving Time
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text)]">{formatTime(req.leaving_time)}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-6 hover:bg-[var(--color-background)] transition-colors">
                  <span className="text-xs text-[var(--color-secondary)] font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Expected Return
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text)]">{formatTime(req.expected_return_time)}</span>
                </div>
                {req.additional_info && (
                  <div className="py-3 px-6">
                    <span className="text-xs text-[var(--color-secondary)] font-medium flex items-center gap-1.5 mb-2">
                      <MessageSquare className="h-3.5 w-3.5" /> Additional Information
                    </span>
                    <p className="text-sm text-[var(--color-text)] bg-[var(--color-background)] p-3 rounded-lg border border-[var(--color-border)] leading-relaxed">
                      {req.additional_info}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Action & Remarks Card */}
        <Card className="border-[var(--color-border)] shadow-sm">
          <CardHeader className="border-b border-[var(--color-border)] py-4 px-6 bg-[var(--color-background)] rounded-t-xl">
            <CardTitle className="text-sm font-semibold text-[var(--color-text)]">
              Request Review & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {req.tg_remark && req.status !== 'pending' && (
              <div className="mb-6 rounded-xl bg-amber-50 dark:bg-amber-500/10 p-4 border border-amber-200 dark:border-amber-900/50">
                <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-1.5">
                  <MessageSquare className="h-4 w-4" /> TG Remark
                </h4>
                <p className="text-sm text-amber-900 dark:text-amber-200">{req.tg_remark}</p>
              </div>
            )}

            <ReviewControls passId={req.id} initialStatus={req.status} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
