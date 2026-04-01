"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useSpecStore } from "@/store/spec.store"

export function SectionEnv() {
  const { spec, addEnvVar, updateEnvVar, removeEnvVar } = useSpecStore()
  const [draft, setDraft] = useState({ key: "", description: "", required: true, example: "" })

  function handleAdd() {
    if (!draft.key.trim()) return
    addEnvVar(draft)
    setDraft({ key: "", description: "", required: true, example: "" })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Environment variables</h2>
        <p className="text-sm text-muted-foreground">
          All env vars get added to <code className="text-xs bg-muted px-1 rounded">.env.example</code> and
          the Zod validation in <code className="text-xs bg-muted px-1 rounded">lib/env.ts</code>.
        </p>
      </div>

      <div className="space-y-1.5">
        {spec.envVars.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-xl">
            No env vars yet — auth and DB vars are auto-included
          </div>
        )}
        {spec.envVars.map((envVar) => (
          <div key={envVar.id} className="group flex items-center gap-3 px-3 py-2.5 border rounded-xl bg-card hover:border-[hsl(var(--brand))]/30 transition-colors">
            <code className="text-xs font-mono font-medium text-[hsl(var(--brand))] w-48 truncate shrink-0">{envVar.key}</code>
            <span className="text-xs text-muted-foreground flex-1 truncate">{envVar.description}</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                envVar.required
                  ? "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-900"
                  : "text-muted-foreground bg-muted border-border"
              }`}>
                {envVar.required ? "required" : "optional"}
              </span>
              <button onClick={() => removeEnvVar(envVar.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border rounded-xl p-4 space-y-3 bg-muted/20">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Add variable</div>
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="VARIABLE_NAME" value={draft.key}
            onChange={(e) => setDraft({ ...draft, key: e.target.value.toUpperCase().replace(/\s/g, "_") })}
            className="input text-sm font-mono" />
          <input type="text" placeholder="example value" value={draft.example}
            onChange={(e) => setDraft({ ...draft, example: e.target.value })} className="input text-sm font-mono" />
        </div>
        <input type="text" placeholder="What this variable is used for" value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="input text-sm" />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={draft.required} onChange={(e) => setDraft({ ...draft, required: e.target.checked })}
              className="w-3.5 h-3.5 cursor-pointer accent-[hsl(var(--brand))]" />
            <span className="text-muted-foreground">Required</span>
          </label>
          <button onClick={handleAdd} disabled={!draft.key.trim()}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--brand))] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[hsl(var(--brand))]/90 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  )
}
