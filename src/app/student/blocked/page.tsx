"use client"

import React from "react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function BlockedPage() {
  const router = useRouter()

  return (
    <AuthLayout title="Account Blocked" subtitle="Access Denied">
      <div className="text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-[var(--color-secondary)]">
          Your account has been blocked by your Teacher Guardian. Please contact your Teacher Guardian or college administration.
        </p>
        <Button onClick={() => window.location.replace('/student/login')} className="w-full" variant="outline">
          Back to Login
        </Button>
      </div>
    </AuthLayout>
  )
}
