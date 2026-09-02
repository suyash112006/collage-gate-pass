import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { NotificationList, AppNotification } from '@/components/notifications/notification-list'
import { getNotifications } from '@/app/actions/notifications'

export default async function TgNotificationsPage() {
  const { data, success } = await getNotifications()
  const notifications = success && data ? data : []

  return (
    <DashboardLayout userRole="TG">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Notifications</h1>
          <p className="text-[var(--color-secondary)]">Updates on your assigned student requests.</p>
        </div>
        <NotificationList initialNotifications={notifications as unknown as AppNotification[]} role="tg" />
      </div>
    </DashboardLayout>
  )
}
