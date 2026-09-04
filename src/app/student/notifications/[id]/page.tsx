import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, UserCheck } from 'lucide-react'
import Link from 'next/link'

type Props = {
  params: Promise<{ id: string }>
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export default async function NotificationDetailPage(props: Props) {
  const params = await props.params
  const { id } = params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/student/login')
  }

  // Verify notification belongs to the user
  const { data: notification, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !notification) {
    notFound()
  }

  // Mark as read if unread
  if (!notification.is_read) {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
  }

  // Get TG Name via Admin Client to bypass any RLS complications
  let tgName = 'Your Teacher Guardian'
  if (notification.student_id) {
    const adminClient = createAdminClient()
    const { data: studentData } = await adminClient
      .from('students')
      .select('tg_id, status')
      .eq('id', notification.student_id)
      .single()

    if (studentData?.tg_id) {
      const { data: tgData } = await adminClient
        .from('tgs')
        .select('user_id')
        .eq('id', studentData.tg_id)
        .single()
        
      if (tgData?.user_id) {
        const { data: profileData } = await adminClient
          .from('profiles')
          .select('full_name')
          .eq('id', tgData.user_id)
          .single()
          
        if (profileData?.full_name) {
          tgName = profileData.full_name
        }
      }
    }
  }

  const getTypeDetails = (type: string) => {
    switch (type) {
      case 'account_blocked':
        return {
          title: 'Account Blocked',
          icon: <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />,
          heading: 'Your account has been blocked',
          message: 'Your Teacher Guardian has blocked your Student Portal account.',
          status: 'BLOCKED',
          statusColor: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30',
          nextSteps: 'You cannot access the Student Portal while your account is blocked. Contact your Teacher Guardian or college administration if you believe this was done by mistake.',
          showLogin: false,
        }
      case 'account_unblocked':
        return {
          title: 'Account Unblocked',
          icon: <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />,
          heading: 'Your account has been unblocked',
          message: 'Your Teacher Guardian has restored access to your Student Portal account.',
          status: 'APPROVED / ACTIVE',
          statusColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
          nextSteps: 'Your account is available again. You must log in again to access the Student Portal.',
          showLogin: true,
        }
      case 'account_approved':
        return {
          title: 'Account Approved',
          icon: <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />,
          heading: 'Your account has been approved',
          message: 'Your Teacher Guardian has approved your account request.',
          status: 'APPROVED',
          statusColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
          nextSteps: 'You now have full access to the Student Portal. You can start creating gate pass requests.',
          showLogin: false,
        }
      case 'account_declined':
        return {
          title: 'Request Declined',
          icon: <XCircle className="w-12 h-12 text-rose-500 mx-auto" />,
          heading: 'Your account request was declined',
          message: 'Your Teacher Guardian has declined your account registration request.',
          status: 'DECLINED',
          statusColor: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30',
          nextSteps: 'Your request for a Student Portal account has been rejected. Please contact your Teacher Guardian directly to resolve this issue.',
          showLogin: false,
        }
      case 'account_under_review':
        return {
          title: 'Account Under Review',
          icon: <UserCheck className="w-12 h-12 text-amber-500 mx-auto" />,
          heading: 'Your account is under review',
          message: 'Your account has been submitted to your Teacher Guardian for approval.',
          status: 'UNDER REVIEW',
          statusColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
          nextSteps: 'You will receive another notification once your account is approved. You cannot access the dashboard until approved.',
          showLogin: false,
        }
      default:
        return {
          title: notification.title,
          icon: <AlertTriangle className="w-12 h-12 text-blue-500 mx-auto" />,
          heading: notification.title,
          message: notification.message,
          status: 'SYSTEM',
          statusColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
          nextSteps: 'Please retain this notification for your records.',
          showLogin: false,
        }
    }
  }

  const details = getTypeDetails(notification.type)

  return (
    <DashboardLayout userRole="STUDENT">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Link 
            href="/student/notifications" 
            className="inline-flex items-center text-sm font-medium text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Notifications
          </Link>
        </div>

        <Card className="overflow-hidden border-[var(--color-border)] shadow-sm">
          <CardHeader className="text-center pb-2 pt-8">
            <div className="mb-4">
              {details.icon}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
              {details.heading}
            </h2>
            <p className="text-[var(--color-secondary)] mt-2">
              {details.message}
            </p>
          </CardHeader>
          
          <CardContent className="pt-6 pb-8 px-6 sm:px-10">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)] overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4">
                <div className="text-sm font-medium text-[var(--color-secondary)]">Teacher Guardian</div>
                <div className="sm:col-span-2 text-sm font-semibold text-[var(--color-text)]">{tgName}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4">
                <div className="text-sm font-medium text-[var(--color-secondary)]">Action</div>
                <div className="sm:col-span-2 text-sm font-medium text-[var(--color-text)]">{details.title}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4">
                <div className="text-sm font-medium text-[var(--color-secondary)]">Date & Time</div>
                <div className="sm:col-span-2 text-sm text-[var(--color-text)]">{formatDate(notification.created_at)}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4 items-center">
                <div className="text-sm font-medium text-[var(--color-secondary)]">Status</div>
                <div className="sm:col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${details.statusColor}`}>
                    {details.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center px-4">
              <p className="text-sm text-[var(--color-secondary)] leading-relaxed">
                {details.nextSteps}
              </p>
            </div>
          </CardContent>

          {details.showLogin && (
            <CardFooter className="bg-[var(--color-portal-light)]/20 border-t border-[var(--color-border)] p-6 flex justify-center">
              <Link 
                href="/student/login"
                className="inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-portal-ring)] focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 cursor-pointer bg-[var(--color-portal)] text-white hover:bg-[var(--color-portal-dark)] border border-transparent shadow-sm hover:shadow-md px-8 py-2.5 text-sm"
              >
                Go to Student Login
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
