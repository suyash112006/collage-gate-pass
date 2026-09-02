"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  X,
  LayoutDashboard,
  FilePlus,
  FileText,
  Bell,
  User,
  Settings,
  LogOut,
  ClipboardList,
  GraduationCap,
  Shield,
  QrCode
} from "lucide-react"
import { PushManager } from "@/components/push/push-manager"

interface MobileDrawerProps {
  userRole: "STUDENT" | "TG"
  unreadCount: number
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
}

const studentNavItems = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Create Gate Pass", href: "/student/create-pass", icon: FilePlus },
  { label: "My Gate Passes", href: "/student/passes", icon: FileText },
  { label: "Notifications", href: "/student/notifications", icon: Bell, badge: true },
  { label: "Profile", href: "/student/profile", icon: User },
  { label: "Settings", href: "/student/settings", icon: Settings },
]

const tgNavItems = [
  { label: "Dashboard", href: "/tg/dashboard", icon: LayoutDashboard },
  { label: "Requests", href: "/tg/requests", icon: ClipboardList },

  { label: "Access", href: "/tg/access", icon: QrCode },
  { label: "Notifications", href: "/tg/notifications", icon: Bell, badge: true },
  { label: "Profile", href: "/tg/profile", icon: User },
  { label: "Settings", href: "/tg/settings", icon: Settings },
]

export function MobileDrawer({ userRole, unreadCount, isOpen, onClose, onLogout }: MobileDrawerProps) {
  const pathname = usePathname()
  const navItems = userRole === "STUDENT" ? studentNavItems : tgNavItems
  const portalLabel = userRole === "STUDENT" ? "Student Portal" : "TG Portal"
  const roleLabel = userRole === "STUDENT" ? "Student" : "Teacher Guardian"
  const PortalIcon = userRole === "STUDENT" ? GraduationCap : Shield

  // Close drawer on route change
  useEffect(() => {
    onClose()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Navigation menu">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--color-portal)] text-white shadow-sm">
              <PortalIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-[var(--color-text)] leading-tight">{portalLabel}</p>
              <p className="text-xs text-[var(--color-secondary)]">{roleLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--color-secondary)] hover:bg-[var(--color-background)] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/student/dashboard" && item.href !== "/tg/dashboard" && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
                {item.badge && unreadCount > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Push Manager */}
        <div className="px-5 py-3 border-t border-[var(--color-border)]">
          <PushManager />
        </div>

        {/* Logout */}
        <div className="px-4 py-3 border-t border-[var(--color-border)] pb-safe">
          <button
            onClick={onLogout}
            className="sidebar-nav-item w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}
