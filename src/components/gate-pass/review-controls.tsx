"use client"

import { useState, useTransition } from "react"
import { reviewGatePass } from "@/app/actions/gate-pass"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export function ReviewControls({ passId, initialStatus }: { passId: string, initialStatus: string }) {
  const router = useRouter()
  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null)
  const currentStatus = optimisticStatus || initialStatus
  const [isPending, startTransition] = useTransition()
  const [isDeclining, setIsDeclining] = useState(false)
  const [remark, setRemark] = useState("")
  const [error, setError] = useState<string | null>(null)


  const handleApprove = () => {
    // If pending, use confirm. If declined, no confirm needed (as it is a direct action to approve)
    if (currentStatus === 'pending' && !window.confirm("Are you sure you want to approve this gate pass?")) return

    setError(null)
    startTransition(async () => {
      const result = await reviewGatePass(passId, "approved")
      if (result.error) {
        setError(result.error)
      } else {
        setOptimisticStatus("approved")
        router.refresh()
      }
    })
  }

  const handleDecline = () => {
    if (!isDeclining) {
      setIsDeclining(true)
      return
    }

    if (!window.confirm("Are you sure you want to decline this gate pass?")) return

    setError(null)
    startTransition(async () => {
      const result = await reviewGatePass(passId, "declined", remark)
      if (result.error) {
        setError(result.error)
      } else {
        setOptimisticStatus("declined")
        setIsDeclining(false)
        setRemark("")
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-500/10 p-4 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-400">Action Failed</p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {currentStatus !== 'pending' && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{
            backgroundColor: currentStatus === 'approved' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: currentStatus === 'approved' ? '#22C55E' : '#EF4444'
          }}>
            {currentStatus === 'approved' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text)]">
              This request was <span className="font-bold capitalize" style={{
                color: currentStatus === 'approved' ? '#22C55E' : '#EF4444'
              }}>{currentStatus}</span>.
            </p>
          </div>
        </div>
      )}

      {isDeclining && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <label htmlFor="remark" className="block text-sm font-semibold text-[var(--color-text)]">
            Decline Remark <span className="text-[var(--color-secondary)] font-normal">(Optional)</span>
          </label>
          <textarea
            id="remark"
            rows={3}
            className="block w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-secondary)] text-sm focus:border-[var(--color-portal)] focus:ring-[var(--color-portal)] p-3 transition-colors resize-none"
            placeholder="Provide a reason for declining..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            disabled={isPending}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
        {isDeclining && (
          <button
            type="button"
            onClick={() => {
              setIsDeclining(false)
              setRemark("")
              setError(null)
            }}
            disabled={isPending}
            className="inline-flex justify-center items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-portal)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        {(currentStatus === 'pending' || currentStatus === 'approved') && (
          <button
            type="button"
            onClick={handleDecline}
            disabled={isPending}
            className="inline-flex justify-center items-center gap-2 rounded-md border border-transparent bg-red-600 hover:bg-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[var(--color-background)] transition-colors disabled:opacity-50"
          >
            {isPending && isDeclining ? (
              "DECLINING..."
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                {isDeclining ? "Decline Request" : "DECLINE"}
              </>
            )}
          </button>
        )}
        {!isDeclining && (currentStatus === 'pending' || currentStatus === 'declined') && (
          <button
            type="button"
            onClick={handleApprove}
            disabled={isPending}
            className="inline-flex justify-center items-center gap-2 rounded-md border border-transparent bg-green-600 hover:bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[var(--color-background)] transition-colors disabled:opacity-50"
          >
            {isPending && !isDeclining ? (
              "APPROVING..."
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                APPROVE
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
