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
  ClipboardList
} from "lucide-react"

interface MobileNavProps {
  userRole: "STUDENT" | "TG"
  unreadCount: number
}

const studentTabs = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Create Pass", href: "/student/create-pass", icon: FilePlus },
  { label: "My Passes", href: "/student/passes", icon: FileText },
  { label: "Notifications", href: "/student/notifications", icon: Bell, badge: true },
  { label: "Profile", href: "/student/profile", icon: User },
]

const tgTabs = [
  { label: "Dashboard", href: "/tg/dashboard", icon: LayoutDashboard },
  { label: "Requests", href: "/tg/requests", icon: ClipboardList },

  { label: "Notifications", href: "/tg/notifications", icon: Bell, badge: true },
  { label: "Profile", href: "/tg/profile", icon: User },
]

export function MobileNav({ userRole, unreadCount }: MobileNavProps) {
  const pathname = usePathname()
  const tabs = userRole === "STUDENT" ? studentTabs : tgTabs

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      <div className="flex items-stretch h-[4.5rem] pb-[env(safe-area-inset-bottom,0px)]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/student/dashboard" && tab.href !== "/tg/dashboard" && pathname.startsWith(tab.href))
          const Icon = tab.icon
          return (
            <Link key={tab.href} href={tab.href} className={`mobile-nav-item ${isActive ? "active" : ""}`}>
              <div className="relative mb-1">
                <Icon className="w-5 h-5" />
                {tab.badge && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 inline-flex items-center justify-center min-w-[1rem] h-4 px-1 text-[0.625rem] font-bold text-white bg-red-500 rounded-full shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="truncate">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
