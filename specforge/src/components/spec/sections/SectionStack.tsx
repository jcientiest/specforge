"use client"

import { useSpecStore } from "@/store/spec.store"

export function SectionStack() {
  const { spec, setStack } = useSpecStore()
  const { stack } = spec

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Tech stack</h2>
        <p className="text-sm text-muted-foreground">
          All decisions here go directly into the CLAUDE.md and every generated prompt.
        </p>
      </div>

      <div className="space-y-6">
        <StackGroup label="Frontend">
          <RadioGroup
            value={stack.frontend}
            onChange={(v) => setStack({ frontend: v as any })}
            options={[
              { value: "nextjs",  label: "Next.js 15",  hint: "App Router + RSC" },
              { value: "react",   label: "React",        hint: "Vite + SPA" },
              { value: "vue",     label: "Vue 3",        hint: "Composition API" },
              { value: "nuxt",    label: "Nuxt 3",       hint: "Vue SSR" },
            ]}
          />
        </StackGroup>

        <StackGroup label="Language">
          <RadioGroup
            value={stack.language}
            onChange={(v) => setStack({ language: v as any })}
            options={[
              { value: "typescript", label: "TypeScript", hint: "Strongly recommended" },
              { value: "javascript", label: "JavaScript",  hint: "" },
            ]}
          />
        </StackGroup>

        <StackGroup label="Styling">
          <RadioGroup
            value={stack.styling}
            onChange={(v) => setStack({ styling: v as any })}
            options={[
              { value: "tailwind",           label: "Tailwind CSS",      hint: "Utility-first" },
              { value: "css-modules",        label: "CSS Modules",       hint: "Scoped CSS" },
              { value: "styled-components",  label: "Styled Components", hint: "CSS-in-JS" },
            ]}
          />
        </StackGroup>

        <StackGroup label="Database">
          <RadioGroup
            value={stack.database}
            onChange={(v) => setStack({ database: v as any })}
            options={[
              { value: "postgresql", label: "PostgreSQL", hint: "Recommended" },
              { value: "mysql",      label: "MySQL",      hint: "" },
              { value: "mongodb",    label: "MongoDB",    hint: "Document DB" },
              { value: "sqlite",     label: "SQLite",     hint: "Dev / simple apps" },
              { value: "none",       label: "None",       hint: "No database" },
            ]}
          />
        </StackGroup>

        {stack.database !== "none" && (
          <StackGroup label="ORM">
            <RadioGroup
              value={stack.orm}
              onChange={(v) => setStack({ orm: v as any })}
              options={[
                { value: "prisma",  label: "Prisma",  hint: "Type-safe, migrations" },
                { value: "drizzle", label: "Drizzle", hint: "Lightweight, fast" },
                { value: "none",    label: "None",    hint: "Raw SQL" },
              ]}
            />
          </StackGroup>
        )}

        <StackGroup label="Authentication">
          <RadioGroup
            value={stack.auth}
            onChange={(v) => setStack({ auth: v as any })}
            options={[
              { value: "nextauth",   label: "NextAuth v5",  hint: "Recommended" },
              { value: "clerk",      label: "Clerk",         hint: "Hosted auth" },
              { value: "magic-link", label: "Magic link",   hint: "Email only" },
              { value: "email",      label: "Email/password", hint: "Custom" },
              { value: "none",       label: "None",          hint: "No auth" },
            ]}
          />
        </StackGroup>

        <StackGroup label="Deployment">
          <RadioGroup
            value={stack.deployment}
            onChange={(v) => setStack({ deployment: v as any })}
            options={[
              { value: "vercel",  label: "Vercel",   hint: "Easiest for Next.js" },
              { value: "railway", label: "Railway",  hint: "Full-stack" },
              { value: "docker",  label: "Docker",   hint: "Self-hosted" },
              { value: "custom",  label: "Custom",   hint: "" },
            ]}
          />
        </StackGroup>
      </div>
    </div>
  )
}

function StackGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </div>
      {children}
    </div>
  )
}

function RadioGroup({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string; hint?: string }[]
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
            value === opt.value
              ? "border-[hsl(var(--brand))] bg-[hsl(var(--brand-muted))] text-[hsl(var(--brand))]"
              : "border-border hover:border-[hsl(var(--brand))]/40 hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="font-medium">{opt.label}</span>
          {opt.hint && (
            <span className={`ml-1.5 text-xs ${value === opt.value ? "text-[hsl(var(--brand))]/70" : "text-muted-foreground/70"}`}>
              {opt.hint}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
