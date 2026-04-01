"use client"

import { useSpecStore } from "@/store/spec.store"
import { BuilderSidebar } from "@/components/spec/BuilderSidebar"
import { BuilderHeader } from "@/components/spec/BuilderHeader"
import { SectionOverview } from "@/components/spec/sections/SectionOverview"
import { SectionStack } from "@/components/spec/sections/SectionStack"
import { SectionFeatures } from "@/components/spec/sections/SectionFeatures"
import { SectionEntities } from "@/components/spec/sections/SectionEntities"
import { SectionRoutes } from "@/components/spec/sections/SectionRoutes"
import { SectionPages } from "@/components/spec/sections/SectionPages"
import { SectionEnv } from "@/components/spec/sections/SectionEnv"
import { SectionReview } from "@/components/spec/sections/SectionReview"
import { LivePreviewPanel } from "@/components/preview/LivePreviewPanel"

export default function BuilderPage() {
  const { ui } = useSpecStore()

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <BuilderHeader />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <BuilderSidebar />

        {/* Main editor */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <ActiveSection section={ui.activeSection} />
          </div>
        </main>

        {/* Live preview panel */}
        {ui.previewOpen && (
          <aside className="w-96 border-l overflow-y-auto bg-muted/30">
            <LivePreviewPanel />
          </aside>
        )}
      </div>
    </div>
  )
}

function ActiveSection({ section }: { section: string }) {
  switch (section) {
    case "overview":     return <SectionOverview />
    case "stack":        return <SectionStack />
    case "features":     return <SectionFeatures />
    case "entities":     return <SectionEntities />
    case "routes":       return <SectionRoutes />
    case "pages":        return <SectionPages />
    case "env":          return <SectionEnv />
    case "review":       return <SectionReview />
    default:             return <SectionOverview />
  }
}
