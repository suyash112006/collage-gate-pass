'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'

export async function getUnreadNotificationCount() {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { error: 'Unauthorized', count: 0 }
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', authData.user.id)
    .eq('is_read', false)

  if (error) {
    console.error('Failed to fetch unread notification count:', error)
    return { error: 'Failed to fetch count', count: 0 }
  }

  return { success: true, count: count || 0 }
}

export async function getNotifications() {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { error: 'Unauthorized' }
  }

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', authData.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Failed to fetch notifications:', error)
    return { error: 'Failed to fetch notifications' }
  }

  return { success: true, data: notifications }
}

export async function markNotificationAsRead(notificationId: string) {
  if (!notificationId) {
    return { error: 'Invalid notification ID' }
  }

  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { error: 'Unauthorized' }
  }

  // Update only the notification matching the ID and authenticated user's ID
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', authData.user.id)
    .select('id')

  if (error) {
    console.error('Failed to mark notification as read:', error)
    return { error: 'Failed to update notification' }
  }

  if (!data || data.length === 0) {
    return { error: 'Notification not found or unauthorized' }
  }

  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', authData.user.id)
    .eq('is_read', false)

  if (error) {
    console.error('Failed to mark all notifications as read:', error)
    return { error: 'Failed to update notifications' }
  }

  return { success: true }
}
