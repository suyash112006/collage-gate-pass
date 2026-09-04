"use client"

import React from "react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function UnderReviewPage() {
  const router = useRouter()

  return (
    <AuthLayout title="Account Under Review" subtitle="Teacher Guardian Approval Required">
      <div className="text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
          <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-[var(--color-secondary)]">
          Your account has been created successfully. Your Teacher Guardian is reviewing your request. You will get access once your request is approved.
        </p>
        <Button onClick={() => router.push('/student/login')} className="w-full" variant="outline">
          Back to Login
        </Button>
      </div>
    </AuthLayout>
  )
}
