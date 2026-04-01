"use client"

import { useSpecStore } from "@/store/spec.store"
import type { BuilderSection } from "@/types/spec"
import {
  LayoutDashboard, Layers, Star, Database, Route,
  Globe, KeyRound, CheckCircle2, AlertCircle,
} from "lucide-react"

const SECTIONS: { id: BuilderSection; label: string; icon: React.ElementType; getCount?: (spec: any) => number }[] = [
  { id: "overview",     label: "Overview",      icon: LayoutDashboard },
  { id: "stack",        label: "Stack",          icon: Layers },
  { id: "features",     label: "Features",       icon: Star,       getCount: (s) => s.features.length },
  { id: "entities",     label: "Data model",     icon: Database,   getCount: (s) => s.entities.length },
  { id: "routes",       label: "API routes",     icon: Route,      getCount: (s) => s.routes.length },
  { id: "pages",        label: "Pages",          icon: Globe,      getCount: (s) => s.pages.length },
  { id: "env",          label: "Env vars",       icon: KeyRound,   getCount: (s) => s.envVars.length },
  { id: "review",       label: "Review & gaps",  icon: CheckCircle2 },
]

export function BuilderSidebar() {
  const { spec, ui, setSection } = useSpecStore()

  const unresolvedGaps = spec.gaps.filter((g) => !g.resolved)
  const errors = unresolvedGaps.filter((g) => g.severity === "error").length

  return (
    <aside className="w-52 border-r bg-muted/20 flex-shrink-0 overflow-y-auto">
      <nav className="p-2 pt-3">
        {SECTIONS.map((section) => {
          const isActive = ui.activeSection === section.id
          const Icon = section.icon
          const count = section.getCount?.(spec)
          const isReview = section.id === "review"

          return (
            <button
              key={section.id}
              onClick={() => setSection(section.id)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${
                isActive
                  ? "bg-background border border-border text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{section.label}</span>
              </span>
              {isReview && errors > 0 && (
                <span className="flex items-center gap-0.5 text-destructive text-xs font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {errors}
                </span>
              )}
              {!isReview && count !== undefined && count > 0 && (
                <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Spec version */}
      <div className="px-4 py-3 mt-auto border-t">
        <div className="text-[10px] text-muted-foreground font-mono">
          spec v{spec.version}
        </div>
        <div className="text-[10px] text-muted-foreground">
          {spec.updatedAt ? `Updated ${new Date(spec.updatedAt).toLocaleTimeString()}` : "—"}
        </div>
      </div>
    </aside>
  )
}
