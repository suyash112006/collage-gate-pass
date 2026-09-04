import React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./card"
import { FileText } from "lucide-react"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ title, description, icon, action, className, ...props }: EmptyStateProps) {
  return (
    <Card className={cn("text-center py-14 px-6", className)} {...props}>
      <CardContent className="flex flex-col items-center justify-center p-0">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-portal-light)] text-[var(--color-portal)] mb-4 shadow-sm">
          {icon || <FileText className="w-6 h-6 opacity-80" />}
        </div>
        <h3 className="text-base font-semibold text-[var(--color-text)]">{title}</h3>
        {description && (
          <p className="mt-1.5 text-sm text-[var(--color-secondary)] max-w-sm leading-relaxed">{description}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </CardContent>
    </Card>
  )
}
