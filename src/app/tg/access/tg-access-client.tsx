"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, Download } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

export function TgAccessClient() {
  const [portalUrl, setPortalUrl] = useState("https://your-domain.com/student/login")
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    // Generate the actual URL on the client to get the correct host
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPortalUrl(`${window.location.origin}/student/login`)
    }
  }, [])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link", err)
    }
  }

  const handleDownloadQr = () => {
    if (!qrRef.current) return
    
    // Serialize the SVG to a string
    const svgData = new XMLSerializer().serializeToString(qrRef.current)
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    
    // Create a temporary link element to trigger the download
    const link = document.createElement("a")
    link.href = url
    link.download = "student-portal-qr.svg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Fixed Portal URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--color-secondary)]">
            This is the single permanent link where students can access the portal. Do not share raw authentication links directly.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex-1 truncate rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] font-medium">
              {portalUrl}
            </div>
            <Button 
              variant="outline" 
              onClick={handleCopyLink}
              className="gap-2 shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>QR Code</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 py-4">
          <div className="flex p-4 items-center justify-center rounded-xl bg-white shadow-sm border border-[var(--color-border)]">
            <QRCodeSVG 
              value={portalUrl}
              size={200}
              level="H"
              includeMargin={true}
              ref={qrRef}
            />
          </div>
          <Button 
            onClick={handleDownloadQr}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download QR
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
