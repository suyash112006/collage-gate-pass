import React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { getTgDashboardStats } from "@/app/actions/gate-pass"
import { createClient, getAuthUser } from "@/lib/supabase/server"
import Link from "next/link"
import { Clock, CheckCircle2, XCircle, FileText, ChevronRight } from "lucide-react"

type ProfileData = { full_name: string }
type StudentData = {
  student_id: string
  roll_no: string
  profiles: ProfileData | ProfileData[] | null
}
type RecentRequest = {
  id: string
  reason: string
  destination: string
  pass_date: string
  return_date: string
  leaving_time: string
  expected_return_time: string
  status: string
  created_at: string
  students: StudentData | StudentData[] | null
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatTime(timeString: string) {
  if (!timeString) return ""
  const parts = timeString.split(':')
  const date = new Date()
  date.setHours(parseInt(parts[0], 10))
  date.setMinutes(parseInt(parts[1], 10))
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

export default async function TgDashboardPage() {
  const supabase = await createClient()
  const { data: authData } = await getAuthUser()
  
  let tgName = "Teacher Guardian"
  if (authData?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', authData.user.id)
      .single()
    if (profile?.full_name) {
      tgName = profile.full_name.replace(/^Test\s+/i, '')
    }
  }

  const result = await getTgDashboardStats()
  const stats = (result.success && result.data) ? result.data : {
    pending_count: 0,
    approved_this_month: 0,
    declined_this_month: 0,
    total_requests: 0,
    recent_pending: []
  }

  const recentRequests = stats.recent_pending as RecentRequest[]

  return (
    <DashboardLayout userRole="TG">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] flex items-center gap-2">
            Welcome back, {tgName} <span className="inline-block animate-bounce origin-bottom">👋</span>
          </h1>
          <p className="text-sm text-[var(--color-secondary)] mt-1.5">
            Here&apos;s what&apos;s happening with your students.
          </p>
        </div>

        {/* 4 Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Pending Requests */}
          <Card className="p-5 flex items-center gap-4 hover:shadow-md transition-shadow border-[var(--color-border)] shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text)] leading-none mb-1">{stats.pending_count}</p>
              <p className="text-xs font-medium text-[var(--color-secondary)]">Pending Requests</p>
            </div>
          </Card>

          {/* Approved */}
          <Card className="p-5 flex items-center gap-4 hover:shadow-md transition-shadow border-[var(--color-border)] shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-500 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text)] leading-none mb-1">{stats.approved_this_month}</p>
              <p className="text-xs font-medium text-[var(--color-secondary)]">Approved (This Month)</p>
            </div>
          </Card>

          {/* Declined */}
          <Card className="p-5 flex items-center gap-4 hover:shadow-md transition-shadow border-[var(--color-border)] shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text)] leading-none mb-1">{stats.declined_this_month}</p>
              <p className="text-xs font-medium text-[var(--color-secondary)]">Declined (This Month)</p>
            </div>
          </Card>

          {/* Total Requests */}
          <Card className="p-5 flex items-center gap-4 hover:shadow-md transition-shadow border-[var(--color-border)] shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-portal-light)] text-[var(--color-portal)] shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text)] leading-none mb-1">{stats.total_requests}</p>
              <p className="text-xs font-medium text-[var(--color-secondary)]">Total Requests</p>
            </div>
          </Card>
        </div>

        {/* Recent Pending Requests Section */}
        <Card className="overflow-hidden border-[var(--color-border)] shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
            <h2 className="text-base font-semibold text-[var(--color-text)]">Recent Pending Requests</h2>
            <Link
              href="/tg/requests"
              className="text-sm font-medium text-[var(--color-portal)] hover:text-[var(--color-portal-dark)] hover:underline flex items-center gap-1 transition-colors"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <CardContent className="p-0 divide-y divide-[var(--color-border)]">
            {recentRequests.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-background)] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[var(--color-secondary)] opacity-50" />
                </div>
                <p className="text-sm font-semibold text-[var(--color-text)]">No pending gate pass requests.</p>
                <p className="text-xs text-[var(--color-secondary)] mt-1.5">You are all caught up!</p>
              </div>
            ) : (
              recentRequests.map((req) => {
                const student = Array.isArray(req.students) ? req.students[0] : req.students
                const profile = student ? (Array.isArray(student.profiles) ? student.profiles[0] : student.profiles) : null
                const studentName = profile?.full_name || "Student"
                const studentId = student?.student_id || student?.roll_no || ""

                return (
                  <Link
                    key={req.id}
                    href={`/tg/requests/${req.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-[var(--color-background)] transition-colors group gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[var(--color-portal-light)] text-[var(--color-portal)] font-semibold text-sm shrink-0 ring-1 ring-[var(--color-border)]">
                        {studentName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm text-[var(--color-text)] truncate">{studentName}</p>
                          {studentId && (
                            <span className="text-xs text-[var(--color-secondary)] font-mono bg-[var(--color-background)] px-1.5 py-0.5 rounded-md border border-[var(--color-border)]">
                              {studentId}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--color-secondary)] truncate flex items-center gap-1.5">
                          <span className="font-medium text-[var(--color-text)]">{req.destination}</span> 
                          <span className="text-[var(--color-border)]">•</span>
                          <span>{req.pass_date === req.return_date ? formatDate(req.pass_date) : `${formatDate(req.pass_date)} - ${formatDate(req.return_date)}`}, {formatTime(req.leaving_time)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:ml-4">
                      <StatusBadge status="PENDING" />
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-background)] group-hover:bg-[var(--color-portal-light)] transition-colors hidden sm:flex">
                        <ChevronRight className="w-4 h-4 text-[var(--color-secondary)] group-hover:text-[var(--color-portal)]" />
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
