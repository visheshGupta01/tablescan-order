import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePublicMenu } from "@/hooks/usePublicMenu";
import { useCart } from "@/hooks/useCart";
import { placeOrder } from "@/lib/public.functions";
import { getSessionId, rememberOrder } from "@/lib/session";
import { formatCurrency } from "@/lib/format";
import { TIP_PRESETS } from "@/types";
import { BrandProvider } from "@/components/customer/BrandProvider";
import { CustomerMessage, MenuSkeleton } from "@/components/customer/MenuSkeleton";

export const Route = createFileRoute("/menu/table/$token/checkout")({
  head: () => ({
    meta: [
      { title: "Review & Place Your Order — The Brew House" },
      {
        name: "description",
        content: "Review your table order, add special instructions and send it to the kitchen.",
      },
      { property: "og:title", content: "Review & Place Your Order — The Brew House" },
      { property: "og:description", content: "Confirm your table order at The Brew House." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = usePublicMenu(token);
  const cart = useCart(token);
  const submit = useServerFn(placeOrder);

  const [note, setNote] = useState("");
  const [tipPercent, setTipPercent] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<{ id: string; number: number } | null>(null);

  if (isLoading || !data) return <MenuSkeleton />;
  if (data.status !== "ok") {
    return (
      <CustomerMessage
        title={data.status === "inactive" ? "Table Unavailable" : "Invalid Table"}
        message={
          data.status === "inactive"
            ? "This table is currently unavailable."
            : "This QR code is not associated with a valid restaurant table."
        }
      />
    );
  }

  const restaurant = data.restaurant!;
  const table = data.table!;

  const taxRate = Math.max(0, Number(restaurant.tax_rate ?? 0));
  const taxAmount = Number(((cart.subtotal * taxRate) / 100).toFixed(2));
  const tipsEnabled = restaurant.tips_enabled !== false;
  const tipAmount = tipsEnabled
    ? Number(((cart.subtotal * tipPercent) / 100).toFixed(2))
    : 0;
  const total = Number((cart.subtotal + taxAmount + tipAmount).toFixed(2));

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const result = await submit({
        data: {
          token,
          sessionId: getSessionId(),
          note: note.trim() || undefined,
          tipAmount,
          items: cart.items.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity })),
        },
      });

      if (result.ok) {
        rememberOrder({
          id: result.orderId,
          orderNumber: result.orderNumber,
          tableToken: token,
          createdAt: new Date().toISOString(),
        });
        cart.clear();
        setPlaced({ id: result.orderId, number: result.orderNumber });
        return;
      }

      if (result.reason === "unavailable") {
        toast.error(
          `Sorry, ${result.unavailable.join(", ")} is no longer available. Please review your cart.`,
        );
      } else if (result.reason === "inactive_table") {
        toast.error("This table is currently unavailable.");
      } else if (result.reason === "invalid_table") {
        toast.error("We couldn't identify your table. Please rescan the QR code.");
      } else if (result.reason === "empty_cart") {
        toast.error("Your cart is empty.");
      } else {
        toast.error("We couldn't place your order. Please try again.");
      }
    } catch {
      toast.error("Network problem — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <BrandProvider theme={restaurant.theme} template={restaurant.template}>
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 text-center">
          <CheckCircle2 className="mx-auto size-12 text-success" />
          <h1 className="mt-4 text-2xl">Order Placed</h1>
          <p className="mt-2 font-display text-3xl">#{placed.number}</p>
          <p className="text-sm text-muted-foreground">{table.name}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Your order has been received by the restaurant.
          </p>
          <div className="mt-8 space-y-2">
            <Button
              className="w-full"
              onClick={() => navigate({ to: "/order/$id", params: { id: placed.id } })}
            >
              View Order Status
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/menu/table/$token" params={{ token }}>
                Back to Menu
              </Link>
            </Button>
          </div>
        </div>
      </BrandProvider>
    );
  }

  return (
    <BrandProvider theme={restaurant.theme} template={restaurant.template}>
      <div className="mx-auto max-w-md px-4 py-6">
        <Link
          to="/menu/table/$token"
          params={{ token }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="size-4" /> Back to menu
        </Link>

        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {table.name}
        </p>
        <h1 className="text-2xl">Your Order</h1>

        {cart.items.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Button className="mt-4" asChild>
              <Link to="/menu/table/$token" params={{ token }}>
                Browse the menu
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="mt-5 divide-y divide-border">
              {cart.items.map((line) => (
                <li key={line.menuItemId} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {line.name} × {line.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(line.price)} each</p>
                  </div>
                  <p className="text-sm">{formatCurrency(line.price * line.quantity)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-1 space-y-1.5 border-t border-border pt-3 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>
                    {restaurant.tax_label || "Tax"} ({taxRate}%)
                  </span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {tipsEnabled && tipAmount > 0 && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Tip ({tipPercent}%)</span>
                  <span>{formatCurrency(tipAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {tipsEnabled && (
              <div className="mt-5 rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-medium">Add a tip for the team</p>
                <p className="text-xs text-muted-foreground">Optional — 100% goes to our staff.</p>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {TIP_PRESETS.map((percent) => (
                    <Button
                      key={percent}
                      type="button"
                      variant={tipPercent === percent ? "default" : "outline"}
                      onClick={() => setTipPercent(percent)}
                    >
                      {percent === 0 ? "None" : `${percent}%`}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <label htmlFor="note" className="text-sm font-medium">
                Special instructions <span className="text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                id="note"
                value={note}
                maxLength={300}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Less spicy, no onions, extra cheese…"
                className="resize-none bg-card"
              />
              <p className="text-right text-xs text-muted-foreground">{note.length}/300</p>
            </div>

            <Button
              className="mt-4 h-12 w-full"
              disabled={submitting}
              onClick={() => void handlePlaceOrder()}
            >
              {submitting ? "Placing order…" : `Place Order · ${formatCurrency(total)}`}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              No account needed. Pay at the counter after your meal.
            </p>
          </>
        )}
      </div>
    </BrandProvider>
  );
}
