'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email) {
    return { error: 'Email is required' }
  }

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
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('name') as string
  const phone = formData.get('phone') as string
  const studentId = formData.get('studentId') as string
  const rollNo = formData.get('roll') as string
  const department = formData.get('department') as string
  const year = formData.get('year') as string
  const division = formData.get('division') as string
  
  if (!email || !password || !fullName || !studentId || !rollNo || !department || !year || !division) {
    return { error: 'Missing required fields' }
  }

  const supabase = await createClient()

  // 1. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (authData.user) {
    const adminClient = createAdminClient()
    
    // 2. Insert into profiles using Admin Client
    const { error: profileError } = await adminClient.from('profiles').insert({
      id: authData.user.id,
      role: 'student',
      full_name: fullName,
      email: email,
      phone: phone || null,
    })

    if (profileError) {
      console.error('Profile insertion error:', profileError)
      return { error: 'Failed to create student profile. Please try again or contact support.' }
    }

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
      console.error('Student insertion error:', studentError)
      if (studentError.code === '23505') {
        return { error: 'A student with this Student ID already exists.' }
      }
      return { error: 'Failed to complete student registration. Please contact support.' }
    }
  }

  return { success: true }
}

export async function tgSignUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('name') as string
  const teacherId = formData.get('teacherId') as string
  const department = formData.get('department') as string
  
  if (!email || !password || !fullName || !teacherId || !department) {
    return { error: 'Missing required fields' }
  }

  const supabase = await createClient()

  // 1. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (authData.user) {
    const adminClient = createAdminClient()
    
    // 2. Insert into profiles using Admin Client to securely set role to 'tg'
    const { error: profileError } = await adminClient.from('profiles').insert({
      id: authData.user.id,
      role: 'tg',
      full_name: fullName,
      email: email,
      phone: null, // TG form doesn't currently ask for phone
    })

    if (profileError) {
      console.error('Profile insertion error:', profileError)
      return { error: 'Failed to create TG profile. Please contact support.' }
    }

    // 3. Insert into tgs table
    const { error: tgError } = await adminClient.from('tgs').insert({
      user_id: authData.user.id,
      teacher_id: teacherId,
      department: department
    })

    if (tgError) {
      console.error('TG insertion error:', tgError)
      if (tgError.code === '23505') {
        return { error: 'A Teacher with this Teacher ID already exists.' }
      }
      return { error: 'Failed to complete TG registration. Please contact support.' }
    }
  }

  return { success: true }
}
