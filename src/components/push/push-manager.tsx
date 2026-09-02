'use client'

import React, { useState, useEffect } from 'react'
import { savePushSubscription, deletePushSubscription, checkPushSubscription } from '@/app/actions/push'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const base64ToUint8Array = (base64: string) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(b64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function init() {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setIsSupported(true)
        
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          const subscription = await registration.pushManager.getSubscription()
          
          if (subscription) {
            // Check if backend knows about it
            const { subscribed } = await checkPushSubscription(subscription.endpoint)
            setIsSubscribed(subscribed || false)
          } else {
            setIsSubscribed(false)
          }
        } catch (error) {
          console.error('Service Worker registration failed:', error)
          setIsSupported(false)
        }
      }
      setIsLoading(false)
    }

    init()
  }, [])

  const subscribeButtonOnClick = async () => {
    setIsLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready
        const applicationServerKey = base64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        })
        
        const result = await savePushSubscription(JSON.parse(JSON.stringify(subscription)))
        if (result.success) {
          setIsSubscribed(true)
        }
      }
    } catch (error) {
      console.error('Failed to subscribe:', error)
    }
    setIsLoading(false)
  }

  const unsubscribeButtonOnClick = async () => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await deletePushSubscription(subscription.endpoint)
        await subscription.unsubscribe()
        setIsSubscribed(false)
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
    }
    setIsLoading(false)
  }

  if (!isSupported) {
    return null // Graceful degradation
  }

  return (
    <div className="flex items-center">
      {isLoading ? (
        <Button variant="outline" size="sm" disabled className="w-full sm:w-auto">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </Button>
      ) : isSubscribed ? (
        <Button variant="outline" size="sm" onClick={unsubscribeButtonOnClick} className="w-full sm:w-auto text-gray-600 hover:text-red-600">
          <BellOff className="mr-2 h-4 w-4" />
          Disable Push
        </Button>
      ) : (
        <Button variant="primary" size="sm" onClick={subscribeButtonOnClick} className="w-full sm:w-auto bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">
          <Bell className="mr-2 h-4 w-4" />
          Enable Push
        </Button>
      )}
    </div>
  )
}
