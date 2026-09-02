import React from "react"
import { cn } from "@/lib/utils"

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "PENDING" | "APPROVED" | "DECLINED"
}

export const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const statusConfig = {
      PENDING: {
        label: "Pending",
        className: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        icon: (
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        ),
      },
      APPROVED: {
        label: "Approved",
        className: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        icon: (
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
        ),
      },
      DECLINED: {
        label: "Declined",
        className: "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
        icon: (
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        ),
      },
    }

    const config = statusConfig[status]

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors shrink-0 select-none",
          config.className,
          className
        )}
        {...props}
      >
        {config.icon}
        {config.label}
      </div>
    )
  }
)
StatusBadge.displayName = "StatusBadge"
