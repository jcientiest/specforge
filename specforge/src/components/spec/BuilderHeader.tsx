"use client"

import Link from "next/link"
import { Zap, Download, Eye, EyeOff, RotateCcw, Loader2 } from "lucide-react"
import { useSpecStore } from "@/store/spec.store"
import { generateExportZip } from "@/lib/generators/export.generator"

export function BuilderHeader() {
  const { spec, ui, setPreviewOpen, setExporting, resetSpec } = useSpecStore()

  async function handleExport() {
    setExporting(true)
    try {
      const result = await generateExportZip(spec)
      const url = URL.createObjectURL(result.blob)
      const a = document.createElement("a")
      a.href = url
      a.download = result.filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setExporting(false)
    }
  }

  const isReady = spec.name.length > 0

  return (
    <header className="border-b px-4 py-3 flex items-center justify-between gap-4 bg-background z-10">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 rounded-md bg-[hsl(var(--brand))] flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-semibold text-sm tracking-tight hidden sm:block">SpecForge</span>
      </Link>

      {/* Project name */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium truncate">
          {spec.name || <span className="text-muted-foreground">Untitled project</span>}
        </span>
        {ui.isDirty && (
          <span className="ml-2 text-xs text-muted-foreground">• unsaved</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Preview toggle */}
        <button
          onClick={() => setPreviewOpen(!ui.previewOpen)}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
            ui.previewOpen
              ? "bg-[hsl(var(--brand-muted))] border-[hsl(var(--brand))]/30 text-[hsl(var(--brand))]"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {ui.previewOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{ui.previewOpen ? "Hide preview" : "Preview"}</span>
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          disabled={!isReady || ui.isExporting}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${
            isReady && !ui.isExporting
              ? "bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand))]/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {ui.isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{ui.isExporting ? "Exporting..." : "Export .zip"}</span>
        </button>
      </div>
    </header>
  )
}
