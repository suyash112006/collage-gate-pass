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
    <Card className={cn("text-center py-12 px-4", className)} {...props}>
      <CardContent className="flex flex-col items-center justify-center p-0">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-portal-light)] text-[var(--color-portal)] mb-3">
          {icon || <FileText className="w-6 h-6 opacity-80" />}
        </div>
        <h3 className="text-base font-semibold text-[var(--color-text)]">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-[var(--color-secondary)] max-w-sm">{description}</p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </CardContent>
    </Card>
  )
}
