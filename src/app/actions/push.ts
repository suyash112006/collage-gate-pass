'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'

type PushSubscriptionData = {
  endpoint: string
  keys: {
    auth: string
    p256dh: string
  }
}

export async function savePushSubscription(subscription: PushSubscriptionData) {
  // Input validation
  if (!subscription || typeof subscription !== 'object') {
    return { error: 'Invalid subscription data' }
  }

  const { endpoint, keys } = subscription

  if (!endpoint || typeof endpoint !== 'string' || endpoint.length > 2048 || !endpoint.startsWith('https://')) {
    return { error: 'Invalid subscription endpoint' }
  }

  if (!keys || typeof keys !== 'object') {
    return { error: 'Invalid subscription keys' }
  }

  if (typeof subscription.keys.auth !== 'string' || subscription.keys.auth.length === 0 || subscription.keys.auth.length > 512 ||
    typeof subscription.keys.p256dh !== 'string' || subscription.keys.p256dh.length === 0 || subscription.keys.p256dh.length > 512) {
    return { error: 'Invalid keys structure' }
  }

  const supabase = await createClient()

  // 1. Ensure user is authenticated
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { error: 'Unauthorized' }
  }

  // UPSERT the subscription
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: authData.user.id, // Strictly derived from auth
      endpoint: endpoint,
      auth_key: keys.auth,
      p256dh_key: keys.p256dh,
      updated_at: new Date().toISOString()
    }, { onConflict: 'endpoint' })

  if (error) {
    console.error('Failed to save push subscription:', error)
    return { error: 'Failed to save subscription' }
  }

  return { success: true }
}

export async function deletePushSubscription(endpoint: string) {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', authData.user.id)
    .eq('endpoint', endpoint)

  if (error) {
    console.error('Failed to delete push subscription:', error)
    return { error: 'Failed to delete subscription' }
  }

  return { success: true }
}

export async function checkPushSubscription(endpoint: string) {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { subscribed: false }
  }

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('user_id', authData.user.id)
    .eq('endpoint', endpoint)
    .single()

  if (error || !data) {
    return { subscribed: false }
  }

  return { subscribed: true }
}


