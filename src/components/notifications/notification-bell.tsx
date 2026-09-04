"use client"

import React, { useState, useEffect, useRef } from "react"
import { Bell, CheckCheck } from "lucide-react"
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/notifications"
import { useRouter } from "next/navigation"

type Notification = {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export function NotificationBell({ initialUnreadCount = 0 }: { initialUnreadCount?: number }) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Poll for unread count every 30 seconds
    const interval = setInterval(async () => {
      const res = await getUnreadNotificationCount()
      if (res.success) {
        setUnreadCount(res.count)
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleDropdown = async () => {
    const nextIsOpen = !isOpen
    setIsOpen(nextIsOpen)
    
    if (nextIsOpen) {
      setIsLoading(true)
      const res = await getNotifications()
      if (res.success && res.data) {
        setNotifications(res.data)
      }
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id)
    }
    setIsOpen(false)
    
    // Route based on type
    if (['new_student_request'].includes(notification.type)) {
      router.push('/tg/students')
    } else if (['account_under_review', 'account_approved', 'account_declined', 'account_blocked', 'account_unblocked'].includes(notification.type)) {
      router.push('/student/dashboard')
    } else if (['new_request'].includes(notification.type)) {
      router.push('/tg/requests')
    } else if (['approved', 'declined'].includes(notification.type)) {
      router.push('/student/passes')
    }
  }

  function formatRelativeTime(dateString: string) {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    const daysDifference = Math.round((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (daysDifference === 0) {
      const minutesDifference = Math.round((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60))
      if (minutesDifference > -60) {
        return rtf.format(minutesDifference, 'minute')
      }
      return rtf.format(Math.round(minutesDifference / 60), 'hour')
    }
    return rtf.format(daysDifference, 'day')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative p-2 text-[var(--color-secondary)] hover:text-[var(--color-text)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-portal)] focus:border-transparent rounded-full"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[1.125rem] h-4.5 px-1 text-[0.65rem] font-bold text-white bg-red-500 rounded-full shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text)]">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-[var(--color-portal)] hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-6 text-[var(--color-secondary)]">
                <span className="animate-pulse">Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="w-8 h-8 text-[var(--color-secondary)] opacity-40 mb-2" />
                <p className="text-sm text-[var(--color-secondary)]">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-4 hover:bg-[var(--color-portal-light)] transition-colors cursor-pointer ${!notif.is_read ? 'bg-amber-500/5' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm font-semibold truncate ${!notif.is_read ? 'text-[var(--color-text)]' : 'text-[var(--color-secondary)]'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-[var(--color-secondary)] whitespace-nowrap ml-2">
                            {formatRelativeTime(notif.created_at)}
                          </span>
                        </div>
                        <p className={`text-xs ${!notif.is_read ? 'text-[var(--color-text)] opacity-90' : 'text-[var(--color-secondary)]'} line-clamp-2`}>
                          {notif.message}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="flex-shrink-0 self-center">
                          <div className="w-2 h-2 bg-[var(--color-portal)] rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
