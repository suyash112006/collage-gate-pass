import React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Shield, GraduationCap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/actions/auth"

export default async function UnauthorizedPage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    redirect("/")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single()

  const role = profile?.role

  if (!role) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border/50 text-center">
          <div className="mx-auto w-16 h-16 bg-[var(--color-declined)]/10 rounded-full flex items-center justify-center text-[var(--color-declined)] mb-4">
            {role === "tg" ? <Shield className="w-8 h-8" /> : <GraduationCap className="w-8 h-8" />}
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)] mb-2">
            Wrong Portal
          </h2>
          
          <p className="text-sm text-[var(--color-secondary)] mb-6">
            {role === "tg" 
              ? "You are currently signed in as a Teacher Guardian. This page is only available to students."
              : "You are currently signed in as a Student. This page is only available to Teacher Guardians."
            }
          </p>

          <div className="space-y-3">
            <a href={role === "tg" ? "/tg/dashboard" : "/student/dashboard"} className="block w-full">
              <Button className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
                Go to {role === "tg" ? "Teacher Guardian" : "Student"} Portal
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
            
            <form action={logout}>
              <Button variant="outline" type="submit" className="w-full">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
