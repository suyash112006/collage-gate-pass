import React from "react"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "PENDING" | "APPROVED" | "DECLINED"
}

export const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const statusConfig = {
      PENDING: {
        label: "Pending",
        containerClassName: "bg-amber-100 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 px-2.5 py-1 gap-1.5",
        iconContainerClassName: "",
        icon: <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />,
        textClassName: "text-amber-700 dark:text-amber-400",
      },
      APPROVED: {
        label: "Approved",
        containerClassName: "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 py-1 pl-1 pr-3 gap-2",
        iconContainerClassName: "w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_10px_rgba(52,211,153,0.3)] flex items-center justify-center rounded-full shrink-0",
        icon: <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />,
        textClassName: "text-slate-900 dark:text-slate-100 font-semibold",
      },
      DECLINED: {
        label: "Declined",
        containerClassName: "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 py-1 pl-1 pr-3 gap-2",
        iconContainerClassName: "w-6 h-6 bg-gradient-to-br from-rose-500 to-pink-500 shadow-[0_0_10px_rgba(244,63,94,0.3)] flex items-center justify-center rounded-full shrink-0",
        icon: <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />,
        textClassName: "text-slate-900 dark:text-slate-100 font-semibold",
      },
    }

    const config = statusConfig[status]

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border text-xs transition-colors shrink-0 select-none",
          config.containerClassName,
          className
        )}
        {...props}
      >
        {config.iconContainerClassName ? (
          <div className={config.iconContainerClassName}>
            {config.icon}
          </div>
        ) : (
          config.icon
        )}
        <span className={config.textClassName}>
          {config.label}
        </span>
      </div>
    )
  }
)
StatusBadge.displayName = "StatusBadge"
