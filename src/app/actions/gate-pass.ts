'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createGatePass(formData: FormData) {
  const reason = formData.get('reason') as string
  const destination = formData.get('destination') as string
  const passDate = formData.get('pass_date') as string
  const leavingTime = formData.get('leaving_time') as string
  const returnDate = formData.get('return_date') as string
  const expectedReturnTime = formData.get('expected_return_time') as string
  const additionalInfo = formData.get('additional_info') as string

  // 1. Validate required fields
  if (!reason || !reason.trim() || !destination || !destination.trim() || !passDate || !leavingTime || !returnDate || !expectedReturnTime) {
    return { error: 'Please fill in all required fields.' }
  }

  // 2. Validate time logic server-side
  if (returnDate < passDate) {
    return { error: 'Return date cannot be before the leaving date.' }
  }
  
  if (returnDate === passDate && expectedReturnTime <= leavingTime) {
    return { error: 'Expected return time must be later than leaving time on the same day.' }
  }

  // Basic regex validation to prevent malformed injections crashing the DB
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/
  if (!timeRegex.test(leavingTime) || !timeRegex.test(expectedReturnTime)) {
    return { error: 'Invalid time format.' }
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(passDate)) {
    return { error: 'Invalid date format.' }
  }

  // 3. Authenticate User
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { error: 'You must be logged in to create a gate pass.' }
  }

  // 4. Verify user is a Student
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profileData || profileData.role !== 'student') {
    return { error: 'Only students can create gate passes.' }
  }

  // 5. Look up authoritative student_id and tg_id from public.students
  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .select('id, tg_id')
    .eq('user_id', authData.user.id)
    .single()

  if (studentError || !studentData) {
    return { error: 'Student profile not found. Please contact administration.' }
  }

  // 6. Check if TG is assigned
  if (!studentData.tg_id) {
    return { error: 'No Teacher Guardian is assigned to your account yet. Please contact your college administration.' }
  }

  // 7. Insert the gate pass securely using authenticated client (auth.uid() is respected)
  const { error: insertError } = await supabase.from('gate_passes').insert({
    student_id: studentData.id,
    tg_id: studentData.tg_id,
    reason: reason.trim(),
    destination: destination.trim(),
    pass_date: passDate,
    leaving_time: leavingTime,
    return_date: returnDate,
    expected_return_time: expectedReturnTime,
    additional_info: additionalInfo ? additionalInfo.trim() : null,
    status: 'pending' // Explicitly hardcoded to pending
    // tg_remark is omitted, preserving NULL as required
  })

  if (insertError) {
    console.error('[CreateGatePass] Failed:', {
      message: insertError?.message,
      code: insertError?.code,
      details: insertError?.details,
      hint: insertError?.hint,
      payload: { student_id: studentData.id, reason, passDate, leavingTime, returnDate, expectedReturnTime },
    })
    return { error: 'An unexpected error occurred while submitting your request. Please try again.' }
  }

  // Phase 6B: Trigger Web Push for the TG post-transaction
  try {
    const { sendPushNotificationToUser } = await import('@/lib/push/send-push')
    const { data: actualTg } = await supabase.from('tgs').select('user_id').eq('id', studentData.tg_id).single()
    if (actualTg?.user_id) {
      await sendPushNotificationToUser(actualTg.user_id, {
        title: 'New Gate Pass Request',
        body: 'A student has submitted a new gate pass request.',
        url: '/tg/notifications'
      })
    }
  } catch (err) {
    console.error('Failed to send push notification:', err)
  }

  return { success: true }
}

export async function getStudentGatePasses() {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { error: 'Unauthorized' }
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profileData || profileData.role !== 'student') {
    return { error: 'Unauthorized: Only students can view their passes.' }
  }

  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', authData.user.id)
    .single()

  if (studentError || !studentData) {
    return { error: 'Student profile not found.' }
  }

  // Fetch gate passes using the resolved student_id
  const { data: passes, error: passesError } = await supabase
    .from('gate_passes')
    .select(`
      id,
      reason,
      destination,
      pass_date,
      return_date,
      leaving_time,
      expected_return_time,
      additional_info,
      status,
      tg_remark,
      created_at
    `)
    .eq('student_id', studentData.id)
    .order('created_at', { ascending: false })

  if (passesError) {
    console.error('Failed to fetch gate passes:', passesError)
    return { error: 'An unexpected error occurred while fetching your history.' }
  }

  return { success: true, data: passes }
}

