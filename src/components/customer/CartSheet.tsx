import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { CartLine } from "@/types";
import { formatCurrency } from "@/lib/format";

export function CartSheet({
  open,
  onOpenChange,
  items,
  subtotal,
  token,
  onSetQuantity,
  onRemove,
  onClear,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartLine[];
  subtotal: number;
  token: string;
  onSetQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-lg">
        <SheetHeader className="px-0">
          <SheetTitle className="font-display text-lg">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            <ul className="divide-y divide-border">
              {items.map((line) => (
                <li key={line.menuItemId} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{line.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(line.price)} × {line.quantity} ={" "}
                      {formatCurrency(line.price * line.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-md border border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Decrease"
                      onClick={() => onSetQuantity(line.menuItemId, line.quantity - 1)}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-6 text-center text-sm">{line.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Increase"
                      onClick={() => onSetQuantity(line.menuItemId, line.quantity + 1)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => onRemove(line.menuItemId)}
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-medium">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClear}>
                Clear cart
              </Button>
              <Button asChild className="flex-1">
                <Link to="/menu/table/$token/checkout" params={{ token }}>
                  Review Order
                </Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
