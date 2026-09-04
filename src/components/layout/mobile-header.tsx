"use client"

import { Menu, GraduationCap, Shield } from "lucide-react"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { NotificationBell } from "@/components/notifications/notification-bell"

interface MobileHeaderProps {
  userRole: "STUDENT" | "TG"
  unreadCount: number
  onMenuOpen: () => void
}

export function MobileHeader({ userRole, unreadCount, onMenuOpen }: MobileHeaderProps) {
  const portalLabel = userRole === "STUDENT" ? "Student Portal" : "TG Portal"
  const PortalIcon = userRole === "STUDENT" ? GraduationCap : Shield

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)] h-14 transition-colors duration-200">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Hamburger + Portal name */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuOpen}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-[var(--color-text)] hover:bg-[var(--color-portal-light)] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[var(--color-portal)] text-white shadow-sm">
              <PortalIcon className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-sm text-[var(--color-text)]">{portalLabel}</span>
          </div>
        </div>

        {/* Right: Theme Toggle + Notification bell */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell initialUnreadCount={unreadCount} />
        </div>
      </div>
    </header>
  )
}
