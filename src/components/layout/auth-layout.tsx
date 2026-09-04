import React from "react"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      {/* Subtle background orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Back to home */}
        <div className="text-center">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-secondary)] hover:text-[var(--color-portal)] transition-colors mb-6">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to home
          </a>
        </div>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            {title}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-secondary)]">
            {subtitle}
          </p>
        </div>

        {/* Form Card */}
        <div className="auth-card">
          {children}
        </div>
      </div>
    </div>
  )
}
