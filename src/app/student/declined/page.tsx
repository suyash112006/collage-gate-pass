"use client"

import React from "react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DeclinedPage() {
  const router = useRouter()

  return (
    <AuthLayout title="Request Declined" subtitle="Access Denied">
      <div className="text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-[var(--color-secondary)]">
          Your account request has been declined by your Teacher Guardian. You cannot access the student portal.
        </p>
        <Button onClick={() => router.push('/student/login')} className="w-full" variant="outline">
          Back to Login
        </Button>
      </div>
    </AuthLayout>
  )
}
