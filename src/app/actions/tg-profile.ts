"use server"

import { createClient, getAuthUser } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateTgProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: authData, error: authError } = await getAuthUser()
  
  if (authError || !authData.user) {
    return { error: "Authentication required" }
  }

  const phone = formData.get("phone") as string
  const full_name = formData.get("full_name") as string

  try {
    if (phone !== null || full_name !== null) {
      const updateData: { phone?: string; full_name?: string } = {}
      if (phone !== null) updateData.phone = phone
      if (full_name !== null) updateData.full_name = full_name

      if (Object.keys(updateData).length > 0) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", authData.user.id)
        
        if (profileError) throw profileError
      }
    }

    const teacher_id = formData.get("teacher_id") as string
    const department = formData.get("department") as string

    if (teacher_id !== null || department !== null) {
      const tgUpdate: { teacher_id?: string; department?: string } = {}
      if (teacher_id !== null) tgUpdate.teacher_id = teacher_id
      if (department !== null) tgUpdate.department = department

      if (Object.keys(tgUpdate).length > 0) {
        const { error: tgError } = await supabase
          .from("tgs")
          .update(tgUpdate)
          .eq("user_id", authData.user.id)
        
        if (tgError) throw tgError
      }
    }

    revalidatePath("/tg/profile")
    return { success: true }
  } catch (error: unknown) {
    console.error("Error updating TG profile:", error)
    return { error: (error as Error).message || "Failed to update profile" }
  }
}
