import 'server-only'

import webpush from 'web-push'

if (!process.env.VAPID_SUBJECT || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  throw new Error('Missing VAPID configuration. Web push notifications cannot be sent without VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY, and VAPID_PRIVATE_KEY in the environment.')
}

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export async function sendPushNotificationToUser(userId: string, payload: { title: string, body: string, url: string }) {
  if (!userId) return

  // Need a service-role client to fetch ANY user's subscriptions
  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: subscriptions, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (error || !subscriptions || subscriptions.length === 0) {
    return
  }

  const pushPayload = JSON.stringify(payload)

  const sendPromises = subscriptions.map(async (sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        auth: sub.auth_key,
        p256dh: sub.p256dh_key
      }
    }

    try {
      await webpush.sendNotification(pushSubscription, pushPayload)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'statusCode' in err) {
        const statusCode = (err as { statusCode: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          // Subscription has expired or is no longer valid, delete it
          await supabaseAdmin
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
          return
        }
      }
      console.error('Push notification failed:', err)
    }
  })

  await Promise.all(sendPromises)
}
