import { Flame, Leaf, Star } from "lucide-react";

export function VegTag() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-success">
      <Leaf className="size-3" /> Veg
    </span>
  );
}

export function SpicyTag() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-destructive">
      <Flame className="size-3" /> Spicy
    </span>
  );
}

export function BestsellerTag() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-accent">
      <Star className="size-3 fill-current" /> Bestseller
    </span>
  );
}

export function SoldOutTag() {
  return (
    <span className="inline-flex items-center rounded-sm bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      Sold out
    </span>
  );
}
