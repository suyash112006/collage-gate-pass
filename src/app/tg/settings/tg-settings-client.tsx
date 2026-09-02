"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { PushManager } from "@/components/push/push-manager"
import { resetPassword } from "@/app/actions/auth"
import { Settings, KeyRound, Bell, Shield, Check } from "lucide-react"

export function TgSettingsClient() {
  const [activeSection, setActiveSection] = useState<'general' | 'password' | 'notifications' | 'privacy'>('general')
  
  // General settings state
  const [language, setLanguage] = useState("English")
  const [timeZone, setTimeZone] = useState("(GMT+05:30) Asia/Kolkata")
  const [dateFormat, setDateFormat] = useState("DD MMM YYYY")
  const [timeFormat, setTimeFormat] = useState("12 Hour")
  const [savedGeneral, setSavedGeneral] = useState(false)

  // Password reset state
  const [resetEmail, setResetEmail] = useState("")
  const [resetStatus, setResetStatus] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedGeneral(true)
    setTimeout(() => setSavedGeneral(false), 3000)
  }

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setResetStatus(null)
    setIsResetting(true)
    const formData = new FormData(e.currentTarget)
    const res = await resetPassword(formData)
    setIsResetting(false)
    if (res.error) {
      setResetStatus(`Error: ${res.error}`)
    } else {
      setResetStatus("Password reset link has been sent to your email address.")
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Settings Navigation Menu */}
      <div className="md:col-span-1">
        <Card className="p-2 space-y-1">
          <button
            onClick={() => setActiveSection('general')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeSection === 'general'
                ? 'bg-[var(--color-portal-light)] text-[var(--color-portal)] font-semibold'
                : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>General</span>
          </button>

          <button
            onClick={() => setActiveSection('password')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeSection === 'password'
                ? 'bg-[var(--color-portal-light)] text-[var(--color-portal)] font-semibold'
                : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Password</span>
          </button>

          <button
            onClick={() => setActiveSection('notifications')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeSection === 'notifications'
                ? 'bg-[var(--color-portal-light)] text-[var(--color-portal)] font-semibold'
                : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveSection('privacy')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeSection === 'privacy'
                ? 'bg-[var(--color-portal-light)] text-[var(--color-portal)] font-semibold'
                : 'text-[var(--color-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy</span>
          </button>
        </Card>
      </div>

      {/* Settings Content Area */}
      <div className="md:col-span-3">
        {activeSection === 'general' && (
          <Card>
            <CardHeader className="border-b border-[var(--color-border)] py-4">
              <CardTitle className="text-sm font-semibold text-[var(--color-text)]">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveGeneral} className="space-y-4">
                {savedGeneral && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>General preferences saved.</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="language" className="text-xs font-semibold">Language</Label>
                  <Select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="timezone" className="text-xs font-semibold">Time Zone</Label>
                  <Select id="timezone" value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
                    <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                    <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dateformat" className="text-xs font-semibold">Date Format</Label>
                    <Select id="dateformat" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                      <option value="DD MMM YYYY">DD MMM YYYY (e.g. 20 May 2025)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2025-05-20)</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="timeformat" className="text-xs font-semibold">Time Format</Label>
                    <Select id="timeformat" value={timeFormat} onChange={(e) => setTimeFormat(e.target.value)}>
                      <option value="12 Hour">12 Hour (10:00 AM)</option>
                      <option value="24 Hour">24 Hour (10:00)</option>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex justify-end">
                  <Button type="submit" size="sm">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeSection === 'password' && (
          <Card>
            <CardHeader className="border-b border-[var(--color-border)] py-4">
              <CardTitle className="text-sm font-semibold text-[var(--color-text)]">Password & Security</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <p className="text-xs text-[var(--color-secondary)]">
                  Enter your registered account email address to receive a secure password reset link via Supabase Auth.
                </p>

                {resetStatus && (
                  <div className={`p-3 rounded-lg text-xs ${
                    resetStatus.startsWith('Error')
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {resetStatus}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">Account Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="teacher@college.edu"
                    disabled={isResetting}
                  />
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex justify-end">
                  <Button type="submit" size="sm" isLoading={isResetting} disabled={isResetting}>
                    Send Reset Link
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeSection === 'notifications' && (
          <Card>
            <CardHeader className="border-b border-[var(--color-border)] py-4">
              <CardTitle className="text-sm font-semibold text-[var(--color-text)]">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-xs text-[var(--color-secondary)]">
                Configure your Web Push notification subscription for instant gate pass status updates.
              </p>
              <div className="p-4 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]">
                <PushManager />
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'privacy' && (
          <Card>
            <CardHeader className="border-b border-[var(--color-border)] py-4">
              <CardTitle className="text-sm font-semibold text-[var(--color-text)]">Privacy Policy & Security</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3 text-xs text-[var(--color-secondary)]">
              <p>
                Your gate pass data and personal information are protected by strict Row Level Security (RLS) policies within the college database.
              </p>
              <p>
                Gate pass requests are accessible strictly to you and your assigned Students.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
