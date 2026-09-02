import React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message: string
}

export function ErrorState({ title = "An error occurred", message, className, ...props }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-rose-50 dark:bg-rose-950/40 p-4 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-start gap-3",
        className
      )}
      {...props}
    >
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-xs mt-0.5 opacity-90">{message}</p>
      </div>
    </div>
  )
}
