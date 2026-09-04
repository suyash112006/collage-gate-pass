'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

async function notifyStudent(studentId: string, type: string, title: string, message: string) {
  const adminClient = createAdminClient();
  const { data: student } = await adminClient.from('students').select('user_id').eq('id', studentId).single();
  if (student?.user_id) {
    await adminClient.from('notifications').insert({
      user_id: student.user_id,
      student_id: studentId,
      type: type,
      title: title,
      message: message
    });
  }
}

// Note: RLS ensures TGs can only update their own students (WHERE tg_id = their_tg_id)

export async function approveStudent(studentId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('students')
    .update({ status: 'APPROVED' })
    .eq('id', studentId)

  if (error) {
    console.error('Error approving student:', error)
    return { error: 'Failed to approve student.' }
  }

  await notifyStudent(studentId, 'account_approved', 'Account Approved', 'Your Teacher Guardian has approved your account. You can now access the Student Portal.');

  revalidatePath('/tg/students')
  revalidatePath('/tg/dashboard')
  return { success: true }
}

export async function declineStudent(studentId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('students')
    .update({ status: 'DECLINED' })
    .eq('id', studentId)

  if (error) {
    console.error('Error declining student:', error)
    return { error: 'Failed to decline student.' }
  }

  await notifyStudent(studentId, 'account_declined', 'Request Declined', 'Your Teacher Guardian has declined your account request.');

  revalidatePath('/tg/students')
  revalidatePath('/tg/dashboard')
  return { success: true }
}

export async function blockStudent(studentId: string) {
  const supabase = await createClient()

  const { error, data: studentData } = await supabase
    .from('students')
    .update({ status: 'BLOCKED' })
    .eq('id', studentId)
    .select('user_id')
    .single()

  if (error) {
    console.error('Error blocking student:', error)
    return { error: 'Failed to block student.' }
  }

  // Revoke all active sessions so the student is immediately blocked
  // and will be forced to log in again if later unblocked.
  if (studentData?.user_id) {
    const adminClient = createAdminClient()
    await adminClient.auth.admin.signOut(studentData.user_id, 'global')
  }

  await notifyStudent(studentId, 'account_blocked', 'Account Blocked', 'Your student account has been blocked by your Teacher Guardian.');

  revalidatePath('/tg/students')
  revalidatePath('/tg/dashboard')
  return { success: true }
}

export async function unblockStudent(studentId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('students')
    .update({ status: 'APPROVED' })
    .eq('id', studentId)

  if (error) {
    console.error('Error unblocking student:', error)
    return { error: 'Failed to unblock student.' }
  }

  await notifyStudent(studentId, 'account_unblocked', 'Account Unblocked', 'Your student account has been unblocked. Please log in again to continue.');

  revalidatePath('/tg/students')
  revalidatePath('/tg/dashboard')
  return { success: true }
}
