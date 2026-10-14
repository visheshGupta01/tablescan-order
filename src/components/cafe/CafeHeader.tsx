import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Menu, Search, SlidersHorizontal, X } from "lucide-react";
import { CafeLogo } from "./CafeBrand";

export function CafeHeader({
  name,
  logo,
  query,
  onQueryChange,
  onOpenMenu,
  onOpenFilters,
  filterCount,
}: {
  name: string;
  logo?: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  onOpenMenu: () => void;
  onOpenFilters: () => void;
  filterCount: number;
}) {
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searching) inputRef.current?.focus();
  }, [searching]);

  const closeSearch = () => {
    setSearching(false);
    onQueryChange("");
  };

  return (
    <div className="glass-strong sticky top-0 z-40 rounded-none border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
        {searching ? (
          <>
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
            </button>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search the menu…"
              aria-label="Search the menu"
              className="h-10 min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-subtle focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Open menu"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Menu className="size-4" />
            </button>
            <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
              <CafeLogo imageUrl={logo ?? null} name={name} className="size-8" />
              <span className="dose-label truncate text-foreground">{name}</span>
            </div>
            <button
              type="button"
              onClick={onOpenFilters}
              aria-label="Filter the menu"
              className="relative grid size-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <SlidersHorizontal className="size-4" />
              {filterCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {filterCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setSearching(true)}
              aria-label="Search the menu"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Search className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
