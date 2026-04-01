import { create } from "zustand"
import { persist, subscribeWithSelector } from "zustand/middleware"
import { nanoid } from "nanoid"
import type {
  ProjectSpec,
  BuilderUIState,
  BuilderSection,
  SpecEntity,
  SpecRoute,
  SpecPage,
  SpecFeature,
  SpecIntegration,
  SpecEnvVar,
  SpecGap,
  SpecStack,
  SpecConventions,
} from "@/types/spec"
import { DEFAULT_CONVENTIONS, DEFAULT_STACK } from "@/lib/defaults"

// ─── Store Shape ──────────────────────────────────────────────────────────────

interface SpecStore {
  spec: ProjectSpec
  ui: BuilderUIState

  // ── Spec meta ──
  setName: (name: string) => void
  setTagline: (tagline: string) => void
  setDescription: (description: string) => void
  setType: (type: ProjectSpec["type"]) => void

  // ── Stack ──
  setStack: (stack: Partial<SpecStack>) => void

  // ── Features ──
  addFeature: (feature: Omit<SpecFeature, "id">) => void
  updateFeature: (id: string, patch: Partial<SpecFeature>) => void
  removeFeature: (id: string) => void
  reorderFeatures: (ids: string[]) => void

  // ── Entities ──
  addEntity: (entity: Omit<SpecEntity, "id">) => void
  updateEntity: (id: string, patch: Partial<SpecEntity>) => void
  removeEntity: (id: string) => void

  // ── Routes ──
  addRoute: (route: Omit<SpecRoute, "id">) => void
  updateRoute: (id: string, patch: Partial<SpecRoute>) => void
  removeRoute: (id: string) => void

  // ── Pages ──
  addPage: (page: Omit<SpecPage, "id">) => void
  updatePage: (id: string, patch: Partial<SpecPage>) => void
  removePage: (id: string) => void

  // ── Integrations ──
  addIntegration: (integration: Omit<SpecIntegration, "id">) => void
  updateIntegration: (id: string, patch: Partial<SpecIntegration>) => void
  removeIntegration: (id: string) => void

  // ── Env vars ──
  addEnvVar: (envVar: Omit<SpecEnvVar, "id">) => void
  updateEnvVar: (id: string, patch: Partial<SpecEnvVar>) => void
  removeEnvVar: (id: string) => void

  // ── Conventions ──
  setConventions: (conventions: Partial<SpecConventions>) => void
  setBuildOrder: (order: string[]) => void
  addOutOfScope: (item: string) => void
  removeOutOfScope: (item: string) => void

  // ── AI Analysis ──
  setGaps: (gaps: SpecGap[]) => void
  resolveGap: (id: string) => void
  setAnalysisStatus: (status: ProjectSpec["analysisStatus"]) => void

  // ── Template ──
  loadTemplate: (spec: Partial<ProjectSpec>) => void
  resetSpec: () => void

  // ── UI ──
  setSection: (section: BuilderSection) => void
  setPreviewOpen: (open: boolean) => void
  setAnalysisOpen: (open: boolean) => void
  setExporting: (exporting: boolean) => void
  setAnalyzing: (analyzing: boolean) => void
}

// ─── Initial Spec ─────────────────────────────────────────────────────────────

