"use client"

import { useState } from "react"
import { Plus, Trash2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from "lucide-react"
import { nanoid } from "nanoid"
import { useSpecStore } from "@/store/spec.store"
import type { SpecEntity, SpecField, FieldType } from "@/types/spec"

const FIELD_TYPES: FieldType[] = ["string", "number", "boolean", "date", "uuid", "email", "url", "text", "json", "enum"]

export function SectionEntities() {
  const { spec, addEntity, updateEntity, removeEntity } = useSpecStore()
  const [expanded, setExpanded] = useState<string | null>(spec.entities[0]?.id ?? null)

  function handleAddEntity() {
    const newEntity: Omit<SpecEntity, "id"> = {
      name: "NewEntity",
      description: "",
      fields: [
        { id: nanoid(), name: "name", type: "string", required: true },
      ],
      timestamps: true,
      softDelete: false,
    }
    addEntity(newEntity)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Data model</h2>
        <p className="text-sm text-muted-foreground">
          Define your entities and their fields. Claude generates the Prisma schema and all CRUD operations from this.
        </p>
      </div>

      <div className="space-y-3">
        {spec.entities.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-xl">
            No entities yet — add your first model below
          </div>
        )}
        {spec.entities.map((entity) => (
          <EntityCard
            key={entity.id}
            entity={entity}
            isExpanded={expanded === entity.id}
            onToggle={() => setExpanded(expanded === entity.id ? null : entity.id)}
            onUpdate={(patch) => updateEntity(entity.id, patch)}
            onRemove={() => removeEntity(entity.id)}
          />
        ))}
      </div>

      <button
        onClick={handleAddEntity}
        className="w-full flex items-center justify-center gap-2 py-3 border border-dashed rounded-xl text-sm text-muted-foreground hover:text-[hsl(var(--brand))] hover:border-[hsl(var(--brand))]/50 hover:bg-[hsl(var(--brand-muted))]/50 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add entity
      </button>
    </div>
  )
}

function EntityCard({ entity, isExpanded, onToggle, onUpdate, onRemove }: {
  entity: SpecEntity
  isExpanded: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<SpecEntity>) => void
  onRemove: () => void
}) {
  function addField() {
    const field: SpecField = { id: nanoid(), name: "newField", type: "string", required: true }
    onUpdate({ fields: [...entity.fields, field] })
  }

  function updateField(fieldId: string, patch: Partial<SpecField>) {
    onUpdate({ fields: entity.fields.map((f) => f.id === fieldId ? { ...f, ...patch } : f) })
  }

  function removeField(fieldId: string) {
    onUpdate({ fields: entity.fields.filter((f) => f.id !== fieldId) })
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
        onClick={onToggle}
      >
        <div className="flex-1 flex items-center gap-3">
          <input
            type="text"
            value={entity.name}
            onChange={(e) => { e.stopPropagation(); onUpdate({ name: e.target.value }) }}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-sm bg-transparent border-none outline-none"
          />
          <span className="text-xs text-muted-foreground">{entity.fields.length} fields</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground/50 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded */}
      {isExpanded && (
        <div className="border-t px-4 py-4 space-y-4 bg-muted/20">
          {/* Description */}
          <input
            type="text"
            placeholder="Description (optional)"
            value={entity.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="input text-xs"
          />

          {/* Flags */}
          <div className="flex gap-4">
            <Toggle
              label="Timestamps"
              hint="createdAt, updatedAt"
              value={entity.timestamps}
              onChange={(v) => onUpdate({ timestamps: v })}
            />
            <Toggle
              label="Soft delete"
              hint="deletedAt"
              value={entity.softDelete}
              onChange={(v) => onUpdate({ softDelete: v })}
            />
          </div>

          {/* Fields */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-12 gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-2 text-center">Required</div>
              <div className="col-span-2 text-center">Unique</div>
              <div className="col-span-1" />
            </div>
            {entity.fields.map((field) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                    className="input text-xs py-1.5"
                  />
                </div>
                <div className="col-span-3">
                  <select
                    value={field.type}
                    onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                    className="input text-xs py-1.5 appearance-none cursor-pointer"
                  >
                    {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-2 flex justify-center">
                  <input type="checkbox" checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    className="w-3.5 h-3.5 cursor-pointer accent-[hsl(var(--brand))]"
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  <input type="checkbox" checked={!!field.unique}
                    onChange={(e) => updateField(field.id, { unique: e.target.checked })}
                    className="w-3.5 h-3.5 cursor-pointer accent-[hsl(var(--brand))]"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button onClick={() => removeField(field.id)}
                    className="p-1 hover:bg-destructive/10 hover:text-destructive text-muted-foreground/40 rounded transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addField}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[hsl(var(--brand))] transition-colors mt-2"
            >
              <Plus className="w-3 h-3" />
              Add field
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Toggle({ label, hint, value, onChange }: {
  label: string; hint?: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition-colors ${
        value
          ? "border-[hsl(var(--brand))]/40 bg-[hsl(var(--brand-muted))] text-[hsl(var(--brand))]"
          : "border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      {value ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
      <span className="font-medium">{label}</span>
      {hint && <span className="text-[10px] opacity-60">{hint}</span>}
    </button>
  )
}
