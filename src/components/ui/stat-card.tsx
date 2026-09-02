import React from "react"
import { cn } from "@/lib/utils"
import { Card } from "./card"
import { Clock, CheckCircle2, XCircle, FileText } from "lucide-react"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: "pending" | "approved" | "declined" | "total"
  value: number | string
  label: string
  description?: string
  icon?: React.ReactNode
}

export function StatCard({ variant, value, label, description, icon, className, ...props }: StatCardProps) {
  const variantStyles = {
    pending: {
      bg: "bg-amber-100 dark:bg-amber-950/40",
      text: "text-amber-600 dark:text-amber-400",
      defaultIcon: <Clock className="w-6 h-6" />,
    },
    approved: {
      bg: "bg-emerald-100 dark:bg-emerald-950/40",
      text: "text-emerald-600 dark:text-emerald-400",
      defaultIcon: <CheckCircle2 className="w-6 h-6" />,
    },
    declined: {
      bg: "bg-rose-100 dark:bg-rose-950/40",
      text: "text-rose-600 dark:text-rose-400",
      defaultIcon: <XCircle className="w-6 h-6" />,
    },
    total: {
      bg: "bg-blue-100 dark:bg-blue-950/40",
      text: "text-blue-600 dark:text-blue-400",
      defaultIcon: <FileText className="w-6 h-6" />,
    },
  }

  const style = variantStyles[variant]

  return (
    <Card className={cn("p-4 flex items-center gap-4 hover:shadow-md transition-shadow", className)} {...props}>
      <div className={cn("flex items-center justify-center w-12 h-12 rounded-xl shrink-0", style.bg, style.text)}>
        {icon || style.defaultIcon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-[var(--color-text)] tracking-tight">{value}</p>
        <p className="text-xs font-medium text-[var(--color-secondary)] truncate">{label}</p>
        {description && (
          <p className="text-[0.6875rem] text-[var(--color-secondary)] opacity-80 truncate">{description}</p>
        )}
      </div>
    </Card>
  )
}
