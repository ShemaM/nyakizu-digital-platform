"use client";

import { useEffect, useState } from "react";
import { Plus, Tag, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/Toast";
import { categories, type ApiCategory, ApiError } from "@/lib/api";

export default function TaxonomyPage() {
  const { toast } = useToast();
  const [categoryList, setCategoryList] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ApiCategory | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await categories.list();
      setCategoryList(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError(err instanceof ApiError ? err.message : "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  };

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || saving) return;
    try {
      setSaving(true);
      const created = await categories.create(newName.trim());
      setCategoryList((prev) => [...prev, created]);
      setNewName("");
      setAdding(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add category.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!editing || !editName.trim() || saving) return;
    try {
      setSaving(true);
      const updated = await categories.update(editing.id, editName.trim());
      setCategoryList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditing(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to rename category.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AppShell title="Categories">
        <PageSkeleton showKPIs={false} listCount={5} />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Categories"
      headerRight={
        <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
          <Plus size={14} /> Add
        </Button>
      }
    >
      {error ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <p className="text-body text-text-muted">{error}</p>
          <Button onClick={load} size="sm" variant="outline">
            <RefreshCw size={14} className="mr-1.5" /> Retry
          </Button>
        </div>
      ) : (
        <>
          {adding && (
            <form onSubmit={addCategory} className="bg-white border-2 border-role/20 rounded-xl p-4 space-y-3 mb-3">
              <p className="text-body font-medium text-text-secondary">New category</p>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Power Banks"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-body focus:outline-none focus:ring-2 focus:ring-info"
                autoFocus
              />
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={() => setAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="flex-1" disabled={!newName.trim()} loading={saving}>
                  Add category
                </Button>
              </div>
            </form>
          )}

          <section className="space-y-2">
            <h2 className="text-label px-1">
              Product categories ({categoryList.length})
            </h2>
            {categoryList.map((cat) => (
              <Card key={cat.id}>
                <div className="flex items-center gap-3">
                  <Tag size={16} className="text-text-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-text-primary">{cat.name}</p>
                    {cat.slug && <p className="text-caption text-text-muted">/{cat.slug}</p>}
                  </div>
                  <button
                    className="text-caption font-semibold text-info hover:underline cursor-pointer"
                    onClick={() => { setEditing(cat); setEditName(cat.name); }}
                  >
                    Edit
                  </button>
                </div>
              </Card>
            ))}
            {categoryList.length === 0 && (
              <p className="text-body text-text-muted text-center py-8">No categories yet. Add the first one above.</p>
            )}
          </section>
        </>
      )}

      <Dialog
        open={!!editing}
        title="Rename category"
        onConfirm={saveEdit}
        onCancel={() => setEditing(null)}
        confirmLabel={saving ? "Saving…" : "Save"}
      >
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-body focus:outline-none focus:ring-2 focus:ring-info"
          autoFocus
        />
      </Dialog>
    </AppShell>
  );
}
