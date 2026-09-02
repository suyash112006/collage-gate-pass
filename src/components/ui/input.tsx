import React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  rightElement?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, rightElement, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          className={cn(
            "flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input)] px-3.5 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-portal-ring)] focus:border-[var(--color-portal)] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[var(--color-declined)] focus:ring-[var(--color-declined)]",
            rightElement && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"
