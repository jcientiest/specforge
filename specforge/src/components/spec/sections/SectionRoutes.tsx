"use client"

import { useState } from "react"
import { Plus, Trash2, Lock, Globe } from "lucide-react"
import { useSpecStore } from "@/store/spec.store"
import type { SpecRoute, HttpMethod } from "@/types/spec"

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:    "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-900",
  POST:   "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-900",
  PUT:    "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-900",
  PATCH:  "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950 dark:border-purple-900",
  DELETE: "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-900",
}

const BLANK_ROUTE: Omit<SpecRoute, "id"> = {
  method: "GET",
  path: "/api/",
  description: "",
  auth: true,
}

export function SectionRoutes() {
  const { spec, addRoute, updateRoute, removeRoute } = useSpecStore()
  const [draft, setDraft] = useState<Omit<SpecRoute, "id">>({ ...BLANK_ROUTE })

  function handleAdd() {
    if (!draft.path.trim() || !draft.description.trim()) return
    addRoute(draft)
    setDraft({ ...BLANK_ROUTE })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">API routes</h2>
        <p className="text-sm text-muted-foreground">
          Define every endpoint. Claude generates the full implementation, validation, and auth for each.
        </p>
      </div>

      {/* Route table */}
      <div className="space-y-1.5">
        {spec.routes.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-xl">
            No routes yet
          </div>
        )}
        {spec.routes.map((route) => (
          <RouteRow key={route.id} route={route}
            onUpdate={(patch) => updateRoute(route.id, patch)}
            onRemove={() => removeRoute(route.id)}
          />
        ))}
      </div>

      {/* Add form */}
      <div className="border rounded-xl p-4 space-y-3 bg-muted/20">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Add route</div>
        <div className="flex gap-2">
          <select
            value={draft.method}
            onChange={(e) => setDraft({ ...draft, method: e.target.value as HttpMethod })}
            className={`input text-xs font-mono font-medium w-24 appearance-none cursor-pointer ${METHOD_COLORS[draft.method]}`}
          >
            {(["GET", "POST", "PUT", "PATCH", "DELETE"] as HttpMethod[]).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="/api/resource/:id"
            value={draft.path}
            onChange={(e) => setDraft({ ...draft, path: e.target.value })}
            className="input flex-1 font-mono text-xs"
          />
        </div>
        <input
          type="text"
          placeholder="What this route does"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="input text-sm"
        />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={draft.auth}
              onChange={(e) => setDraft({ ...draft, auth: e.target.checked })}
              className="w-3.5 h-3.5 cursor-pointer accent-[hsl(var(--brand))]"
            />
            <span className="text-muted-foreground">Requires auth</span>
          </label>
          <button
            onClick={handleAdd}
            disabled={!draft.path.trim() || !draft.description.trim()}
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

function RouteRow({ route, onUpdate, onRemove }: {
  route: SpecRoute
  onUpdate: (patch: Partial<SpecRoute>) => void
  onRemove: () => void
}) {
  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 border rounded-xl bg-card hover:border-[hsl(var(--brand))]/30 transition-colors">
      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border w-14 text-center shrink-0 ${METHOD_COLORS[route.method]}`}>
        {route.method}
      </span>
      <code className="text-xs font-mono text-muted-foreground w-48 truncate shrink-0">{route.path}</code>
      <span className="text-sm flex-1 truncate text-muted-foreground">{route.description}</span>
      <div className="flex items-center gap-2 shrink-0">
        {route.auth
          ? <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
          : <Globe className="w-3.5 h-3.5 text-muted-foreground/40" />
        }
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
