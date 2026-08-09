import { createFileRoute, Link } from "@tanstack/react-router";
import { usePublicOrder } from "@/hooks/usePublicMenu";
import { CustomerMessage } from "@/components/customer/MenuSkeleton";
import { StatusTimeline } from "@/components/customer/StatusTimeline";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatTime } from "@/lib/format";

export const Route = createFileRoute("/order/$id")({
  head: () => ({
    meta: [
      { title: "Track Your Order — The Brew House" },
      {
        name: "description",
        content: "Live status for your Brew House table order, from received to ready.",
      },
      { property: "og:title", content: "Track Your Order — The Brew House" },
      { property: "og:description", content: "Follow your order status in real time." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderStatusPage,
});

function OrderStatusPage() {
  const { id } = Route.useParams();
  const { data: order, isLoading } = usePublicOrder(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <CustomerMessage title="Order not found" message="We couldn't find this order. Please ask our staff for help." />
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {order.table_name ?? "Your table"} · {formatTime(order.created_at)}
      </p>
      <h1 className="mt-1 text-2xl">Order #{order.order_number}</h1>

      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Order Status
        </h2>
        <div className="mt-4">
          <StatusTimeline status={order.status} />
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Items
        </h2>
        <ul className="mt-3 divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.menuItemId} className="flex items-start justify-between gap-4 py-2.5">
              <div>
                <p className="text-sm font-medium">
                  {item.itemName} × {item.quantity}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(item.priceAtOrder)} each
                </p>
              </div>
              <p className="text-sm">{formatCurrency(item.subtotal)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-semibold">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
        {order.customer_note ? (
          <p className="mt-4 rounded-md bg-secondary px-3 py-2 text-sm">
            <span className="font-medium">Special instructions: </span>
            {order.customer_note}
          </p>
        ) : null}
      </section>

      <Button variant="outline" className="mt-6 w-full" asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