export async function getTgPendingRequests() {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { error: 'Unauthorized' }
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profileData || profileData.role !== 'tg') {
    return { error: 'Unauthorized: Only Teacher Guardians can view assigned requests.' }
  }

  // Authoritatively lookup TG ID from authenticated user
  const { data: tgData, error: tgError } = await supabase
    .from('tgs')
    .select('id')
    .eq('user_id', authData.user.id)
    .single()

  if (tgError || !tgData) {
    return { error: 'Teacher Guardian profile not found.' }
  }

  // Fetch pending gate passes securely restricted to this TG
  const { data: passes, error: passesError } = await supabase
    .from('gate_passes')
    .select(`
      id,
      reason,
      destination,
      pass_date,
      return_date,
      leaving_time,
      expected_return_time,
      additional_info,
      status,
      created_at,
      student_id,
      students (
        id,
        student_id,
        roll_no,
        department,
        year,
        division,
        profiles (
          full_name,
          phone
        )
      )
    `)
    .eq('tg_id', tgData.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (passesError) {
    console.error('Failed to fetch pending requests:', passesError)
    return { error: 'An unexpected error occurred while fetching pending requests.' }
  }

  return { success: true, data: passes }
}

export async function getTgDashboardStats() {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { error: 'Unauthorized' }
  }

  // Authoritatively lookup TG ID
  const { data: tgData, error: tgError } = await supabase
    .from('tgs')
    .select('id')
    .eq('user_id', authData.user.id)
    .single()

  if (tgError || !tgData) {
    return { error: 'Teacher Guardian profile not found.' }
  }

  const tgId = tgData.id

  // Date for 'This Month' logic
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const startOfMonthStr = startOfMonth.toISOString()

  // Execute queries in parallel
  const [
    { count: pendingCount },
    { count: approvedCount },
    { count: declinedCount },
    { count: totalCount },
    { data: recentPending }
  ] = await Promise.all([
    supabase.from('gate_passes').select('*', { count: 'exact', head: true }).eq('tg_id', tgId).eq('status', 'pending'),
    supabase.from('gate_passes').select('*', { count: 'exact', head: true }).eq('tg_id', tgId).eq('status', 'approved').gte('created_at', startOfMonthStr),
    supabase.from('gate_passes').select('*', { count: 'exact', head: true }).eq('tg_id', tgId).eq('status', 'declined').gte('created_at', startOfMonthStr),
    supabase.from('gate_passes').select('*', { count: 'exact', head: true }).eq('tg_id', tgId),
    supabase.from('gate_passes')
      .select(`
        id,
        reason,
        destination,
        pass_date,
        return_date,
        leaving_time,
        expected_return_time,
        status,
        created_at,
        students (
          student_id,
          roll_no,
          profiles ( full_name )
        )
      `)
      .eq('tg_id', tgId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  return {
    success: true,
    data: {
      pending_count: pendingCount || 0,
      approved_this_month: approvedCount || 0,
      declined_this_month: declinedCount || 0,
      total_requests: totalCount || 0,
      recent_pending: recentPending || []
    }
  }
}

export async function getTgAllRequests() {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { error: 'Unauthorized' }
  }

  const { data: tgData, error: tgError } = await supabase
    .from('tgs')
    .select('id')
    .eq('user_id', authData.user.id)
    .single()

  if (tgError || !tgData) {
    return { error: 'Teacher Guardian profile not found.' }
  }

  const { data: passes, error: passesError } = await supabase
    .from('gate_passes')
    .select(`
      id,
      reason,
      destination,
      pass_date,
      return_date,
      leaving_time,
      expected_return_time,
      additional_info,
      status,
      created_at,
      student_id,
      students (
        id,
        student_id,
        roll_no,
        department,
        year,
        division,
        profiles (
          full_name,
          phone
        )
      )
    `)
    .eq('tg_id', tgData.id)
    .order('created_at', { ascending: false })

  if (passesError) {
    console.error('Failed to fetch all requests:', passesError)
    return { error: 'An unexpected error occurred while fetching requests.' }
  }

  return { success: true, data: passes }
}

export async function getTgGatePassDetail(id: string) {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { error: 'Unauthorized' }
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profileData || profileData.role !== 'tg') {
    return { error: 'Unauthorized: Only Teacher Guardians can view this.' }
  }

  const { data: tgData, error: tgError } = await supabase
    .from('tgs')
    .select('id')
    .eq('user_id', authData.user.id)
    .single()

  if (tgError || !tgData) {
    return { error: 'Teacher Guardian profile not found.' }
  }

  const { data: pass, error: passError } = await supabase
    .from('gate_passes')
    .select(`
      id,
      reason,
      destination,
      pass_date,
      return_date,
      leaving_time,
      expected_return_time,
      additional_info,
      status,
      tg_remark,
      created_at,
      student_id,
      students (
        id,
        student_id,
        roll_no,
        department,
        year,
        division,
        profiles (
          full_name,
          phone
        )
      )
    `)
    .eq('id', id)
    .eq('tg_id', tgData.id) // explicitly enforce ownership at application level alongside RLS
    .single()

  if (passError || !pass) {
    // Return a generic error to avoid exposing DB internals for non-existent or unassigned passes
    return { error: 'Gate pass request not found or you are not authorized to view it.' }
  }

  return { success: true, data: pass }
}

