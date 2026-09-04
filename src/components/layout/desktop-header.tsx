"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, User, LogOut, Settings } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { NotificationBell } from "@/components/notifications/notification-bell"

interface DesktopHeaderProps {
  userRole: "STUDENT" | "TG"
  unreadCount: number
  userName: string
  onLogout: () => void
}

export function DesktopHeader({ userRole, unreadCount, userName, onLogout }: DesktopHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const roleLabel = userRole === "STUDENT" ? "Student" : "Teacher Guardian"
  const profileHref = userRole === "STUDENT" ? "/student/profile" : "/tg/profile"
  const settingsHref = userRole === "STUDENT" ? "/student/settings" : "/tg/settings"

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="hidden lg:flex fixed top-0 right-0 left-60 h-[5.5rem] bg-[var(--color-surface)] border-b border-[var(--color-border)] z-20 items-center justify-end px-8">
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <NotificationBell initialUnreadCount={unreadCount} />

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-[var(--color-border)]"></div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 hover:bg-[var(--color-background)] py-1.5 px-2 pr-3 rounded-full border border-[var(--color-border)] transition-all duration-200 text-left shadow-sm hover:shadow-md"
          >
            <Avatar name={userName} size="md" className="w-9 h-9" />
            <div className="hidden xl:block">
              <p className="text-sm font-bold text-[var(--color-text)] leading-tight">{userName}</p>
              <p className="text-xs text-[var(--color-secondary)] mt-0.5">{roleLabel}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-[var(--color-secondary)] ml-1 hidden xl:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--color-surface)] rounded-xl shadow-lg border border-[var(--color-border)] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-[var(--color-border)] xl:hidden">
                <p className="text-sm font-semibold text-[var(--color-text)] truncate">{userName}</p>
                <p className="text-xs text-[var(--color-secondary)]">{roleLabel}</p>
              </div>
              <Link
                href={profileHref}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-background)]"
              >
                <User className="w-4 h-4 text-[var(--color-secondary)]" />
                Profile
              </Link>
              <Link
                href={settingsHref}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-background)]"
              >
                <Settings className="w-4 h-4 text-[var(--color-secondary)]" />
                Settings
              </Link>
              <div className="h-px bg-[var(--color-border)] my-1.5"></div>
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  onLogout()
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
