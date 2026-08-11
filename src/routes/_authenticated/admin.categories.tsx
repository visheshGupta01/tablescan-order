import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useCategories, useCategoryMutations, useMenuItems } from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Brew House Staff Console" },
      { name: "description", content: "Create, rename, reorder and hide menu categories." },
      { property: "og:title", content: "Categories — Brew House Staff Console" },
      { property: "og:description", content: "Organise the menu into sections." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories = [] } = useCategories();
  const { data: items = [] } = useMenuItems();
  const { create, update, remove, reorder } = useCategoryMutations();
  const [name, setName] = useState("");

  const add = () => {
    if (!name.trim()) return;
    create.mutate(
      { name: name.trim(), display_order: categories.length + 1 },
      {
        onSuccess: () => {
          setName("");
          toast.success("Category added");
        },
        onError: () => toast.error("Could not add the category."),
      },
    );
  };

  const move = (index: number, delta: number) => {
    const next = [...categories];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    reorder.mutate(next.map((c) => c.id));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl">Categories</h2>
        <p className="text-sm text-muted-foreground">
          Order here controls the order guests see on the menu.
        </p>
      </div>

      <Card className="flex flex-wrap gap-2 p-3">
        <Input
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={add} disabled={create.isPending}>
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </Card>

      <Card className="divide-y divide-border">
        {categories.map((cat, index) => (
          <div key={cat.id} className="flex flex-wrap items-center gap-3 p-3">
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => move(index, -1)}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => move(index, 1)}>
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            <Input
              defaultValue={cat.name}
              className="max-w-xs"
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value && value !== cat.name) update.mutate({ id: cat.id, patch: { name: value } });
              }}
            />
            <span className="text-xs text-muted-foreground">
              {items.filter((i) => i.category_id === cat.id).length} item(s)
            </span>
            <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <Switch
                checked={cat.is_active}
                onCheckedChange={(v) => update.mutate({ id: cat.id, patch: { is_active: v } })}
              />
              {cat.is_active ? "Visible" : "Hidden"}
            </label>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                if (confirm(`Delete ${cat.name}?`)) remove.mutate(cat.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">No categories yet.</p>
        )}
      </Card>
    </div>
  );
}