export async function reviewGatePass(passId: string, status: 'approved' | 'declined', remark?: string) {
  if (!passId || (status !== 'approved' && status !== 'declined')) {
    return { error: 'Invalid review parameters.' }
  }

  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { error: 'Unauthorized' }
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profileData || profileData.role !== 'tg') {
    return { error: 'Unauthorized: Only Teacher Guardians can review requests.' }
  }

  const { data: tgData, error: tgError } = await supabase
    .from('tgs')
    .select('id')
    .eq('user_id', authData.user.id)
    .single()

  if (tgError || !tgData) {
    return { error: 'Teacher Guardian profile not found.' }
  }

  const sanitizedRemark = status === 'declined' && remark && remark.trim().length > 0 ? remark.trim() : null

  // Atomic Update: Enforces that exactly this TG owns it.
  const { data: updateData, error: updateError } = await supabase
    .from('gate_passes')
    .update({ 
      status: status,
      tg_remark: sanitizedRemark
    })
    .eq('id', passId)
    .eq('tg_id', tgData.id)
    .select('id')

  if (updateError) {
    console.error('Failed to review gate pass:', updateError)
    return { error: 'An unexpected error occurred while saving your review.' }
  }

  // If the query succeeds but updates 0 rows, the array will be empty.
  if (!updateData || updateData.length === 0) {
    return { error: 'This gate pass has already been reviewed or is not assigned to you.' }
  }

  // INSERT NOTIFICATION (Server-side)
  const { data: passData, error: passError } = await supabase.from('gate_passes').select('student_id').eq('id', passId).single()
  
  if (passError || !passData?.student_id) {
    console.error('Failed to find student for gate pass:', passError)
    return { error: 'An unexpected error occurred while retrieving student information for the notification.' }
  }
  
  const { data: actualStudent, error: studentUserError } = await supabase.from('students').select('user_id').eq('id', passData.student_id).single()
  
  if (studentUserError || !actualStudent?.user_id) {
    console.error('Failed to find user ID for student:', studentUserError)
    return { error: 'An unexpected error occurred while locating the student user account.' }
  }

  const notificationTitle = status === 'approved' ? 'Gate Pass Approved' : 'Gate Pass Declined'
  let notificationMessage = status === 'approved' 
    ? 'Your gate pass request has been approved.' 
    : 'Your gate pass request was declined.'
    
  if (status === 'declined' && sanitizedRemark) {
    notificationMessage += ` Remark: ${sanitizedRemark}`
  }

  const adminClient = createAdminClient()
  const { error: notifError } = await adminClient.from('notifications').insert({
    user_id: actualStudent.user_id,
    gate_pass_id: passId,
    type: status,
    title: notificationTitle,
    message: notificationMessage
  })

  if (notifError) {
    console.error('Failed to insert notification:', notifError)
    return { error: 'Failed to create notification. Please contact administration.' }
  }

  // Phase 6B: Trigger Web Push for the Student post-transaction
  try {
    const { sendPushNotificationToUser } = await import('@/lib/push/send-push')
    await sendPushNotificationToUser(actualStudent.user_id, {
      title: notificationTitle,
      body: notificationMessage,
      url: '/student/notifications'
    })
  } catch (err) {
    console.error('Failed to send push notification:', err)
  }

  return { success: true }
}

export async function getStudentGatePassDetail(id: string) {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { error: 'Unauthorized' }
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profileData || profileData.role !== 'student') {
    return { error: 'Unauthorized: Only students can view their passes.' }
  }

  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', authData.user.id)
    .single()

  if (studentError || !studentData) {
    return { error: 'Student profile not found.' }
  }

  const { data: pass, error: passError } = await supabase
    .from('gate_passes')
    .select(`
      id,
      reason,
      destination,
      pass_date,
      return_date,
      leaving_time,
      expected_return_time,
      additional_info,
      status,
      tg_remark,
      created_at,
      student_id,
      tgs (
        profiles (
          full_name
        )
      )
    `)
    .eq('id', id)
    .eq('student_id', studentData.id) // Enforce ownership
    .single()

  if (passError || !pass) {
    return { error: 'Gate pass request not found.' }
  }

  return { success: true, data: pass }
}
