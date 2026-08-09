import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function MenuToolbar({
  query,
  onQueryChange,
  categories,
  activeCategory,
  onCategorySelect,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  categories: { id: string; name: string }[];
  activeCategory: string;
  onCategorySelect: (id: string) => void;
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search menu..."
            aria-label="Search menu"
            className="h-11 rounded-md border-border bg-card pl-9 pr-9"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <nav className="no-scrollbar -mx-4 mt-3 flex gap-1 overflow-x-auto px-4 pb-2">
          {[{ id: "all", name: "All" }, ...categories].map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategorySelect(cat.id)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
