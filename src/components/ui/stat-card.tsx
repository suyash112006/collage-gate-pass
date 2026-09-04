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
      bg: "bg-amber-50 dark:bg-amber-500/10",
      text: "text-amber-500",
      defaultIcon: <Clock className="w-6 h-6" />,
    },
    approved: {
      bg: "bg-green-50 dark:bg-green-500/10",
      text: "text-green-500",
      defaultIcon: <CheckCircle2 className="w-6 h-6" />,
    },
    declined: {
      bg: "bg-red-50 dark:bg-red-500/10",
      text: "text-red-500",
      defaultIcon: <XCircle className="w-6 h-6" />,
    },
    total: {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      text: "text-blue-500",
      defaultIcon: <FileText className="w-6 h-6" />,
    },
  }

  const style = variantStyles[variant]

  return (
    <Card className={cn("p-5 flex items-center gap-4 hover:shadow-md transition-shadow border-[var(--color-border)] shadow-sm", className)} {...props}>
      <div className={cn("flex items-center justify-center w-12 h-12 rounded-xl shrink-0", style.bg, style.text)}>
        {icon || style.defaultIcon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--color-text)] leading-none mb-1">{value}</p>
        <p className="text-xs font-medium text-[var(--color-secondary)]">{label}</p>
        {description && (
          <p className="text-[0.6875rem] text-[var(--color-muted)] truncate">{description}</p>
        )}
      </div>
    </Card>
  )
}
