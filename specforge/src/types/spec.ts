// ─── Core Spec Type ───────────────────────────────────────────────────────────
// This is the single source of truth. Every UI component reads from and writes
// to this shape. The export bundle is generated entirely from this object.

export type ProjectType =
  | "saas"
  | "marketplace"
  | "blog"
  | "api"
  | "ecommerce"
  | "portfolio"
  | "blank"

export type AuthType = "none" | "email" | "oauth" | "magic-link" | "clerk" | "nextauth"

export type DatabaseType = "none" | "postgresql" | "mysql" | "mongodb" | "sqlite"

export type OrmType = "none" | "prisma" | "drizzle"

export type DeployTarget = "vercel" | "railway" | "docker" | "custom"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "uuid"
  | "email"
  | "url"
  | "text"
  | "json"
  | "enum"

// ─── Building Blocks ──────────────────────────────────────────────────────────

export interface SpecField {
  id: string
  name: string
  type: FieldType
  required: boolean
  unique?: boolean
  default?: string
  enumValues?: string[]
  notes?: string
}

export interface SpecEntity {
  id: string
  name: string
  description?: string
  fields: SpecField[]
  timestamps: boolean // createdAt, updatedAt
  softDelete: boolean // deletedAt
}

export interface SpecRoute {
  id: string
  method: HttpMethod
  path: string
  description: string
  auth: boolean
  roles?: string[]
  requestBody?: string
  responseShape?: string
  notes?: string
}

export interface SpecPage {
  id: string
  name: string
  path: string
  description: string
  auth: boolean
  components?: string[]
}

export interface SpecIntegration {
  id: string
  name: string
  provider: string
  purpose: string
  envVars: string[]
}

export interface SpecFeature {
  id: string
  name: string
  description: string
  priority: "must" | "should" | "could"
  status: "planned" | "in-progress" | "done"
}

export interface SpecEnvVar {
  id: string
  key: string
  description: string
  required: boolean
  example?: string
}

// ─── Stack Config ─────────────────────────────────────────────────────────────

export interface SpecStack {
  frontend: "nextjs" | "react" | "vue" | "nuxt"
  language: "typescript" | "javascript"
  styling: "tailwind" | "css-modules" | "styled-components"
  database: DatabaseType
  orm: OrmType
  auth: AuthType
  deployment: DeployTarget
}

// ─── Conventions ──────────────────────────────────────────────────────────────

export interface SpecConventions {
  folderStructure: "feature-based" | "layer-based"
  errorHandling: string
  envVarPattern: string
  apiResponseShape: string
  testingApproach: string
  namingConvention: "camelCase" | "kebab-case" | "snake_case"
}

// ─── The Complete Spec ────────────────────────────────────────────────────────

export interface ProjectSpec {
  // Meta
  id: string
  createdAt: string
  updatedAt: string
  version: string // semver — bumped on every meaningful change

  // Identity
  name: string
  tagline: string
  description: string
  type: ProjectType

  // Stack
  stack: SpecStack

  // Architecture
  entities: SpecEntity[]
  routes: SpecRoute[]
  pages: SpecPage[]
  integrations: SpecIntegration[]
  features: SpecFeature[]
  envVars: SpecEnvVar[]

  // Build contract
  conventions: SpecConventions
  buildOrder: string[] // module names in order Claude should build them
  outOfScope: string[] // explicit list of what NOT to build

  // AI analysis
  gaps: SpecGap[]
  analysisStatus: "pending" | "analyzing" | "complete" | "stale"
  lastAnalyzedAt?: string
}

export interface SpecGap {
  id: string
  severity: "error" | "warning" | "suggestion"
  section: string
  message: string
  suggestion?: string
  resolved: boolean
}

// ─── Template Shape ───────────────────────────────────────────────────────────

export interface SpecTemplate {
  id: string
  name: string
  description: string
  type: ProjectType
  icon: string
  tags: string[]
  spec: Omit<ProjectSpec, "id" | "createdAt" | "updatedAt" | "gaps" | "analysisStatus">
}

// ─── UI State (not persisted in spec) ─────────────────────────────────────────

export type BuilderSection =
  | "overview"
  | "stack"
  | "features"
  | "entities"
  | "routes"
  | "pages"
  | "integrations"
  | "env"
  | "conventions"
  | "review"

export interface BuilderUIState {
  activeSection: BuilderSection
  previewOpen: boolean
  analysisOpen: boolean
  isDirty: boolean
  isSaving: boolean
  isExporting: boolean
  isAnalyzing: boolean
}
