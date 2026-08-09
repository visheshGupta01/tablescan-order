import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MenuItem } from "@/types";
import { formatCurrency } from "@/lib/format";
import { BestsellerTag, SoldOutTag, SpicyTag, VegTag } from "./ItemTags";

export function ItemDetailDialog({
  item,
  onClose,
  onAdd,
}: {
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [item?.id]);

  if (!item) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <div className="h-52 w-full bg-secondary">
          {item.image ? (
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="space-y-3 p-5">
          <DialogTitle className="font-display text-xl">{item.name}</DialogTitle>
          {item.description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            {item.is_veg ? <VegTag /> : null}
            {item.is_spicy ? <SpicyTag /> : null}
            {item.is_featured ? <BestsellerTag /> : null}
            {!item.is_available ? <SoldOutTag /> : null}
          </div>
          <p className="text-lg font-medium">{formatCurrency(item.price)}</p>

          {item.is_available ? (
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 rounded-md border border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <Button
                className="flex-1"
                onClick={() => {
                  onAdd(item, quantity);
                  onClose();
                }}
              >
                Add to Cart · {formatCurrency(item.price * quantity)}
              </Button>
            </div>
          ) : (
            <Button disabled className="w-full">
              Currently unavailable
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
