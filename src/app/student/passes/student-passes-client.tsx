"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Tabs, TabItem } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { MapPin, Clock, Calendar, ChevronRight, FilePlus, FileText } from "lucide-react"

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

export function StudentPassesClient({ initialPasses }: { initialPasses: GatePass[] }) {
  const [activeTab, setActiveTab] = useState<string>("all")

  const pendingCount = initialPasses.filter(p => p.status === 'pending').length
  const approvedCount = initialPasses.filter(p => p.status === 'approved').length
  const declinedCount = initialPasses.filter(p => p.status === 'declined').length

  const tabs: TabItem[] = [
    { id: "all", label: "All", count: initialPasses.length },
    { id: "pending", label: "Pending", count: pendingCount },
    { id: "approved", label: "Approved", count: approvedCount },
    { id: "declined", label: "Declined", count: declinedCount },
  ]

  const filteredPasses = initialPasses.filter(p => {
    if (activeTab === "all") return true
    return p.status === activeTab
  })

  return (
    <div className="space-y-6">
      {/* Category Tabs — Matching Reference Image 3 */}
      <Tabs items={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {filteredPasses.length === 0 ? (
        <EmptyState
          title="No gate passes found"
          description={
            activeTab === "all"
              ? "You haven't submitted any gate pass requests yet."
              : `You don't have any ${activeTab} gate passes.`
          }
          icon={<FileText className="w-6 h-6 opacity-60" />}
          action={
            <Link
              href="/student/create-pass"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-portal)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <FilePlus className="w-4 h-4" /> Apply New Pass
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-[var(--color-border)]">
            {filteredPasses.map((pass) => (
              <Link
                key={pass.id}
                href={`/student/passes/${pass.id}`}
                className="flex items-center justify-between p-5 hover:bg-[var(--color-portal-light)] transition-colors group"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full items-center">
                  {/* Destination & Reason */}
                  <div className="md:col-span-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--color-text)] truncate">{pass.reason}</p>
                    <p className="text-xs text-[var(--color-secondary)] flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-[var(--color-portal)] shrink-0" />
                      {pass.destination}
                    </p>
                  </div>

                  {/* Pass Date */}
                  <div className="md:col-span-1 text-xs text-[var(--color-secondary)]">
                    <p className="font-medium text-[var(--color-text)] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[var(--color-secondary)] shrink-0" />
                      {pass.pass_date === pass.return_date ? formatDate(pass.pass_date) : `${formatDate(pass.pass_date)} - ${formatDate(pass.return_date)}`}
                    </p>
                  </div>

                  {/* Time Window */}
                  <div className="md:col-span-1 text-xs text-[var(--color-secondary)]">
                    <p className="font-medium text-[var(--color-text)] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--color-secondary)] shrink-0" />
                      {formatTime(pass.leaving_time)} - {formatTime(pass.expected_return_time)}
                    </p>
                  </div>

                  {/* Status & Chevron Action */}
                  <div className="md:col-span-1 flex items-center justify-between md:justify-end gap-3">
                    <StatusBadge status={pass.status.toUpperCase() as "PENDING" | "APPROVED" | "DECLINED"} />
                    <ChevronRight className="w-4 h-4 text-[var(--color-secondary)] group-hover:text-[var(--color-portal)] transition-colors shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
