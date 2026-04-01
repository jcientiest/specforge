"use client"

import { useState } from "react"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { useSpecStore } from "@/store/spec.store"
import type { SpecFeature } from "@/types/spec"

const PRIORITY_CONFIG = {
  must:   { label: "Must",   color: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-900" },
  should: { label: "Should", color: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-900" },
  could:  { label: "Could",  color: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-900" },
}

export function SectionFeatures() {
  const { spec, addFeature, updateFeature, removeFeature } = useSpecStore()
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newPriority, setNewPriority] = useState<SpecFeature["priority"]>("must")

  function handleAdd() {
    if (!newName.trim()) return
    addFeature({ name: newName.trim(), description: newDesc.trim(), priority: newPriority, status: "planned" })
    setNewName("")
    setNewDesc("")
    setNewPriority("must")
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Features</h2>
        <p className="text-sm text-muted-foreground">
          List what this project does. Must = required, Should = important, Could = nice-to-have.
          Claude uses these to understand scope.
        </p>
      </div>

      {/* Feature list */}
      <div className="space-y-2">
        {spec.features.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-xl">
            No features yet — add your first one below
          </div>
        )}
        {spec.features.map((feature) => (
          <FeatureRow key={feature.id} feature={feature} onUpdate={updateFeature} onRemove={removeFeature} />
        ))}
      </div>

      {/* Add form */}
      <div className="border rounded-xl p-4 space-y-3 bg-muted/20">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Add feature</div>
        <input
          type="text"
          placeholder="Feature name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="input"
        />
        <input
          type="text"
          placeholder="Brief description (optional)"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="input"
        />
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {(Object.keys(PRIORITY_CONFIG) as SpecFeature["priority"][]).map((p) => (
              <button
                key={p}
                onClick={() => setNewPriority(p)}
                className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                  newPriority === p ? PRIORITY_CONFIG[p].color : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {PRIORITY_CONFIG[p].label}
              </button>
            ))}
          </div>
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--brand))] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[hsl(var(--brand))]/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

function FeatureRow({
  feature,
  onUpdate,
  onRemove,
}: {
  feature: SpecFeature
  onUpdate: (id: string, patch: Partial<SpecFeature>) => void
  onRemove: (id: string) => void
}) {
  const cfg = PRIORITY_CONFIG[feature.priority]

  return (
    <div className="group flex items-start gap-3 p-3 border rounded-xl bg-card hover:border-[hsl(var(--brand))]/30 transition-colors">
      <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0 cursor-grab" />
      <div className="flex-1 min-w-0 space-y-1">
        <input
          type="text"
          value={feature.name}
          onChange={(e) => onUpdate(feature.id, { name: e.target.value })}
          className="w-full text-sm font-medium bg-transparent border-none outline-none placeholder:text-muted-foreground"
        />
        <input
          type="text"
          value={feature.description}
          onChange={(e) => onUpdate(feature.id, { description: e.target.value })}
          placeholder="Add description..."
          className="w-full text-xs text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
        />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <select
          value={feature.priority}
          onChange={(e) => onUpdate(feature.id, { priority: e.target.value as SpecFeature["priority"] })}
          className={`text-xs font-medium px-2 py-1 rounded-md border appearance-none cursor-pointer ${cfg.color}`}
        >
          <option value="must">Must</option>
          <option value="should">Should</option>
          <option value="could">Could</option>
        </select>
        <button
          onClick={() => onRemove(feature.id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
