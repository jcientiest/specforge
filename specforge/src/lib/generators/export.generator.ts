import JSZip from "jszip"
import type { ProjectSpec } from "@/types/spec"
import { generateClaudeMd } from "./claude-md.generator"
import { generateAllPrompts } from "./prompts.generator"

// ─── Export Engine ────────────────────────────────────────────────────────────
// Generates the complete .zip bundle from the current spec.
// Everything auto-generated — always reflects latest spec state.

export interface ExportResult {
  blob: Blob
  filename: string
  fileCount: number
  sizeKb: number
}

export async function generateExportZip(spec: ProjectSpec): Promise<ExportResult> {
  const zip = new JSZip()
  const projectSlug = slugify(spec.name || "my-project")

  // ── 1. CLAUDE.md — most important file ──────────────────────────────────────
  zip.file("CLAUDE.md", generateClaudeMd(spec))

  // ── 2. spec.json — machine-readable source of truth ─────────────────────────
  zip.file("spec.json", JSON.stringify(spec, null, 2))

  // ── 3. Module prompts ────────────────────────────────────────────────────────
  const prompts = generateAllPrompts(spec)
  const promptsFolder = zip.folder("prompts")!
  Object.entries(prompts).forEach(([filename, content]) => {
    promptsFolder.file(filename, content)
  })

  // ── 4. Scaffold — empty folder structure ─────────────────────────────────────
  const scaffoldFolder = zip.folder("scaffold")!
  generateScaffold(spec, scaffoldFolder)

  // ── 5. .env.example ──────────────────────────────────────────────────────────
  zip.file(".env.example", generateEnvExample(spec))

  // ── 6. README.md ──────────────────────────────────────────────────────────────
  zip.file("README.md", generateReadme(spec))

  // ── Generate ──────────────────────────────────────────────────────────────────
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  })

  const filename = `${projectSlug}-specforge-${formatDate(spec.updatedAt)}.zip`
  const sizeKb = Math.round(blob.size / 1024)

  // Count files
  let fileCount = 0
  zip.forEach(() => fileCount++)

  return { blob, filename, fileCount, sizeKb }
}

// ─── Scaffold Generator ───────────────────────────────────────────────────────

function generateScaffold(spec: ProjectSpec, folder: JSZip): void {
  const isNextJs = spec.stack.frontend === "nextjs"
  const hasDb = spec.stack.database !== "none"
  const hasAuth = spec.stack.auth !== "none"

  if (isNextJs) {
    // App router structure
    folder.file("src/app/layout.tsx", nextLayoutPlaceholder(spec))
    folder.file("src/app/page.tsx", nextPagePlaceholder("Home", "/"))
    folder.file("src/app/globals.css", globalsCss())
    folder.file("src/app/(auth)/login/page.tsx", nextPagePlaceholder("Login", "/(auth)/login"))
    folder.file("src/app/(auth)/register/page.tsx", nextPagePlaceholder("Register", "/(auth)/register"))
    folder.file("src/app/dashboard/page.tsx", nextPagePlaceholder("Dashboard", "/dashboard"))

    // API routes from spec
    spec.routes.forEach((route) => {
      const parts = route.path.split("/").filter(Boolean) // ['api', 'users']
      const routePath = parts.slice(1).join("/") // 'users'
      if (routePath) {
        folder.file(`src/app/api/${routePath}/route.ts`, apiRoutePlaceholder(route))
      }
    })

    // Lib files
    folder.file("src/lib/env.ts", envLibPlaceholder(spec))
    folder.file("src/lib/utils.ts", utilsPlaceholder())
    if (hasDb) folder.file("src/lib/db.ts", dbPlaceholder(spec))
    if (hasAuth) folder.file("src/lib/auth.ts", authPlaceholder(spec))

    // Middleware
    folder.file("src/middleware/error.ts", errorMiddlewarePlaceholder())
    folder.file("src/middleware.ts", nextMiddlewarePlaceholder())

    // Database
    if (hasDb && spec.stack.orm === "prisma") {
      folder.file("prisma/schema.prisma", prismaSchemaPlaceholder(spec))
      folder.file("prisma/seed.ts", prismaSeedPlaceholder())
    }

    // Tests
    folder.file("tests/unit/.gitkeep", "")
    folder.file("tests/e2e/.gitkeep", "")
    folder.file("vitest.config.ts", vitestConfig())
    folder.file("playwright.config.ts", playwrightConfig())

    // Config files
    folder.file("next.config.ts", nextConfigPlaceholder())
    folder.file("tailwind.config.ts", tailwindConfigPlaceholder())
    folder.file("tsconfig.json", tsconfigPlaceholder())
    folder.file("package.json", packageJsonPlaceholder(spec))
    folder.file(".gitignore", gitignore())
  }
}

