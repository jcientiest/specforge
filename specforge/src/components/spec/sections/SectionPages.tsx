"use client"
// ─── SectionPages ─────────────────────────────────────────────────────────────

import { useState } from "react"
import { Plus, Trash2, Lock, Globe } from "lucide-react"
import { useSpecStore } from "@/store/spec.store"
import type { SpecPage } from "@/types/spec"

export function SectionPages() {
  const { spec, addPage, updatePage, removePage } = useSpecStore()
  const [draft, setDraft] = useState({ name: "", path: "/", description: "", auth: false })

  function handleAdd() {
    if (!draft.name.trim()) return
    addPage(draft)
    setDraft({ name: "", path: "/", description: "", auth: false })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Pages</h2>
        <p className="text-sm text-muted-foreground">
          All frontend pages. Claude builds each with correct auth guards, layouts, and metadata.
        </p>
      </div>

      <div className="space-y-1.5">
        {spec.pages.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-xl">
            No pages yet
          </div>
        )}
        {spec.pages.map((page) => (
          <div key={page.id} className="group flex items-center gap-3 px-3 py-2.5 border rounded-xl bg-card hover:border-[hsl(var(--brand))]/30 transition-colors">
            <code className="text-xs font-mono text-muted-foreground w-36 truncate shrink-0">{page.path}</code>
            <span className="text-sm font-medium w-32 truncate shrink-0">{page.name}</span>
            <span className="text-xs text-muted-foreground flex-1 truncate">{page.description}</span>
            <div className="flex items-center gap-2 shrink-0">
              {page.auth ? <Lock className="w-3.5 h-3.5 text-muted-foreground/60" /> : <Globe className="w-3.5 h-3.5 text-muted-foreground/40" />}
              <button onClick={() => removePage(page.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border rounded-xl p-4 space-y-3 bg-muted/20">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Add page</div>
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="Page name" value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="input text-sm" />
          <input type="text" placeholder="/path" value={draft.path}
            onChange={(e) => setDraft({ ...draft, path: e.target.value })} className="input text-sm font-mono" />
        </div>
        <input type="text" placeholder="What this page shows / does" value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="input text-sm" />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={draft.auth} onChange={(e) => setDraft({ ...draft, auth: e.target.checked })}
              className="w-3.5 h-3.5 cursor-pointer accent-[hsl(var(--brand))]" />
            <span className="text-muted-foreground">Requires auth</span>
          </label>
          <button onClick={handleAdd} disabled={!draft.name.trim()}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--brand))] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[hsl(var(--brand))]/90 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  )
}
