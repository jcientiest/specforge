"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap, Store, Code2, FileText, Plus, ArrowRight, Github } from "lucide-react"
import { TEMPLATES } from "@/templates"
import { useSpecStore } from "@/store/spec.store"
import type { SpecTemplate } from "@/types/spec"

const ICON_MAP: Record<string, React.ElementType> = {
  Zap, Store, Code2, FileText, Plus,
}

export default function HomePage() {
  const router = useRouter()
  const { loadTemplate } = useSpecStore()

  function handleSelectTemplate(template: SpecTemplate) {
    loadTemplate(template.spec)
    router.push("/builder")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[hsl(var(--brand))] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">SpecForge</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://github.com/yourname/specforge" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-[hsl(var(--brand-muted))] text-[hsl(var(--brand))] mb-6">
          <Zap className="w-3 h-3" />
          <span>Open source · Free to use</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Build the spec.{" "}
          <span className="text-[hsl(var(--brand))]">Claude builds the rest.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          Design your project visually — pick a template, configure your stack, define your data model.
          Export a perfect context bundle. Upload to Claude and type <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono">continue</code>.
        </p>

        {/* How it works */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-16">
          {["Pick template", "Edit spec", "Export .zip", "Upload to Claude", "Type continue"].map((step, i, arr) => (
            <span key={step} className="flex items-center gap-2">
              <span className="hidden sm:inline">{step}</span>
              <span className="sm:hidden text-xs">{step.split(" ")[0]}</span>
              {i < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-border shrink-0" />}
            </span>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Choose a starting point</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TEMPLATES.map((template) => {
            const Icon = ICON_MAP[template.icon] ?? Zap
            const isBlank = template.id === "blank"
            return (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`group relative text-left p-5 rounded-xl border transition-all hover:border-[hsl(var(--brand))] hover:shadow-sm ${
                  isBlank
                    ? "border-dashed border-border bg-background hover:bg-[hsl(var(--brand-muted))]"
                    : "border-border bg-card hover:bg-[hsl(var(--brand-muted))]/30"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                  isBlank
                    ? "bg-muted group-hover:bg-[hsl(var(--brand-muted))]"
                    : "bg-[hsl(var(--brand-muted))] group-hover:bg-[hsl(var(--brand))]/20"
                }`}>
                  <Icon className={`w-4.5 h-4.5 transition-colors ${
                    isBlank
                      ? "text-muted-foreground group-hover:text-[hsl(var(--brand))]"
                      : "text-[hsl(var(--brand))]"
                  }`} />
                </div>
                <div className="font-medium text-sm mb-1">{template.name}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{template.description}</div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
                <ArrowRight className="absolute right-4 top-4 w-4 h-4 text-muted-foreground/0 group-hover:text-[hsl(var(--brand))] transition-all group-hover:translate-x-0.5" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
