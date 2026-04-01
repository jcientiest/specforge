import type { ProjectSpec } from "@/types/spec"

// ─── Prompt Generators ────────────────────────────────────────────────────────
// Each function generates a focused prompt file for one build module.
// These live in prompts/ folder inside the exported zip.

export function generateAuthPrompt(spec: ProjectSpec): string {
  if (spec.stack.auth === "none") return "# Auth\nThis project does not use authentication."

  return `# Module: Authentication

## Context
Project: ${spec.name}
Stack: ${spec.stack.frontend} + ${spec.stack.language}
Auth provider: ${spec.stack.auth}
Database: ${spec.stack.database} via ${spec.stack.orm}

## What to build

Implement complete authentication using **${spec.stack.auth}**.

### Requirements
- Sign up with email/password
- Sign in with email/password  
- Session management
- Protected route middleware
- Auth helper hooks for client components
- User profile in database (link auth user to db User entity)

### Files to create
- \`lib/auth.ts\` — Auth configuration and server-side helpers
- \`middleware.ts\` — Route protection at the edge
- \`app/(auth)/login/page.tsx\` — Login page
- \`app/(auth)/register/page.tsx\` — Register page
- \`components/auth/\` — Auth form components

### Conventions
- ${spec.conventions.errorHandling}
- ${spec.conventions.envVarPattern}
- Redirect to dashboard after successful auth
- Show clear validation errors on form fields

## When complete
Confirm: "Auth module complete" and move to the next module in CLAUDE.md.
`
}

export function generateDatabasePrompt(spec: ProjectSpec): string {
  if (spec.stack.database === "none") return "# Database\nThis project does not use a database."

  const entityList = spec.entities.map((e) => `- ${e.name}: ${e.description || "see spec.json"}`).join("\n")

  return `# Module: Database

## Context
Project: ${spec.name}
Database: ${spec.stack.database}
ORM: ${spec.stack.orm}

## What to build

Set up the complete database layer.

### Entities to model
${entityList || "See spec.json for the complete data model."}

### Files to create
- \`prisma/schema.prisma\` — Complete Prisma schema with all entities
- \`lib/db.ts\` — Prisma client singleton (prevents connection pool exhaustion in dev)
- \`prisma/seed.ts\` — Seed script with realistic sample data
- \`prisma/migrations/\` — Run \`npx prisma migrate dev --name init\`

### Schema requirements
- All entities from spec.json must be modelled
- Add proper indexes on foreign keys and frequently queried fields
- Use UUIDs as primary keys (cuid() in Prisma)
- All relations properly typed with referential integrity

### Conventions
- ${spec.conventions.envVarPattern}
- Database URL in \`DATABASE_URL\` env var
- Never import PrismaClient directly — always use \`lib/db.ts\` singleton

## When complete
Confirm: "Database module complete" and move to the next module in CLAUDE.md.
`
}

export function generateApiPrompt(spec: ProjectSpec): string {
  const routeList = spec.routes
    .map((r) => `- ${r.method} ${r.path} — ${r.description} (${r.auth ? "authenticated" : "public"})`)
    .join("\n")

  return `# Module: API Routes

## Context
Project: ${spec.name}
Framework: ${spec.stack.frontend} App Router
Response shape: \`${spec.conventions.apiResponseShape}\`

## What to build

Implement all API route handlers.

### Routes to implement
${routeList || "See spec.json for the complete route list."}

### Every route must
- Return the standard response shape: \`${spec.conventions.apiResponseShape}\`
- Validate request body/params with Zod schemas
- Handle auth (check session for protected routes)
- ${spec.conventions.errorHandling}
- Return appropriate HTTP status codes

### Files to create
For each route, create \`app/api/[resource]/route.ts\`

### Conventions
- Colocate Zod schemas with their route files
- Extract business logic into \`lib/\` services — keep route handlers thin
- Log errors server-side, return generic messages to client

## When complete
Confirm: "API module complete" and move to the next module in CLAUDE.md.
`
}

export function generateFrontendPrompt(spec: ProjectSpec): string {
  const pageList = spec.pages
    .map((p) => `- ${p.name} (${p.path}) — ${p.description} (${p.auth ? "requires auth" : "public"})`)
    .join("\n")

  return `# Module: Frontend

## Context
Project: ${spec.name}
Framework: ${spec.stack.frontend}
Styling: ${spec.stack.styling}
Language: ${spec.stack.language}

## What to build

Implement all pages and UI components.

### Pages to build
${pageList || "See spec.json for the complete page list."}

### Requirements
- Responsive layout — mobile-first
- Loading states for all async operations
- Error states and empty states for all data lists
- Proper \`<head>\` metadata on each page
- Accessible — semantic HTML, ARIA labels where needed

### Component conventions
- Server components by default — add \`"use client"\` only when needed
- Use shadcn/ui base components from \`components/ui/\`
- Custom components in \`components/shared/\`
- All API calls go through typed fetch helpers in \`lib/api.ts\`

### Styling
- Tailwind CSS utility classes only
- No inline styles
- Dark mode support via \`dark:\` variants

## When complete
Confirm: "Frontend module complete" and move to the next module in CLAUDE.md.
`
}

export function generateTestingPrompt(spec: ProjectSpec): string {
  return `# Module: Testing

## Context
Project: ${spec.name}
Testing: ${spec.conventions.testingApproach}

## What to build

Write tests for critical paths.

### Unit tests (Vitest)
- All utility functions in \`lib/\`
- All Zod validation schemas
- Auth helper functions

### Integration tests
- All API routes — test happy path and error cases
- Database operations — test CRUD for each entity

### E2E tests (Playwright)
- Auth flow: register → login → protected page → logout
- Core user journey for the main feature of the app

### Setup files
- \`vitest.config.ts\`
- \`playwright.config.ts\`
- \`tests/setup.ts\` — Test database setup/teardown

## When complete
Confirm: "Testing module complete. Build is done."
Run \`npm test\` and confirm all tests pass before confirming.
`
}

// ─── All prompts map ──────────────────────────────────────────────────────────

export function generateAllPrompts(spec: ProjectSpec): Record<string, string> {
  const prompts: Record<string, string> = {}

  spec.buildOrder.forEach((module) => {
    switch (module) {
      case "auth":
        prompts[`auth.md`] = generateAuthPrompt(spec)
        break
      case "database":
        prompts[`database.md`] = generateDatabasePrompt(spec)
        break
      case "api":
        prompts[`api.md`] = generateApiPrompt(spec)
        break
      case "frontend":
        prompts[`frontend.md`] = generateFrontendPrompt(spec)
        break
      case "testing":
        prompts[`testing.md`] = generateTestingPrompt(spec)
        break
      default:
        prompts[`${module}.md`] = `# Module: ${module}\n\nSee spec.json for details.`
    }
  })

  return prompts
}
