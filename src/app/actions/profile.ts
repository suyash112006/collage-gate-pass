"use server"

import { createClient, getAuthUser } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateStudentProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()

  if (authError || !authData.user) {
    return { error: "Not authenticated" }
  }

  const phone = formData.get("phone") as string
  const department = formData.get("department") as string
  const year = formData.get("year") as string
  const division = formData.get("division") as string
  const full_name = formData.get("full_name") as string
  const email = formData.get("email") as string
  const student_id = formData.get("student_id") as string
  const roll_no = formData.get("roll_no") as string

  try {
    // 1. Update profiles table (phone, full_name, email)
    const profileUpdate: Record<string, string> = {}
    if (phone !== null) profileUpdate.phone = phone
    if (full_name) profileUpdate.full_name = full_name
    if (email) profileUpdate.email = email

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", authData.user.id)
      
      if (profileError) throw profileError
    }

    // 1.5 Update auth email if it changed (this might require confirmation depending on Supabase settings)
    if (email && email !== authData.user.email) {
      const { error: authUpdateError } = await supabase.auth.updateUser({ email })
      if (authUpdateError) throw authUpdateError
    }

    // 2. Update students table (department, year, division, student_id, roll_no)
    const updateData: Record<string, string> = {}
    if (department) updateData.department = department
    if (year) updateData.year = year
    if (division) updateData.division = division
    if (student_id) updateData.student_id = student_id
    if (roll_no) updateData.roll_no = roll_no

    if (Object.keys(updateData).length > 0) {
      const { error: studentError } = await supabase
        .from("students")
        .update(updateData)
        .eq("user_id", authData.user.id)
      
      if (studentError) throw studentError
    }

    revalidatePath("/student/profile")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error as Error).message || "Failed to update profile" }
  }
}
