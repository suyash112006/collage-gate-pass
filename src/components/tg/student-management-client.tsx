"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { approveStudent, declineStudent, blockStudent, unblockStudent } from "@/app/actions/tg"
import { UserCheck, UserX, Clock } from "lucide-react"

type Student = {
  id: string
  student_id: string
  department: string
  year: string
  status: string
  created_at: string
  full_name: string
  email: string
}

export function StudentManagementClient({ initialStudents }: { initialStudents: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'blocked'>('pending')
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const pending = students.filter(s => s.status === 'UNDER_REVIEW')
  const active = students.filter(s => s.status === 'APPROVED')
  const blocked = students.filter(s => s.status === 'BLOCKED')

  const handleAction = async (studentId: string, action: 'approve' | 'decline' | 'block' | 'unblock') => {
    if (action === 'block') {
      if (!window.confirm("Block this student? This student will immediately lose access to the Student Portal.")) {
        return
      }
    }
    
    setIsProcessing(studentId)
    
    try {
      if (action === 'approve') {
        await approveStudent(studentId)
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'APPROVED' } : s))
      }
      if (action === 'decline') {
        await declineStudent(studentId)
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'DECLINED' } : s))
      }
      if (action === 'block') {
        await blockStudent(studentId)
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'BLOCKED' } : s))
      }
      if (action === 'unblock') {
        await unblockStudent(studentId)
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'APPROVED' } : s))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessing(null)
    }
  }

  function formatDate(dateString: string) {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          variant="pending"
          value={pending.length}
          label="Pending Requests"
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          variant="approved"
          value={active.length}
          label="Active Students"
          icon={<UserCheck className="w-5 h-5" />}
        />
        <StatCard
          variant="declined"
          value={blocked.length}
          label="Blocked Students"
          icon={<UserX className="w-5 h-5" />}
        />
      </div>

      <div className="flex border-b border-[var(--color-border)]">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending' ? 'border-[var(--color-portal)] text-[var(--color-portal)]' : 'border-transparent text-[var(--color-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'}`}
        >
          Pending Requests
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active' ? 'border-[var(--color-portal)] text-[var(--color-portal)]' : 'border-transparent text-[var(--color-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'}`}
        >
          My Students
        </button>
        <button
          onClick={() => setActiveTab('blocked')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'blocked' ? 'border-[var(--color-portal)] text-[var(--color-portal)]' : 'border-transparent text-[var(--color-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'}`}
        >
          Blocked
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          {activeTab === 'pending' && (
            pending.length === 0 ? (
              <EmptyState title="No pending requests" description="You have no pending student approval requests." />
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {pending.map(s => (
                  <div key={s.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-[var(--color-text)]">{s.full_name}</h3>
                      <p className="text-sm text-[var(--color-secondary)] mt-1">Student ID: {s.student_id} • {s.email}</p>
                      <p className="text-xs text-[var(--color-secondary)] mt-1">Requested On: {formatDate(s.created_at)}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="rounded-md border" onClick={() => handleAction(s.id, 'decline')} isLoading={isProcessing === s.id} disabled={isProcessing !== null}>
                        {isProcessing === s.id ? 'DECLINING...' : 'DECLINE'}
                      </Button>
                      <Button size="sm" className="rounded-md border border-transparent" onClick={() => handleAction(s.id, 'approve')} isLoading={isProcessing === s.id} disabled={isProcessing !== null}>
                        {isProcessing === s.id ? 'APPROVING...' : 'APPROVE'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'active' && (
            active.length === 0 ? (
              <EmptyState title="No active students" description="You do not have any approved students assigned to you." />
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {active.map(s => (
                  <div key={s.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--color-portal-light)]/30 transition-colors">
                    <div>
                      <h3 className="font-semibold text-[var(--color-text)]">{s.full_name}</h3>
                      <p className="text-sm text-[var(--color-secondary)] mt-1">Student ID: {s.student_id} • {s.department}, {s.year}</p>
                    </div>
                    <div className="shrink-0">
                      <Button variant="outline" className="text-[var(--color-declined)] hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-300 rounded-md border" size="sm" onClick={() => handleAction(s.id, 'block')} isLoading={isProcessing === s.id} disabled={isProcessing !== null}>
                        {isProcessing === s.id ? 'BLOCKING...' : 'BLOCK'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'blocked' && (
            blocked.length === 0 ? (
              <EmptyState title="No blocked students" description="You have not blocked any students." />
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {blocked.map(s => (
                  <div key={s.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-500 line-through dark:text-gray-400">{s.full_name}</h3>
                      <p className="text-sm text-gray-400 mt-1">Student ID: {s.student_id}</p>
                    </div>
                    <div className="shrink-0">
                      <Button variant="outline" size="sm" className="rounded-md border" onClick={() => handleAction(s.id, 'unblock')} isLoading={isProcessing === s.id} disabled={isProcessing !== null}>
                        {isProcessing === s.id ? 'UNBLOCKING...' : 'UNBLOCK'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}
