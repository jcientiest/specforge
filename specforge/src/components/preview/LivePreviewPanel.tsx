"use client"

import { useMemo } from "react"
import { useSpecStore } from "@/store/spec.store"
import { generateClaudeMd } from "@/lib/generators/claude-md.generator"

export function LivePreviewPanel() {
  const { spec } = useSpecStore()

  const claudeMd = useMemo(() => generateClaudeMd(spec), [spec])

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <div className="text-xs font-medium">Live preview</div>
          <div className="text-[10px] text-muted-foreground font-mono">CLAUDE.md</div>
        </div>
        <div className="text-[10px] text-muted-foreground">
          Updates as you edit
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <pre className="text-[11px] leading-relaxed font-mono text-muted-foreground whitespace-pre-wrap break-words">
          {claudeMd}
        </pre>
      </div>
    </div>
  )
}
