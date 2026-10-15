import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  useCategories,
  useMenuItemMutations,
  useMenuItems,
} from "@/hooks/useAdminData";
import type { MenuItemInput } from "@/services/restaurantApi";
import type { MenuItem } from "@/types";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/menu")({
  head: () => ({
    meta: [
      { title: "Menu Items — Coffee Dose Staff Console" },
      { name: "description", content: "Add, edit, price and toggle availability of menu items." },
      { property: "og:title", content: "Menu Items — Coffee Dose Staff Console" },
      { property: "og:description", content: "Manage The Coffee Dose digital menu." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MenuAdminPage,
});

const EMPTY: MenuItemInput = {
  name: "",
  description: "",
  price: 0,
  category_id: "",
  image: "",
  is_veg: false,
  is_spicy: false,
  is_featured: false,
  is_available: true,
};

function MenuAdminPage() {
  const { data: items = [], isLoading } = useMenuItems();
  const { data: categories = [] } = useCategories();
  const { create, update, remove, setAvailability } = useMenuItemMutations();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuItemInput>(EMPTY);
  const [filter, setFilter] = useState("all");

  const grouped = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category_id === filter)),
    [items, filter],
  );

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY, category_id: categories[0]?.id ?? "" });
    setOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: item.price,
      category_id: item.category_id ?? "",
      image: item.image ?? "",
      is_veg: item.is_veg,
      is_spicy: item.is_spicy,
      is_featured: item.is_featured,
      is_available: item.is_available,
      display_order: item.display_order,
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim() || !form.category_id) {
      toast.error("Name and category are required.");
      return;
    }
    const payload: MenuItemInput = {
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() || null,
      image: form.image?.trim() || null,
      price: Number(form.price) || 0,
    };
    const done = {
      onSuccess: () => {
        toast.success(editing ? "Item updated" : "Item added");
        setOpen(false);
      },
      onError: () => toast.error("Could not save the item."),
    };
    if (editing) update.mutate({ id: editing.id, patch: payload }, done);
    else create.mutate(payload, done);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl">Menu items</h2>
          <p className="text-sm text-muted-foreground">{items.length} item(s) on the menu</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> New item
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {grouped.map((item) => (
          <Card key={item.id} className="flex gap-3 p-3">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="h-20 w-20 shrink-0 rounded-md object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-20 w-20 shrink-0 rounded-md bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate font-medium">{item.name}</p>
                <span className="text-sm font-semibold">{formatCurrency(item.price)}</span>
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {item.is_veg && <Badge variant="secondary">Veg</Badge>}
                {item.is_spicy && <Badge variant="secondary">Spicy</Badge>}
                {item.is_featured && <Badge>Bestseller</Badge>}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={item.is_available}
                    onCheckedChange={(value) =>
                      setAvailability.mutate({ id: item.id, value })
                    }
                  />
                  {item.is_available ? "Available" : "Sold out"}
                </label>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Delete ${item.name}?`)) remove.mutate(item.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {!isLoading && grouped.length === 0 && (
          <p className="text-sm text-muted-foreground">No items in this category yet.</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit item" : "New item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(v) => setForm({ ...form, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={form.image ?? ""}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {(
                [
                  ["is_veg", "Vegetarian"],
                  ["is_spicy", "Spicy"],
                  ["is_featured", "Bestseller"],
                  ["is_available", "Available"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <Switch
                    checked={form[key]}
                    onCheckedChange={(v) => setForm({ ...form, [key]: v })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={create.isPending || update.isPending}>
              Save item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
