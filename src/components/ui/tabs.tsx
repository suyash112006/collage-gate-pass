"use client"

import React from "react"
import { cn } from "@/lib/utils"

export interface TabItem {
  id: string
  label: string
  count?: number
}

export interface TabsProps {
  items: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ items, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex items-center gap-1 border-b border-[var(--color-border)] pb-2 overflow-x-auto no-scrollbar", className)}>
      {items.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            type="button"
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer flex items-center gap-1.5",
              isActive
                ? "bg-[var(--color-portal-light)] text-[var(--color-portal)] font-semibold shadow-xs"
                : "text-[var(--color-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[0.625rem] font-bold",
                  isActive
                    ? "bg-[var(--color-portal)] text-white"
                    : "bg-[var(--color-border)] text-[var(--color-secondary)]"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