function createBlankSpec(): ProjectSpec {
  return {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: "0.1.0",
    name: "",
    tagline: "",
    description: "",
    type: "saas",
    stack: DEFAULT_STACK,
    entities: [],
    routes: [],
    pages: [],
    integrations: [],
    features: [],
    envVars: [],
    conventions: DEFAULT_CONVENTIONS,
    buildOrder: ["auth", "database", "api", "frontend", "testing"],
    outOfScope: [],
    gaps: [],
    analysisStatus: "pending",
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSpecStore = create<SpecStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        spec: createBlankSpec(),
        ui: {
          activeSection: "overview",
          previewOpen: false,
          analysisOpen: false,
          isDirty: false,
          isSaving: false,
          isExporting: false,
          isAnalyzing: false,
        },

        // ── Helpers ──
        _touch: () =>
          set((s) => ({
            spec: {
              ...s.spec,
              updatedAt: new Date().toISOString(),
              analysisStatus: "stale",
            },
            ui: { ...s.ui, isDirty: true },
          })),

        // ── Spec meta ──
        setName: (name) =>
          set((s) => ({ spec: { ...s.spec, name, updatedAt: now(), analysisStatus: "stale" }, ui: { ...s.ui, isDirty: true } })),
        setTagline: (tagline) =>
          set((s) => ({ spec: { ...s.spec, tagline, updatedAt: now() }, ui: { ...s.ui, isDirty: true } })),
        setDescription: (description) =>
          set((s) => ({ spec: { ...s.spec, description, updatedAt: now() }, ui: { ...s.ui, isDirty: true } })),
        setType: (type) =>
          set((s) => ({ spec: { ...s.spec, type, updatedAt: now(), analysisStatus: "stale" }, ui: { ...s.ui, isDirty: true } })),

        // ── Stack ──
        setStack: (patch) =>
          set((s) => ({
            spec: { ...s.spec, stack: { ...s.spec.stack, ...patch }, updatedAt: now(), analysisStatus: "stale" },
            ui: { ...s.ui, isDirty: true },
          })),

        // ── Features ──
        addFeature: (feature) =>
          set((s) => ({
            spec: { ...s.spec, features: [...s.spec.features, { ...feature, id: nanoid() }], updatedAt: now(), analysisStatus: "stale" },
            ui: { ...s.ui, isDirty: true },
          })),
        updateFeature: (id, patch) =>
          set((s) => ({
            spec: {
              ...s.spec,
              features: s.spec.features.map((f) => (f.id === id ? { ...f, ...patch } : f)),
              updatedAt: now(),
            },
            ui: { ...s.ui, isDirty: true },
          })),
        removeFeature: (id) =>
          set((s) => ({
            spec: { ...s.spec, features: s.spec.features.filter((f) => f.id !== id), updatedAt: now(), analysisStatus: "stale" },
            ui: { ...s.ui, isDirty: true },
          })),
        reorderFeatures: (ids) =>
          set((s) => ({
            spec: {
              ...s.spec,
              features: ids.map((id) => s.spec.features.find((f) => f.id === id)!).filter(Boolean),
              updatedAt: now(),
            },
          })),

        // ── Entities ──
        addEntity: (entity) =>
          set((s) => ({
            spec: { ...s.spec, entities: [...s.spec.entities, { ...entity, id: nanoid() }], updatedAt: now(), analysisStatus: "stale" },
            ui: { ...s.ui, isDirty: true },
          })),
        updateEntity: (id, patch) =>
          set((s) => ({
            spec: {
              ...s.spec,
              entities: s.spec.entities.map((e) => (e.id === id ? { ...e, ...patch } : e)),
              updatedAt: now(),
            },
            ui: { ...s.ui, isDirty: true },
          })),
        removeEntity: (id) =>
          set((s) => ({
            spec: { ...s.spec, entities: s.spec.entities.filter((e) => e.id !== id), updatedAt: now(), analysisStatus: "stale" },
            ui: { ...s.ui, isDirty: true },
          })),

        // ── Routes ──
        addRoute: (route) =>
          set((s) => ({
            spec: { ...s.spec, routes: [...s.spec.routes, { ...route, id: nanoid() }], updatedAt: now(), analysisStatus: "stale" },
            ui: { ...s.ui, isDirty: true },
          })),
        updateRoute: (id, patch) =>
          set((s) => ({
            spec: {
              ...s.spec,
              routes: s.spec.routes.map((r) => (r.id === id ? { ...r, ...patch } : r)),
              updatedAt: now(),
            },
            ui: { ...s.ui, isDirty: true },
          })),
        removeRoute: (id) =>
          set((s) => ({
            spec: { ...s.spec, routes: s.spec.routes.filter((r) => r.id !== id), updatedAt: now(), analysisStatus: "stale" },
            ui: { ...s.ui, isDirty: true },
          })),

        // ── Pages ──
        addPage: (page) =>
          set((s) => ({
            spec: { ...s.spec, pages: [...s.spec.pages, { ...page, id: nanoid() }], updatedAt: now() },
            ui: { ...s.ui, isDirty: true },
          })),
        updatePage: (id, patch) =>
          set((s) => ({
            spec: {
              ...s.spec,
              pages: s.spec.pages.map((p) => (p.id === id ? { ...p, ...patch } : p)),
              updatedAt: now(),
            },
            ui: { ...s.ui, isDirty: true },
          })),
        removePage: (id) =>
          set((s) => ({
            spec: { ...s.spec, pages: s.spec.pages.filter((p) => p.id !== id), updatedAt: now() },
            ui: { ...s.ui, isDirty: true },
          })),

        // ── Integrations ──
        addIntegration: (integration) =>
          set((s) => ({
            spec: {
              ...s.spec,
              integrations: [...s.spec.integrations, { ...integration, id: nanoid() }],
              updatedAt: now(),
              analysisStatus: "stale",
            },
            ui: { ...s.ui, isDirty: true },
          })),
        updateIntegration: (id, patch) =>
          set((s) => ({
            spec: {
              ...s.spec,
              integrations: s.spec.integrations.map((i) => (i.id === id ? { ...i, ...patch } : i)),
              updatedAt: now(),
            },
            ui: { ...s.ui, isDirty: true },
          })),
        removeIntegration: (id) =>
          set((s) => ({
            spec: {
              ...s.spec,
              integrations: s.spec.integrations.filter((i) => i.id !== id),
              updatedAt: now(),
              analysisStatus: "stale",
            },
            ui: { ...s.ui, isDirty: true },
          })),

        // ── Env Vars ──
        addEnvVar: (envVar) =>
          set((s) => ({
            spec: { ...s.spec, envVars: [...s.spec.envVars, { ...envVar, id: nanoid() }], updatedAt: now() },
            ui: { ...s.ui, isDirty: true },
          })),
        updateEnvVar: (id, patch) =>
          set((s) => ({
            spec: {
              ...s.spec,
              envVars: s.spec.envVars.map((e) => (e.id === id ? { ...e, ...patch } : e)),
              updatedAt: now(),
            },
            ui: { ...s.ui, isDirty: true },
          })),
        removeEnvVar: (id) =>
          set((s) => ({
            spec: { ...s.spec, envVars: s.spec.envVars.filter((e) => e.id !== id), updatedAt: now() },
            ui: { ...s.ui, isDirty: true },
          })),

        // ── Conventions ──
        setConventions: (patch) =>
          set((s) => ({
            spec: { ...s.spec, conventions: { ...s.spec.conventions, ...patch }, updatedAt: now() },
            ui: { ...s.ui, isDirty: true },
          })),
        setBuildOrder: (order) =>
          set((s) => ({ spec: { ...s.spec, buildOrder: order, updatedAt: now() }, ui: { ...s.ui, isDirty: true } })),
        addOutOfScope: (item) =>
          set((s) => ({
            spec: { ...s.spec, outOfScope: [...s.spec.outOfScope, item], updatedAt: now() },
            ui: { ...s.ui, isDirty: true },
          })),
        removeOutOfScope: (item) =>
          set((s) => ({
            spec: { ...s.spec, outOfScope: s.spec.outOfScope.filter((i) => i !== item), updatedAt: now() },
            ui: { ...s.ui, isDirty: true },
          })),

        // ── AI Analysis ──
        setGaps: (gaps) =>
          set((s) => ({
            spec: { ...s.spec, gaps, analysisStatus: "complete", lastAnalyzedAt: new Date().toISOString() },
          })),
        resolveGap: (id) =>
          set((s) => ({
            spec: {
              ...s.spec,
              gaps: s.spec.gaps.map((g) => (g.id === id ? { ...g, resolved: true } : g)),
            },
          })),
        setAnalysisStatus: (status) =>
          set((s) => ({ spec: { ...s.spec, analysisStatus: status } })),

        // ── Template ──
        loadTemplate: (partial) =>
          set((s) => ({
            spec: {
              ...createBlankSpec(),
              ...partial,
              id: nanoid(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              gaps: [],
              analysisStatus: "pending",
            },
            ui: { ...s.ui, isDirty: false, activeSection: "overview" },
          })),
        resetSpec: () =>
          set({ spec: createBlankSpec(), ui: { activeSection: "overview", previewOpen: false, analysisOpen: false, isDirty: false, isSaving: false, isExporting: false, isAnalyzing: false } }),

        // ── UI ──
        setSection: (section) => set((s) => ({ ui: { ...s.ui, activeSection: section } })),
        setPreviewOpen: (open) => set((s) => ({ ui: { ...s.ui, previewOpen: open } })),
        setAnalysisOpen: (open) => set((s) => ({ ui: { ...s.ui, analysisOpen: open } })),
        setExporting: (isExporting) => set((s) => ({ ui: { ...s.ui, isExporting } })),
        setAnalyzing: (isAnalyzing) => set((s) => ({ ui: { ...s.ui, isAnalyzing } })),
      }),
      {
        name: "specforge-spec",
        partialize: (state) => ({ spec: state.spec }), // only persist spec, not UI state
      }
    )
  )
)

function now() {
  return new Date().toISOString()
}
