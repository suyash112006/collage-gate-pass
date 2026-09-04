"use client"

import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { MobileHeader } from "./mobile-header"
import { MobileNav } from "./mobile-nav"
import { MobileDrawer } from "./mobile-drawer"
import { DesktopHeader } from "./desktop-header"
import { logout } from "@/app/actions/auth"
import { StudentRealtimeSync } from "@/components/realtime/student-realtime-sync"

interface DashboardShellProps {
  children: React.ReactNode
  userRole: "STUDENT" | "TG"
  unreadCount: number
  userName?: string
}

export function DashboardShell({ children, userRole, unreadCount, userName = "User" }: DashboardShellProps) {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const portalClass = userRole === "STUDENT" ? "portal-student" : "portal-tg"

  const handleLogout = useCallback(async () => {
    await logout()
    router.push(userRole === "STUDENT" ? "/student/login" : "/tg/login")
  }, [router, userRole])

  return (
    <div className={`min-h-screen bg-[var(--color-background)] ${portalClass}`}>
      {userRole === "STUDENT" && <StudentRealtimeSync />}
      
      {/* Desktop Sidebar */}
      <Sidebar
        userRole={userRole}
        unreadCount={unreadCount}
        onLogout={handleLogout}
      />

      {/* Desktop Top Header */}
      <DesktopHeader
        userRole={userRole}
        unreadCount={unreadCount}
        userName={userName}
        onLogout={handleLogout}
      />

      {/* Mobile Header */}
      <MobileHeader
        userRole={userRole}
        unreadCount={unreadCount}
        onMenuOpen={() => setDrawerOpen(true)}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        userRole={userRole}
        unreadCount={unreadCount}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="lg:pl-60 pt-14 lg:pt-[5.5rem] main-content-with-mobile-nav">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav
        userRole={userRole}
        unreadCount={unreadCount}
      />
    </div>
  )
}
