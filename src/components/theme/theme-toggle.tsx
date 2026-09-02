'use client'

import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme, useIsMounted } from './theme-provider'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const mounted = useIsMounted()

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] opacity-50 ${className}`} />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-portal-light)] hover:text-[var(--color-portal)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-portal-ring)] ${className}`}
      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4.5 h-4.5 text-amber-400 transition-transform duration-200" />
      ) : (
        <Moon className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300 transition-transform duration-200" />
      )}
    </button>
  )
}