// ─── Scaffold Templates ───────────────────────────────────────────────────────

function nextLayoutPlaceholder(spec: ProjectSpec): string {
  return `import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "${spec.name || "My App"}",
  description: "${spec.tagline || spec.description || ""}",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
`
}

function nextPagePlaceholder(name: string, path: string): string {
  return `// TODO: Implement ${name} page
// See prompts/frontend.md for implementation details

export default function ${name.replace(/\s/g, "")}Page() {
  return (
    <main>
      <h1>${name}</h1>
      <p>Path: ${path}</p>
    </main>
  )
}
`
}

function apiRoutePlaceholder(route: { method: string; path: string; description: string }): string {
  return `import { NextRequest, NextResponse } from "next/server"
// TODO: Implement ${route.method} ${route.path}
// ${route.description}
// See prompts/api.md for implementation details

export async function ${route.method}(req: NextRequest) {
  try {
    // Implementation here
    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    )
  }
}
`
}

function envLibPlaceholder(spec: ProjectSpec): string {
  const vars = spec.envVars
    .map((v) => `  ${v.key}: z.string()${!v.required ? ".optional()" : ""},`)
    .join("\n")

  return `import { z } from "zod"

// All environment variables are validated here.
// Never use process.env directly — always import from this file.

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
${vars}
})

export const env = envSchema.parse(process.env)
`
}

function dbPlaceholder(spec: ProjectSpec): string {
  return `import { PrismaClient } from "@prisma/client"

// Singleton pattern — prevents connection pool exhaustion in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
`
}

function authPlaceholder(spec: ProjectSpec): string {
  return `// Auth configuration
// Provider: ${spec.stack.auth}
// See prompts/auth.md for full implementation details

export const authConfig = {
  // TODO: Configure ${spec.stack.auth}
}
`
}

function errorMiddlewarePlaceholder(): string {
  return `import { NextResponse } from "next/server"

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function handleError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    )
  }

  console.error("Unhandled error:", error)
  return NextResponse.json(
    { success: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
    { status: 500 }
  )
}
`
}

function nextMiddlewarePlaceholder(): string {
  return `import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Auth middleware — protect routes
export function middleware(request: NextRequest) {
  // TODO: Add auth check
  // See prompts/auth.md for implementation
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
}
`
}

function prismaSchemaPlaceholder(spec: ProjectSpec): string {
  const models = spec.entities
    .map(
      (entity) =>
        `model ${entity.name} {
  id        String   @id @default(cuid())
${entity.fields
  .map((f) => `  ${f.name.padEnd(14)} ${mapFieldType(f.type)}${!f.required ? "?" : ""}`)
  .join("\n")}${entity.timestamps ? "\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt" : ""}${entity.softDelete ? "\n  deletedAt DateTime?" : ""}
}`
    )
    .join("\n\n")

  return `// This is your Prisma schema file.
// See prompts/database.md for full implementation details.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${spec.stack.database === "postgresql" ? "postgresql" : spec.stack.database}"
  url      = env("DATABASE_URL")
}

${models || "// TODO: Add your models here — see spec.json for the data model"}
`
}

function prismaSeedPlaceholder(): string {
  return `import { db } from "../src/lib/db"

async function main() {
  // TODO: Add seed data
  console.log("Seeding database...")
  console.log("Done.")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
`
}

