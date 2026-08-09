import { Plus } from "lucide-react";
import type { MenuItem } from "@/types";
import { formatCurrency } from "@/lib/format";
import { BestsellerTag, SoldOutTag, SpicyTag, VegTag } from "./ItemTags";

export function MenuItemCard({
  item,
  onOpen,
  onAdd,
  inCart,
}: {
  item: MenuItem;
  onOpen: (item: MenuItem) => void;
  onAdd: (item: MenuItem) => void;
  inCart: number;
}) {
  return (
    <article className="flex gap-4 border-b border-border py-5 last:border-0">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="min-w-0 flex-1 text-left"
        aria-label={`View details for ${item.name}`}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-base font-medium text-foreground">{item.name}</h3>
          {!item.is_available ? <SoldOutTag /> : null}
        </div>
        {item.description ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        ) : null}
        <p className="mt-2 text-sm font-medium text-foreground">{formatCurrency(item.price)}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          {item.is_veg ? <VegTag /> : null}
          {item.is_spicy ? <SpicyTag /> : null}
          {item.is_featured ? <BestsellerTag /> : null}
        </div>
      </button>

      <div className="flex w-24 shrink-0 flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => onOpen(item)}
          className="block size-24 overflow-hidden rounded-md bg-secondary"
          aria-label={`Open ${item.name}`}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              decoding="async"
              className={`h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03] ${
                item.is_available ? "" : "grayscale"
              }`}
            />
          ) : null}
        </button>
        <button
          type="button"
          disabled={!item.is_available}
          onClick={() => onAdd(item)}
          className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-primary bg-card text-xs font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground"
        >
          {item.is_available ? (
            <>
              <Plus className="size-3.5" /> {inCart > 0 ? `Add · ${inCart}` : "Add"}
            </>
          ) : (
            "Sold out"
          )}
        </button>
      </div>
    </article>
  );
}
