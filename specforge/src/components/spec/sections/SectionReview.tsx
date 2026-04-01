"use client"

import { useState } from "react"
import { AlertCircle, AlertTriangle, Lightbulb, CheckCircle2, Loader2, Download, Sparkles } from "lucide-react"
import { useSpecStore } from "@/store/spec.store"
import { generateExportZip } from "@/lib/generators/export.generator"
import type { SpecGap } from "@/types/spec"

export function SectionReview() {
  const { spec, ui, setGaps, setAnalysisStatus, setExporting, resolveGap } = useSpecStore()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const unresolvedGaps = spec.gaps.filter((g) => !g.resolved)
  const errors = unresolvedGaps.filter((g) => g.severity === "error")
  const warnings = unresolvedGaps.filter((g) => g.severity === "warning")
  const suggestions = unresolvedGaps.filter((g) => g.severity === "suggestion")

  async function handleAnalyze() {
    setIsAnalyzing(true)
    setAnalysisStatus("analyzing")
    try {
      // Client-side rule-based analysis (no server needed)
      await new Promise((r) => setTimeout(r, 600)) // small delay for UX
      const gaps = runLocalAnalysis(spec)
      setGaps(gaps)
    } catch {
      setAnalysisStatus("stale")
    } finally {
      setIsAnalyzing(false)
    }
  }

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
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  const isReady = spec.name.length > 0 && errors.length === 0

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Review & export</h2>
        <p className="text-sm text-muted-foreground">
          Run the AI analysis to catch missing pieces, then export your bundle.
        </p>
      </div>

      {/* Spec summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Features",  value: spec.features.length },
          { label: "Entities",  value: spec.entities.length },
          { label: "Routes",    value: spec.routes.length },
          { label: "Pages",     value: spec.pages.length },
          { label: "Integrations", value: spec.integrations.length },
          { label: "Env vars",  value: spec.envVars.length },
        ].map(({ label, value }) => (
          <div key={label} className="border rounded-xl p-3 bg-card text-center">
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* AI Analysis */}
      <div className="border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[hsl(var(--brand))]" />
            <span className="text-sm font-medium">AI gap analysis</span>
            {spec.analysisStatus === "stale" && (
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded dark:bg-amber-950 dark:border-amber-900 dark:text-amber-400">
                stale
              </span>
            )}
            {spec.analysisStatus === "complete" && (
              <span className="text-[10px] px-1.5 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded dark:bg-green-950 dark:border-green-900 dark:text-green-400">
                complete
              </span>
            )}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !spec.name}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-40 hover:bg-muted"
          >
            {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {isAnalyzing ? "Analyzing..." : "Analyze spec"}
          </button>
        </div>

        <div className="p-4">
          {spec.gaps.length === 0 && spec.analysisStatus !== "complete" && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Click "Analyze spec" to check for gaps and missing details.
            </p>
          )}
          {spec.analysisStatus === "complete" && spec.gaps.filter((g) => !g.resolved).length === 0 && (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 py-2">
              <CheckCircle2 className="w-4 h-4" />
              No issues found — your spec is ready to export.
            </div>
          )}
          <div className="space-y-2">
            {[...errors, ...warnings, ...suggestions].map((gap) => (
              <GapRow key={gap.id} gap={gap} onResolve={() => resolveGap(gap.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="border rounded-xl p-5 bg-muted/20">
        <div className="mb-4">
          <div className="text-sm font-medium mb-1">Export bundle</div>
          <div className="text-xs text-muted-foreground">
            Generates a .zip with CLAUDE.md, spec.json, prompt files for each module, and a complete folder scaffold.
            Always reflects the latest state of your spec.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          {[
            { file: "CLAUDE.md",      desc: "Full project brief for Claude" },
            { file: "spec.json",      desc: "Machine-readable contract" },
            { file: "prompts/",       desc: `${spec.buildOrder.length} module prompts` },
            { file: "scaffold/",      desc: "Complete folder structure" },
            { file: ".env.example",   desc: "Environment variable template" },
            { file: "README.md",      desc: "Project readme" },
          ].map(({ file, desc }) => (
            <div key={file} className="flex items-start gap-2 p-2 rounded-lg bg-background border">
              <code className="font-mono text-[hsl(var(--brand))] shrink-0">{file}</code>
              <span className="text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleExport}
          disabled={!isReady || ui.isExporting}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
            isReady && !ui.isExporting
              ? "bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand))]/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {ui.isExporting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
          ) : (
            <><Download className="w-4 h-4" /> Export .zip</>
          )}
        </button>
        {!spec.name && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Add a project name in Overview to enable export
          </p>
        )}
      </div>
    </div>
  )
}

function GapRow({ gap, onResolve }: { gap: SpecGap; onResolve: () => void }) {
  const config = {
    error:      { icon: AlertCircle,   color: "text-red-600 dark:text-red-400",    bg: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900" },
    warning:    { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-900" },
    suggestion: { icon: Lightbulb,    color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900" },
  }[gap.severity]
  const Icon = config.icon

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${config.bg}`}>
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.color}`} />
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium ${config.color}`}>{gap.section}</div>
        <div className="text-xs text-foreground mt-0.5">{gap.message}</div>
        {gap.suggestion && (
          <div className="text-xs text-muted-foreground mt-1">→ {gap.suggestion}</div>
        )}
      </div>
      <button
        onClick={onResolve}
        className="text-[10px] px-2 py-1 rounded border bg-background/60 hover:bg-background text-muted-foreground transition-colors shrink-0"
      >
        Dismiss
      </button>
    </div>
  )
}

// ─── Local analysis fallback (runs without API) ───────────────────────────────

import { nanoid } from "nanoid"

function runLocalAnalysis(spec: any): SpecGap[] {
  const gaps: SpecGap[] = []
  const add = (severity: SpecGap["severity"], section: string, message: string, suggestion?: string) =>
    gaps.push({ id: nanoid(), severity, section, message, suggestion, resolved: false })

  if (!spec.name) add("error", "Overview", "Project name is required", "Add a name in the Overview section")
  if (!spec.description) add("warning", "Overview", "No project description", "Add a description so Claude understands context")
  if (spec.features.length === 0) add("warning", "Features", "No features defined", "Add at least the core features you want to build")
  if (spec.stack.database !== "none" && spec.entities.length === 0) add("warning", "Data model", "Database selected but no entities defined", "Add your data models")
  if (spec.entities.length > 0 && spec.routes.length === 0) add("suggestion", "API routes", "Entities defined but no API routes", "Add API routes for CRUD operations on your entities")
  if (spec.stack.auth !== "none" && !spec.envVars.find((v: any) => v.key.includes("SECRET"))) add("suggestion", "Env vars", "Auth configured but no secret key defined", "Add AUTH_SECRET or NEXTAUTH_SECRET to env vars")
  if (spec.integrations.some((i: any) => i.envVars.length > 0) && spec.envVars.length === 0) add("warning", "Env vars", "Integrations need env vars", "Add the required env vars for your integrations")
  if (spec.buildOrder.length === 0) add("error", "Build order", "Build order is empty", "Set the module build order in conventions")

  return gaps
}
