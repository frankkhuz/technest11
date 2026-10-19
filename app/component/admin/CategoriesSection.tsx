"use client";

import { useCallback, useEffect, useState } from "react";
import { FolderTree, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { apiJson, jsonBody } from "@/app/lib/api";
import type { Category, CategoryAttribute } from "@/app/types/backend";
import { Button, Modal, Field, ErrorText, Pill, Notice, fieldClass, fieldStyle } from "@/app/component/ui/kit";
import { SectionBody, ListState, RefreshButton, adminInput } from "./shared";

const ATTR_TYPES: CategoryAttribute["type"][] = ["select", "multiselect", "number", "boolean", "text"];

type AttrDraft = { key: string; label: string; type: CategoryAttribute["type"]; options: string; unit: string; filterable: boolean };

const toDraft = (a: CategoryAttribute): AttrDraft => ({
  key: a.key,
  label: a.label,
  type: a.type,
  options: (a.options ?? []).join(", "),
  unit: a.unit ?? "",
  filterable: a.filterable !== false,
});

const fromDraft = (d: AttrDraft): CategoryAttribute => ({
  key: d.key.trim(),
  label: d.label.trim(),
  type: d.type,
  options: d.type === "select" || d.type === "multiselect" ? d.options.split(",").map((o) => o.trim()).filter(Boolean) : undefined,
  unit: d.unit.trim() || undefined,
  filterable: d.filterable,
});

function CategoryEditor({
  category,
  parents,
  onClose,
  onSaved,
}: {
  category: Category | null;
  parents: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !category;
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [name, setName] = useState(category?.name ?? "");
  const [parent, setParent] = useState(category?.parent ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [order, setOrder] = useState(String(category?.order ?? ""));
  const [attrs, setAttrs] = useState<AttrDraft[]>((category?.attributes ?? []).map(toDraft));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAttr = (i: number, patch: Partial<AttrDraft>) => setAttrs((xs) => xs.map((a, j) => (j === i ? { ...a, ...patch } : a)));

  const save = async () => {
    if (!name.trim() || (isNew && !/^[a-z0-9-]+$/.test(slug))) return setError("Name and a slug (lowercase-with-dashes) are needed.");
    if (attrs.some((a) => !a.key.trim() || !a.label.trim())) return setError("Every filter needs a key and a label.");
    setSaving(true);
    setError(null);
    const body = {
      name: name.trim(),
      parent: parent || null,
      description: description.trim() || undefined,
      order: order === "" ? undefined : Number(order),
      attributes: attrs.map(fromDraft),
    };
    const r = isNew
      ? await apiJson("/api/categories/admin", jsonBody({ ...body, slug, parent: parent || undefined }))
      : await apiJson(`/api/categories/admin/${category!.slug}`, { method: "PATCH", body: JSON.stringify(body) });
    setSaving(false);
    if (!r.ok) return setError(r.message);
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title={isNew ? "Add a category" : `Edit ${category!.name}`} Icon={FolderTree} width="max-w-2xl">
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} style={fieldStyle} />
          </Field>
          <Field label="Slug" hint={isNew ? "Can't be changed later — products point at it." : "Fixed"}>
            <input value={slug} disabled={!isNew} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className={fieldClass} style={fieldStyle} />
          </Field>
          <Field label="Parent group" optional>
            <select value={parent} onChange={(e) => setParent(e.target.value)} className={fieldClass} style={fieldStyle}>
              <option value="">— Top level —</option>
              {parents
                .filter((p) => p.slug !== category?.slug)
                .map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Menu order" optional>
            <input value={order} onChange={(e) => setOrder(e.target.value.replace(/\D/g, ""))} className={fieldClass} style={fieldStyle} />
          </Field>
        </div>
        <Field label="Description" optional>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className={fieldClass} style={fieldStyle} />
        </Field>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold" style={{ color: "var(--ink)" }}>
              Filters ({attrs.length})
            </p>
            <button
              onClick={() => setAttrs((xs) => [...xs, { key: "", label: "", type: "select", options: "", unit: "", filterable: true }])}
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{ color: "var(--accent)" }}
            >
              <Plus className="w-3.5 h-3.5" /> Add filter
            </button>
          </div>
          {!isNew && <Notice tone="neutral">Saving replaces the whole filter list. Removing a filter doesn&apos;t touch products.</Notice>}
          <div className="space-y-2 mt-2">
            {attrs.map((a, i) => (
              <div key={i} className="rounded-xl p-3 grid grid-cols-2 sm:grid-cols-6 gap-2" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                <input value={a.key} onChange={(e) => setAttr(i, { key: e.target.value.replace(/\s/g, "") })} placeholder="key" className={`${adminInput} font-mono-tech`} style={fieldStyle} />
                <input value={a.label} onChange={(e) => setAttr(i, { label: e.target.value })} placeholder="Label" className={`${adminInput} sm:col-span-2`} style={fieldStyle} />
                <select value={a.type} onChange={(e) => setAttr(i, { type: e.target.value as CategoryAttribute["type"] })} className={adminInput} style={fieldStyle}>
                  {ATTR_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <input value={a.unit} onChange={(e) => setAttr(i, { unit: e.target.value })} placeholder="unit" className={adminInput} style={fieldStyle} />
                <div className="flex items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-1 text-[11px]" style={{ color: "var(--ink-soft)" }}>
                    <input type="checkbox" checked={a.filterable} onChange={(e) => setAttr(i, { filterable: e.target.checked })} /> filter
                  </label>
                  <button onClick={() => setAttrs((xs) => xs.filter((_, j) => j !== i))} aria-label="Remove filter" style={{ color: "#DC2626" }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {(a.type === "select" || a.type === "multiselect") && (
                  <input
                    value={a.options}
                    onChange={(e) => setAttr(i, { options: e.target.value })}
                    placeholder="Options, comma separated"
                    className={`${adminInput} col-span-2 sm:col-span-6`}
                    style={fieldStyle}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <ErrorText>{error}</ErrorText>
        <Button onClick={save} loading={saving} full>
          {isNew ? "Add category" : "Save changes"}
        </Button>
      </div>
    </Modal>
  );
}

export default function CategoriesSection() {
  const [tree, setTree] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null | "new">(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiJson<{ categories: Category[] }>("/api/categories?all=true");
    setError(r.ok ? null : r.message);
    setTree(r.data?.categories ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  const toggleActive = async (c: Category) => {
    const r = await apiJson(`/api/categories/admin/${c.slug}`, { method: "PATCH", body: JSON.stringify({ isActive: c.isActive === false }) });
    if (!r.ok) return window.alert(r.message);
    load();
  };

  const Row = ({ c, child }: { c: Category; child?: boolean }) => (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2.5 ${child ? "pl-10" : ""}`}
      style={{ borderTop: "1px solid var(--border)", opacity: c.isActive === false ? 0.55 : 1 }}
    >
      <div className="min-w-0">
        <p className={`text-sm ${child ? "" : "font-semibold"}`} style={{ color: "var(--ink)" }}>
          {c.name}{" "}
          <span className="font-mono-tech text-[11px]" style={{ color: "var(--ink-soft)" }}>
            {c.slug}
          </span>
        </p>
        {!!c.attributes?.length && (
          <p className="text-[11px] truncate" style={{ color: "var(--ink-soft)" }}>
            Filters: {c.attributes.map((a) => a.label).join(", ")}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {c.isActive === false && <Pill tone="neutral" size="xs">Hidden</Pill>}
        <button onClick={() => toggleActive(c)} aria-label={c.isActive === false ? "Show" : "Hide"} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--ink-soft)" }}>
          {c.isActive === false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => setEditing(c)} aria-label="Edit" className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--accent)" }}>
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <SectionBody width="max-w-3xl">
      <div className="flex items-center justify-between gap-2 mb-4">
        <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
          Categories and their filters drive the /buy menu and filter row — no deploy needed.
        </p>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={load} />
          <Button size="sm" Icon={Plus} onClick={() => setEditing("new")}>
            Add
          </Button>
        </div>
      </div>
      <ListState loading={loading} error={error} empty={tree.length === 0} EmptyIcon={FolderTree} emptyText="No categories yet">
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderTop: "none" }}>
          {tree.map((c) => (
            <div key={c.slug}>
              <Row c={c} />
              {(c.children ?? []).map((k) => (
                <Row key={k.slug} c={k} child />
              ))}
            </div>
          ))}
        </div>
      </ListState>
      {editing && (
        <CategoryEditor
          category={editing === "new" ? null : editing}
          parents={tree}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </SectionBody>
  );
}
