'use client'

import React, { useState, useTransition } from 'react'
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/app/actions/notifications'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCheck, Bell, Clock, AlertCircle, FileText, ArrowRight, Check, X } from 'lucide-react'

export type AppNotification = {
  id: string
  gate_pass_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export function NotificationList({ initialNotifications, role }: { initialNotifications: AppNotification[], role: 'student' | 'tg' }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications)
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'requests' | 'system'>('all')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const unreadCount = notifications.filter(n => !n.is_read).length

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.is_read
    if (activeTab === 'requests') return n.type === 'new_request' || n.type === 'approved' || n.type === 'declined'
    if (activeTab === 'system') return n.type === 'system'
    return true
  })

  const handleMarkAsRead = (n: AppNotification) => {
    setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, is_read: true } : notif))
    
    startTransition(async () => {
      await markNotificationAsRead(n.id)
      router.refresh()
      
      const accountTypes = ['account_blocked', 'account_unblocked', 'account_approved', 'account_declined', 'account_under_review']
      
      if (role === 'student') {
        if (accountTypes.includes(n.type)) {
          router.push(`/student/notifications/${n.id}`)
        } else {
          router.push(`/student/passes/${n.gate_pass_id}`)
        }
      } else {
        if (n.type === 'new_student_request') {
          router.push(`/tg/students`)
        } else {
          router.push(`/tg/requests/${n.gate_pass_id}`)
        }
      }
    })
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))

    startTransition(async () => {
      await markAllNotificationsAsRead()
      router.refresh()
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approved':
      case 'account_approved':
        return (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_10px_rgba(52,211,153,0.3)] flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
        )
      case 'declined':
      case 'account_declined':
        return (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 shadow-[0_0_10px_rgba(244,63,94,0.3)] flex items-center justify-center shrink-0">
            <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
        )
      case 'new_request':
      case 'new_student_request':
        return <div className="p-1 rounded-full"><FileText className="w-5 h-5 text-blue-500" /></div>
      default:
        return <div className="p-1 rounded-full"><AlertCircle className="w-5 h-5 text-amber-500" /></div>
    }
  }

  return (
    <div className="space-y-4">
      {/* Category Tabs — Matching Reference Image 4 */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-[var(--color-portal-light)] text-[var(--color-portal)] font-semibold'
                : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'unread'
                ? 'bg-[var(--color-portal-light)] text-[var(--color-portal)] font-semibold'
                : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'requests'
                ? 'bg-[var(--color-portal-light)] text-[var(--color-portal)] font-semibold'
                : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            Requests
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'system'
                ? 'bg-[var(--color-portal-light)] text-[var(--color-portal)] font-semibold'
                : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            System
          </button>
        </div>

        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllAsRead} 
            disabled={isPending}
            className="text-xs h-8 px-2.5"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Bell className="h-10 w-10 text-[var(--color-secondary)] opacity-40 mb-3" />
            <h3 className="text-base font-semibold text-[var(--color-text)]">No notifications found</h3>
            <p className="text-xs text-[var(--color-secondary)] mt-1">There are no notifications in this category.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-[var(--color-border)]">
            {filteredNotifications.map((n) => (
              <li 
                key={n.id} 
                className={`group p-4 hover:bg-[var(--color-portal-light)] transition-colors cursor-pointer flex items-start gap-3.5 ${
                  !n.is_read ? 'bg-amber-500/5' : ''
                }`}
                onClick={() => handleMarkAsRead(n)}
              >
                <div className="shrink-0 mt-0.5 border border-transparent">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold truncate ${!n.is_read ? 'text-[var(--color-text)]' : 'text-[var(--color-secondary)]'}`}>
                      {n.title}
                    </p>
                    <span className="text-[0.6875rem] text-[var(--color-secondary)] shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(n.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-secondary)] mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0 mt-0.5">
                  <ArrowRight className="w-4 h-4 text-[var(--color-secondary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-[var(--color-portal)]" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
