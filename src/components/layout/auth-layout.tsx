import React from "react"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-background)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            {title}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-secondary)]">
            {subtitle}
          </p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[var(--color-surface)] px-4 py-8 shadow-sm sm:rounded-lg sm:px-10 border border-[var(--color-border)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
