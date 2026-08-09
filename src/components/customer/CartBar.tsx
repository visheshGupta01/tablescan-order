import { ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export function CartBar({
  count,
  subtotal,
  onClick,
}: {
  count: number;
  subtotal: number;
  onClick: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
      <button
        type="button"
        onClick={onClick}
        className="mx-auto flex h-12 w-full max-w-3xl items-center justify-between rounded-md bg-primary px-5 text-primary-foreground"
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold">
          <ShoppingBag className="size-4" /> View Cart
        </span>
        <span className="text-sm">
          {count} {count === 1 ? "item" : "items"} · {formatCurrency(subtotal)}
        </span>
      </button>
    </div>
  );
}
