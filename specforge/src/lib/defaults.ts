import type { SpecStack, SpecConventions } from "@/types/spec"

export const DEFAULT_STACK: SpecStack = {
  frontend: "nextjs",
  language: "typescript",
  styling: "tailwind",
  database: "postgresql",
  orm: "prisma",
  auth: "nextauth",
  deployment: "vercel",
}

export const DEFAULT_CONVENTIONS: SpecConventions = {
  folderStructure: "feature-based",
  errorHandling: "All errors handled via middleware/error.ts — never throw raw errors to the client",
  envVarPattern: "All env vars accessed via lib/env.ts with Zod validation — never use process.env directly",
  apiResponseShape: '{ success: boolean, data?: T, error?: { code: string, message: string } }',
  testingApproach: "Vitest for unit tests, Playwright for E2E — test files colocated with source",
  namingConvention: "camelCase",
}

export const BUILD_ORDER_OPTIONS = [
  "auth",
  "database",
  "api",
  "frontend",
  "integrations",
  "testing",
  "deployment",
]
