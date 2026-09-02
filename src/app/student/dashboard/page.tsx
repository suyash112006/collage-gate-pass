import React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { getStudentGatePasses } from "@/app/actions/gate-pass"
import { createClient, getAuthUser } from "@/lib/supabase/server"
import Link from "next/link"
import { FilePlus, ChevronRight, MapPin } from "lucide-react"

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

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const { data: authData } = await getAuthUser()

  let studentName = "Student"
  if (authData?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', authData.user.id)
      .single()
    if (profile?.full_name) {
      studentName = profile.full_name.replace(/^Test\s+/i, '')
    }
  }

  const result = await getStudentGatePasses()
  const passes: GatePass[] = (result.success && result.data) ? (result.data as unknown as GatePass[]) : []

  // Dynamic calculations from real Supabase data
  const totalCount = passes.length
  const approvedCount = passes.filter(p => p.status === 'approved').length
  const pendingCount = passes.filter(p => p.status === 'pending').length
  const declinedCount = passes.filter(p => p.status === 'declined').length

  const recentPasses = passes.slice(0, 5)

  return (
    <DashboardLayout userRole="STUDENT">
      <div className="space-y-6">
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] flex items-center gap-2">
              Hi, {studentName} <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-sm text-[var(--color-secondary)] mt-1">
              Welcome back! Here&apos;s what&apos;s happening with your gate passes.
            </p>
          </div>
          <Link
            href="/student/create-pass"
            className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-opacity bg-[var(--color-portal)] text-white shadow-sm hover:opacity-90 h-10 px-4 py-2 shrink-0"
          >
            <FilePlus className="w-4 h-4" />
            <span>Apply New Pass</span>
          </Link>
        </div>

        {/* 4 Stat Cards Grid — matching Reference Image 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            variant="total"
            value={totalCount}
            label="Total Passes"
            description="All time"
          />
          <StatCard
            variant="approved"
            value={approvedCount}
            label="Approved"
            description="All time"
          />
          <StatCard
            variant="pending"
            value={pendingCount}
            label="Pending"
            description="Currently"
          />
          <StatCard
            variant="declined"
            value={declinedCount}
            label="Declined"
            description="All time"
          />
        </div>

        {/* Recent Passes List */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-base font-semibold text-[var(--color-text)]">Recent Passes</h2>
            <Link
              href="/student/passes"
              className="text-xs font-semibold text-[var(--color-portal)] hover:underline flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <CardContent className="p-0">
            {recentPasses.length === 0 ? (
              <EmptyState
                title="No gate passes submitted"
                description="Apply for your first gate pass request using the Apply New Pass button above."
                action={
                  <Link
                    href="/student/create-pass"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-portal)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <FilePlus className="w-4 h-4" /> Apply Gate Pass
                  </Link>
                }
              />
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {recentPasses.map((pass) => (
                  <Link
                    key={pass.id}
                    href={`/student/passes/${pass.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-[var(--color-portal-light)] transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-background)] text-[var(--color-secondary)] font-semibold text-sm shrink-0">
                        <MapPin className="w-5 h-5 text-[var(--color-portal)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[var(--color-text)] truncate">{pass.reason}</p>
                        <p className="text-xs text-[var(--color-secondary)] truncate mt-0.5">
                          <span className="font-medium text-[var(--color-text)]">{pass.destination}</span> • {pass.pass_date === pass.return_date ? formatDate(pass.pass_date) : `${formatDate(pass.pass_date)} - ${formatDate(pass.return_date)}`}, {formatTime(pass.leaving_time)} - {formatTime(pass.expected_return_time)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <StatusBadge status={pass.status.toUpperCase() as "PENDING" | "APPROVED" | "DECLINED"} />
                      <ChevronRight className="w-4 h-4 text-[var(--color-secondary)] group-hover:text-[var(--color-portal)] transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
