"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/ui/status-badge"
import { Clock, MapPin, FileText, Calendar, ChevronRight, Search, Filter } from "lucide-react"

type ProfileData = {
  full_name: string
  phone?: string
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

export type GatePassRequest = {
  id: string
  reason: string
  destination: string
  pass_date: string
  return_date: string
  leaving_time: string
  expected_return_time: string
  status: string
  created_at: string
  student_id: string
  students: StudentData | StudentData[] | null
}

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "declined", label: "Declined" },
]

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

export function TgRequestsClient({ initialRequests }: { initialRequests: GatePassRequest[] }) {
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")

  // Build tab counts
  const tabsWithCounts = STATUS_TABS.map((tab) => ({
    ...tab,
    count: tab.id === "all"
      ? initialRequests.length
      : initialRequests.filter((r) => r.status === tab.id).length,
  }))

  const filteredRequests = useMemo(() => {
    return initialRequests.filter(req => {
      // 1. Status Filter
      if (activeTab !== "all" && req.status !== activeTab) return false

      // 2. Search Filter
      if (searchQuery.trim() !== "") {
        const student = Array.isArray(req.students) ? req.students[0] : req.students
        const profile = student ? (Array.isArray(student.profiles) ? student.profiles[0] : student.profiles) : null
        const studentName = (profile?.full_name || "").toLowerCase()
        const studentId = (student?.student_id || student?.roll_no || "").toLowerCase()
        const query = searchQuery.toLowerCase()

        if (
          !studentName.includes(query) &&
          !studentId.includes(query) &&
          !req.destination.toLowerCase().includes(query) &&
          !req.reason.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      return true
    })
  }, [initialRequests, activeTab, searchQuery])

  return (
    <div className="space-y-6">
      {/* Tabs + Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          items={tabsWithCounts}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="w-full sm:w-auto"
        />

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-secondary)]" />
            <input
              type="text"
              placeholder="Search by name, ID or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-portal-ring)] text-[var(--color-text)] placeholder:text-[var(--color-secondary)]"
            />
          </div>
          <button className="flex items-center justify-center w-10 h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-secondary)] hover:bg-[var(--color-background)] transition-colors shrink-0">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filteredRequests.length === 0 ? (
        <Card className="text-center py-16 border-[var(--color-border)] shadow-sm">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-[var(--color-background)] flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-[var(--color-secondary)] opacity-50" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-text)]">No requests found</h3>
            <p className="mt-1.5 text-sm text-[var(--color-secondary)]">
              {searchQuery
                ? "Try adjusting your search criteria."
                : `There are no ${activeTab === "all" ? "" : activeTab + " "}gate pass requests.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const student = Array.isArray(req.students) ? req.students[0] : req.students
            const profile = student ? (Array.isArray(student.profiles) ? student.profiles[0] : student.profiles) : null
            const studentName = profile?.full_name || "Unknown Student"
            const studentId = student?.student_id || student?.roll_no || "N/A"
            const department = student?.department || "General"
            const studentClass = student ? `${student.year} Year / Div ${student.division}` : ""

            return (
              <Card key={req.id} className="overflow-hidden hover:shadow-md transition-all border-[var(--color-border)] shadow-sm group">
                <div className="p-5">
                  {/* Student Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-portal-light)] text-[var(--color-portal)] font-bold text-base shrink-0 ring-1 ring-[var(--color-border)]">
                        {studentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-[var(--color-text)] leading-tight mb-1">
                          {studentName}
                        </h3>
                        <p className="text-xs text-[var(--color-secondary)] flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono bg-[var(--color-background)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
                            {studentId}
                          </span>
                          <span>•</span>
                          <span>{department} ({studentClass})</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <StatusBadge status={req.status.toUpperCase() as "PENDING" | "APPROVED" | "DECLINED"} />
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-7 h-7 rounded-lg bg-[var(--color-background)] flex items-center justify-center shrink-0 border border-[var(--color-border)]">
                        <MapPin className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-secondary)] font-medium mb-0.5">Destination</p>
                        <p className="font-semibold text-sm text-[var(--color-text)] leading-tight">{req.destination}</p>
                        <p className="text-xs text-[var(--color-secondary)] line-clamp-1 mt-0.5">{req.reason}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-7 h-7 rounded-lg bg-[var(--color-background)] flex items-center justify-center shrink-0 border border-[var(--color-border)]">
                        <Calendar className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-secondary)] font-medium mb-0.5">Pass Date</p>
                        <p className="font-semibold text-sm text-[var(--color-text)] leading-tight">
                          {req.pass_date === req.return_date ? formatDate(req.pass_date) : `${formatDate(req.pass_date)} - ${formatDate(req.return_date)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-7 h-7 rounded-lg bg-[var(--color-background)] flex items-center justify-center shrink-0 border border-[var(--color-border)]">
                        <Clock className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-secondary)] font-medium mb-0.5">Time Window</p>
                        <p className="font-semibold text-sm text-[var(--color-text)] leading-tight">
                          {formatTime(req.leaving_time)} – {formatTime(req.expected_return_time)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                    <span className="text-xs text-[var(--color-secondary)] font-medium">
                      Submitted: {formatDate(req.created_at)}
                    </span>
                    <Link
                      href={`/tg/requests/${req.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-portal)] hover:bg-[var(--color-portal-dark)] text-white text-xs font-semibold transition-colors shadow-sm"
                    >
                      View Request
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
