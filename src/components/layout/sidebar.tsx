"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Bell,
  User,
  Users,
  Settings,
  LogOut,
  ClipboardList,
  GraduationCap,
  Shield,
  QrCode
} from "lucide-react"
import { PushManager } from "@/components/push/push-manager"
import { ThemeToggle } from "@/components/theme/theme-toggle"

interface SidebarProps {
  userRole: "STUDENT" | "TG"
  unreadCount: number
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
  { label: "Student Management", href: "/tg/students", icon: Users },
  { label: "Requests", href: "/tg/requests", icon: ClipboardList },

  { label: "Access", href: "/tg/access", icon: QrCode },
  { label: "Notifications", href: "/tg/notifications", icon: Bell, badge: true },
  { label: "Profile", href: "/tg/profile", icon: User },
  { label: "Settings", href: "/tg/settings", icon: Settings },
]

export function Sidebar({ userRole, unreadCount, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const navItems = userRole === "STUDENT" ? studentNavItems : tgNavItems
  const portalLabel = userRole === "STUDENT" ? "Student Portal" : "TG Portal"
  const PortalIcon = userRole === "STUDENT" ? GraduationCap : Shield

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] z-30 transition-colors duration-200">
      {/* Portal Branding */}
      <div className="flex items-center justify-between px-5 h-[5.5rem] border-b border-[var(--color-border)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-portal)] to-[var(--color-portal-dark)] text-white shadow-sm">
            <PortalIcon className="w-5 h-5" />
          </div>
          <span className="font-bold text-[var(--color-text)] text-[0.9375rem] tracking-tight">{portalLabel}</span>
        </div>
        <ThemeToggle />
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
              <span className="truncate">{item.label}</span>
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
      <div className="px-4 py-3 border-t border-[var(--color-border)]">
        <PushManager />
      </div>

      {/* Logout */}
      <div className="px-4 py-3 border-t border-[var(--color-border)] pb-6">
        <button
          onClick={onLogout}
          className="sidebar-nav-item w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 border border-[var(--color-border)]"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
