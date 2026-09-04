'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function login(formData: FormData) {
  const emailInput = formData.get('email') as string
  const password = formData.get('password') as string

  console.log('[AUTH_TRACE] login attempt:', { rawEmail: emailInput })

  if (!emailInput || !password) {
    return { error: 'Email and password are required' }
  }
  
  const email = emailInput.trim().toLowerCase()
  console.log('[AUTH_TRACE] login normalized email:', email)

  const supabase = await createClient()

  console.log('[AUTH_TRACE] Calling signInWithPassword...')
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log('[AUTH_TRACE] signInWithPassword result:', { 
    hasError: !!error, 
    errorMessage: error?.message,
    hasSession: !!data?.session,
    hasUser: !!data?.user
  })

  if (error) {
    return { error: error.message }
  }
  
  if (!data.session) {
    console.error('[AUTH_TRACE] Login succeeded but no session was returned!')
    return { error: 'Authentication failed. No session created.' }
  }

  // Also trace role lookup if we can, but we don't do role lookup here in this action.
  // Role lookup happens in layout/middleware usually.

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function resetPassword(formData: FormData) {
  const emailInput = formData.get('email') as string
  
  if (!emailInput) {
    return { error: 'Email is required' }
  }
  
  const email = emailInput.trim().toLowerCase()

  const supabase = await createClient()
  
  // We specify a redirect URL assuming this is running on localhost or deployed URL
  // The deployed URL will need to be added to Supabase Redirect URLs
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function studentSignUp(formData: FormData) {
  const emailInput = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('name') as string
  const phone = formData.get('phone') as string
  const studentId = formData.get('studentId') as string
  const rollNo = formData.get('roll') as string
  const department = formData.get('department') as string
  const year = formData.get('year') as string
  const division = formData.get('division') as string
  
  console.log('[AUTH_TRACE] studentSignUp attempt:', { rawEmail: emailInput, studentId })

  if (!emailInput || !password || !fullName || !studentId || !rollNo || !department || !year || !division) {
    return { error: 'Missing required fields' }
  }
  
  const email = emailInput.trim().toLowerCase()
  console.log('[AUTH_TRACE] studentSignUp normalized email:', email)

  const supabase = await createClient()

  console.log('[AUTH_TRACE] Calling signUp for Student...')
  // 1. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  console.log('[AUTH_TRACE] signUp result:', {
    hasError: !!authError,
    errorMessage: authError?.message,
    userId: authData?.user?.id,
    hasSession: !!authData?.session,
    emailConfirmedAt: authData?.user?.email_confirmed_at
  })

  if (authError) {
    return { error: authError.message }
  }
  
  if (!authData.user) {
    console.error('[AUTH_TRACE] signUp succeeded but returned no user object!')
    return { error: 'Failed to create student account.' }
  }

  const adminClient = createAdminClient()
    
  console.log('[AUTH_TRACE] Inserting Student profile for user:', authData.user.id)
  // 2. Insert into profiles using Admin Client
  const { error: profileError } = await adminClient.from('profiles').insert({
    id: authData.user.id,
    role: 'student',
    full_name: fullName,
    email: email,
    phone: phone || null,
  })

  if (profileError) {
    console.error('[AUTH_TRACE] Profile insertion error:', profileError)
    return { error: 'Failed to create student profile. Please try again or contact support.' }
  }

  console.log('[AUTH_TRACE] Inserting students record for user:', authData.user.id)
  // 3. Insert into students table
  const { error: studentError } = await adminClient.from('students').insert({
    user_id: authData.user.id,
    student_id: studentId,
    roll_no: rollNo,
    department: department,
    year: year,
    division: division
  })

  if (studentError) {
    console.error('[AUTH_TRACE] Student insertion error:', studentError)
    if (studentError.code === '23505') {
      return { error: 'A student with this Student ID already exists.' }
    }
    return { error: 'Failed to complete student registration. Please contact support.' }
  }

  console.log('[AUTH_TRACE] Student signup fully successful.')
  return { success: true }
}

export async function tgSignUp(formData: FormData) {
  const emailInput = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('name') as string
  const teacherId = formData.get('teacherId') as string
  const department = formData.get('department') as string
  
  console.log('[AUTH_TRACE] tgSignUp attempt:', { rawEmail: emailInput, teacherId })

  if (!emailInput || !password || !fullName || !teacherId || !department) {
    return { error: 'Missing required fields' }
  }
  
  const email = emailInput.trim().toLowerCase()
  console.log('[AUTH_TRACE] tgSignUp normalized email:', email)

  const supabase = await createClient()

  console.log('[AUTH_TRACE] Calling signUp for TG...')
  // 1. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  console.log('[AUTH_TRACE] signUp result:', {
    hasError: !!authError,
    errorMessage: authError?.message,
    userId: authData?.user?.id,
    hasSession: !!authData?.session,
    emailConfirmedAt: authData?.user?.email_confirmed_at
  })

  if (authError) {
    return { error: authError.message }
  }
  
  if (!authData.user) {
    console.error('[AUTH_TRACE] signUp succeeded but returned no user object!')
    return { error: 'Failed to create TG account.' }
  }

  const adminClient = createAdminClient()
    
  console.log('[AUTH_TRACE] Inserting TG profile for user:', authData.user.id)
  // 2. Insert into profiles using Admin Client to securely set role to 'tg'
  const { error: profileError } = await adminClient.from('profiles').insert({
    id: authData.user.id,
    role: 'tg',
    full_name: fullName,
    email: email,
    phone: null, // TG form doesn't currently ask for phone
  })

  if (profileError) {
    console.error('[AUTH_TRACE] Profile insertion error:', profileError)
    return { error: 'Failed to create TG profile. Please contact support.' }
  }

  console.log('[AUTH_TRACE] Inserting tgs record for user:', authData.user.id)
  // 3. Insert into tgs table
  const { error: tgError } = await adminClient.from('tgs').insert({
    user_id: authData.user.id,
    teacher_id: teacherId,
    department: department
  })

  if (tgError) {
    console.error('[AUTH_TRACE] TG insertion error:', tgError)
    if (tgError.code === '23505') {
      return { error: 'A Teacher with this Teacher ID already exists.' }
    }
    return { error: 'Failed to complete TG registration. Please contact support.' }
  }

  console.log('[AUTH_TRACE] TG signup fully successful.')
  return { success: true }
}
