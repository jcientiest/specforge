"use client"

import { useSpecStore } from "@/store/spec.store"

export function SectionOverview() {
  const { spec, setName, setTagline, setDescription, setType } = useSpecStore()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Start with the basics. What are you building and why?
        </p>
      </div>

      <div className="space-y-5">
        <Field label="Project name" required>
          <input
            type="text"
            placeholder="My SaaS App"
            value={spec.name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Tagline" hint="One sentence — what it does">
          <input
            type="text"
            placeholder="The easiest way to manage your team's projects"
            value={spec.tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Description" hint="More detail — what problem it solves, who it's for">
          <textarea
            rows={4}
            placeholder="Describe your project in a few sentences. Claude will use this to understand context when building."
            value={spec.description}
            onChange={(e) => setDescription(e.target.value)}
            className="input resize-none"
          />
        </Field>

        <Field label="Project type">
          <div className="grid grid-cols-3 gap-2">
            {PROJECT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setType(type.value as any)}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors text-left ${
                  spec.type === type.value
                    ? "border-[hsl(var(--brand))] bg-[hsl(var(--brand-muted))] text-[hsl(var(--brand))]"
                    : "border-border hover:border-[hsl(var(--brand))]/50 hover:bg-muted"
                }`}
              >
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </Field>
      </div>
    </div>
  )
}

function Field({ label, hint, required, children }: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  )
}

const PROJECT_TYPES = [
  { value: "saas",        label: "SaaS" },
  { value: "marketplace", label: "Marketplace" },
  { value: "blog",        label: "Blog / CMS" },
  { value: "api",         label: "API" },
  { value: "ecommerce",   label: "E-commerce" },
  { value: "portfolio",   label: "Portfolio" },
  { value: "blank",       label: "Other" },
]
