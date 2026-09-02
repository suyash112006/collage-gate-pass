import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { NotificationList, AppNotification } from '@/components/notifications/notification-list'
import { getNotifications } from '@/app/actions/notifications'

export default async function StudentNotificationsPage() {
  const { data, success } = await getNotifications()
  const notifications = success && data ? data : []

  return (
    <DashboardLayout userRole="STUDENT">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Your Notifications</h1>
          <p className="text-[var(--color-secondary)]">Stay updated on your gate pass requests.</p>
        </div>
        <NotificationList initialNotifications={notifications as unknown as AppNotification[]} role="student" />
      </div>
    </DashboardLayout>
  )
}