function utilsPlaceholder(): string {
  return `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(date))
}
`
}

function vitestConfig(): string {
  return `import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
})
`
}

function playwrightConfig(): string {
  return `import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: !process.env.CI },
})
`
}

function nextConfigPlaceholder(): string {
  return `import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: { typedRoutes: true },
}

export default nextConfig
`
}

function tailwindConfigPlaceholder(): string {
  return `import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}

export default config
`
}

function tsconfigPlaceholder(): string {
  return JSON.stringify({
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./src/*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
    exclude: ["node_modules"],
  }, null, 2)
}

function packageJsonPlaceholder(spec: ProjectSpec): string {
  return JSON.stringify({
    name: slugify(spec.name || "my-app"),
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      test: "vitest",
      "test:e2e": "playwright test",
      "db:push": "prisma db push",
      "db:seed": "tsx prisma/seed.ts",
      "db:studio": "prisma studio",
    },
    dependencies: {
      next: "15.1.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
      zod: "^3.24.1",
      "next-auth": "^5.0.0",
      "@prisma/client": "^6.0.0",
      clsx: "^2.1.1",
      "tailwind-merge": "^2.6.0",
      "lucide-react": "^0.468.0",
    },
    devDependencies: {
      "@types/node": "^22",
      "@types/react": "^19",
      typescript: "^5",
      tailwindcss: "^3.4.1",
      prisma: "^6.0.0",
      vitest: "^2.0.0",
      "@playwright/test": "^1.49.0",
      tsx: "^4.0.0",
    },
  }, null, 2)
}

function globalsCss(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;
`
}

function gitignore(): string {
  return `# Dependencies
node_modules/
.pnp
.pnp.js

# Next.js
.next/
out/

# Production
build/
dist/

# Environment
.env
.env.local
.env.*.local

# Database
*.db
*.sqlite

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/

# Prisma
prisma/migrations/
`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateEnvExample(spec: ProjectSpec): string {
  const lines = [
    "# Generated by SpecForge",
    "# Copy this file to .env.local and fill in your values",
    "",
    "NODE_ENV=development",
    "DATABASE_URL=postgresql://user:password@localhost:5432/mydb",
    "NEXTAUTH_SECRET=your-secret-here",
    "NEXTAUTH_URL=http://localhost:3000",
    "",
  ]

  if (spec.envVars.length > 0) {
    lines.push("# Project-specific variables")
    spec.envVars.forEach((v) => {
      lines.push(`# ${v.description}${!v.required ? " (optional)" : ""}`)
      lines.push(`${v.key}=${v.example || ""}`)
      lines.push("")
    })
  }

  return lines.join("\n")
}

function generateReadme(spec: ProjectSpec): string {
  return `# ${spec.name || "My Project"}

${spec.tagline || ""}

${spec.description || ""}

## Getting started

\`\`\`bash
# Install dependencies
npm install

# Copy env vars
cp .env.example .env.local
# Fill in your values in .env.local

# Set up database
npx prisma migrate dev

# Start development server
npm run dev
\`\`\`

## Stack

- **Framework:** ${spec.stack.frontend} + ${spec.stack.language}
- **Styling:** ${spec.stack.styling}
- **Database:** ${spec.stack.database} via ${spec.stack.orm}
- **Auth:** ${spec.stack.auth}
- **Deploy:** ${spec.stack.deployment}

## How this was built

This project was scaffolded with [SpecForge](https://specforge.dev).
Upload \`CLAUDE.md\` to Claude and type \`continue\` to build.

---

_Generated by SpecForge v${spec.version}_
`
}

function mapFieldType(type: string): string {
  const map: Record<string, string> = {
    string: "String",
    number: "Int",
    boolean: "Boolean",
    date: "DateTime",
    uuid: "String",
    email: "String",
    url: "String",
    text: "String",
    json: "Json",
    enum: "String",
  }
  return map[type] || "String"
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function formatDate(isoString: string): string {
  return new Date(isoString).toISOString().split("T")[0]
}
