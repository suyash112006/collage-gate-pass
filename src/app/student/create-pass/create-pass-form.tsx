"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ErrorState } from "@/components/ui/error-state"
import { createGatePass } from "@/app/actions/gate-pass"
import { User, MapPin, Calendar, Clock, FileText, Send } from "lucide-react"

type StudentData = {
  full_name: string
  student_id: string
  roll_no: string
  department: string
  year: string
  division: string
  phone: string | null
}

const COMMON_REASONS = [
  "Going to Library",
  "Medical Appointment",
  "Home Visit",
  "Bank Work",
  "Family Function",
  "Other"
]

export function CreatePassForm({ studentData }: { studentData: StudentData }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedReason, setSelectedReason] = useState<string>(COMMON_REASONS[0])
  const [customReason, setCustomReason] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    
    // Compute final reason if "Other" is chosen
    const finalReason = selectedReason === "Other" ? customReason : selectedReason
    formData.set("reason", finalReason)

    const leavingTime = formData.get('leaving_time') as string
    const expectedReturnTime = formData.get('expected_return_time') as string
    
    if (!finalReason || !finalReason.trim()) {
      setError("Please specify a reason for your gate pass.")
      setIsLoading(false)
      return
    }

    if (expectedReturnTime <= leavingTime) {
      setError("Expected return time must be later than leaving time.")
      setIsLoading(false)
      return
    }

    try {
      const result = await createGatePass(formData)
      
      if (result.error) {
        setError(result.error)
      } else {
        router.push('/student/dashboard')
        router.refresh()
      }
    } catch (err) {
      console.error("Submission failed:", err)
      setError("An unexpected error occurred while submitting your request.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Student Information (Read-only) */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader className="border-b border-[var(--color-border)] py-4">
            <CardTitle className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--color-portal)]" />
              <span>Student Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-xs">
            <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-secondary)] font-medium">Full Name</span>
              <span className="font-semibold text-[var(--color-text)]">{studentData.full_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-secondary)] font-medium">Student ID</span>
              <span className="font-mono font-semibold text-[var(--color-text)]">{studentData.student_id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-secondary)] font-medium">Roll Number</span>
              <span className="font-mono font-semibold text-[var(--color-text)]">{studentData.roll_no}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-secondary)] font-medium">Department</span>
              <span className="font-semibold text-[var(--color-text)]">{studentData.department}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-secondary)] font-medium">Year / Division</span>
              <span className="font-semibold text-[var(--color-text)]">{studentData.year} Year / Div {studentData.division}</span>
            </div>
            {studentData.phone && (
              <div className="flex justify-between py-1">
                <span className="text-[var(--color-secondary)] font-medium">Phone</span>
                <span className="font-semibold text-[var(--color-text)]">{studentData.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Gate Pass Request Details Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="border-b border-[var(--color-border)] py-4">
            <CardTitle className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--color-portal)]" />
              <span>Fill Request Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <ErrorState message={error} />}

              {/* Reason Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="reason-select" className="text-xs font-semibold">
                  Reason <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="reason-select"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  disabled={isLoading}
                >
                  {COMMON_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Select>
                {selectedReason === "Other" && (
                  <Input
                    className="mt-2 text-xs"
                    placeholder="Enter custom reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                )}
              </div>

              {/* Destination */}
              <div className="space-y-1.5">
                <Label htmlFor="destination" className="text-xs font-semibold">
                  Destination <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="destination"
                  name="destination"
                  required
                  disabled={isLoading}
                  placeholder="e.g. Central Library, City Hospital, Nashik Road"
                  rightElement={<MapPin className="w-4 h-4 text-[var(--color-secondary)]" />}
                />
              </div>

              {/* Pass Date & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Row 1 */}
                <div className="space-y-1.5">
                  <Label htmlFor="pass_date" className="text-xs font-semibold">
                    Leaving Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pass_date"
                    name="pass_date"
                    type="date"
                    required
                    disabled={isLoading}
                    min={new Date().toISOString().split('T')[0]}
                    rightElement={<Calendar className="w-4 h-4 text-[var(--color-secondary)] pointer-events-none" />}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="leaving_time" className="text-xs font-semibold">
                    Leaving Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="leaving_time"
                    name="leaving_time"
                    type="time"
                    required
                    disabled={isLoading}
                    rightElement={<Clock className="w-4 h-4 text-[var(--color-secondary)] pointer-events-none" />}
                  />
                </div>

                {/* Row 2 */}
                <div className="space-y-1.5">
                  <Label htmlFor="return_date" className="text-xs font-semibold">
                    Expected Return Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="return_date"
                    name="return_date"
                    type="date"
                    required
                    disabled={isLoading}
                    min={new Date().toISOString().split('T')[0]}
                    rightElement={<Calendar className="w-4 h-4 text-[var(--color-secondary)] pointer-events-none" />}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="expected_return_time" className="text-xs font-semibold">
                    Expected Return Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="expected_return_time"
                    name="expected_return_time"
                    type="time"
                    required
                    disabled={isLoading}
                    rightElement={<Clock className="w-4 h-4 text-[var(--color-secondary)] pointer-events-none" />}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-1.5">
                <Label htmlFor="additional_info" className="text-xs font-semibold">
                  Additional Information <span className="text-[var(--color-secondary)] text-[0.6875rem] font-normal">(Optional)</span>
                </Label>
                <Textarea
                  id="additional_info"
                  name="additional_info"
                  disabled={isLoading}
                  placeholder="Need to study for assignments, medical checkup details..."
                  className="text-xs"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  isLoading={isLoading}
                  size="sm"
                  className="gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
