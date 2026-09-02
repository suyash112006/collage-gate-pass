import React from "react"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string | null
  src?: string | null
  size?: "sm" | "md" | "lg"
}

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return ""
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({ name, src, size = "md", className, ...props }: AvatarProps) {
  const initials = getInitials(name)

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-[var(--color-portal-light)] text-[var(--color-portal)] font-semibold border border-[var(--color-border)] overflow-hidden shrink-0 select-none",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        // Standard img tag to prevent remote origin errors if external avatar source is provided
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name || "User avatar"} className="w-full h-full object-cover" />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <User className="w-1/2 h-1/2" />
      )}
    </div>
  )
}
