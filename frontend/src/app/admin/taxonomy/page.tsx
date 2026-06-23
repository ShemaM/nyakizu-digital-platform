"use client";

import { useState } from "react";
import { Plus, Tag } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CATEGORIES } from "@/lib/dummy-data";

export default function TaxonomyPage() {
  const [categories, setCategories] = useState(CATEGORIES);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const slug = newName.trim().toLowerCase().replace(/\s+/g, "-");
    setCategories((prev) => [...prev, { id: `cat${prev.length + 1}`, name: newName.trim(), slug, subcategories: [] }]);
    setNewName("");
    setAdding(false);
  }

  return (
    <AppShell
      title="Taxonomy"
      headerRight={
        <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
          <Plus size={14} /> Add
        </Button>
      }
    >
      {adding && (
        <form onSubmit={addCategory} className="bg-white border-2 border-blue-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">New category</p>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Power Banks"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="flex-1" disabled={!newName.trim()}>
              Add category
            </Button>
          </div>
        </form>
      )}

      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
          Product categories ({categories.length})
        </h2>
        {categories.map((cat) => (
          <Card key={cat.id}>
            <div className="flex items-center gap-3">
              <Tag size={16} className="text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-400">/{cat.slug}</p>
              </div>
              <button className="text-xs text-blue-500 hover:underline cursor-pointer">Edit</button>
            </div>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
