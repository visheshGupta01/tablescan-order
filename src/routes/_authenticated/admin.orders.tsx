import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useOrderMutations, useOrders } from "@/hooks/useAdminData";
import { formatCurrency, formatTime, timeAgo } from "@/lib/format";
import { ORDER_FLOW, STAFF_STATUS_LABEL, type Order, type OrderStatus } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({
    meta: [
      { title: "Live Order Board — Brew House Staff Console" },
      {
        name: "description",
        content: "Real-time kitchen board for table orders at The Brew House.",
      },
      { property: "og:title", content: "Live Order Board — Brew House Staff Console" },
      { property: "og:description", content: "Move orders from new to ready in one tap." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

const COLUMNS: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "READY"];

function nextStatus(status: OrderStatus): OrderStatus | null {
  const i = ORDER_FLOW.indexOf(status);
  if (i < 0 || i === ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[i + 1]!;
}

function OrdersPage() {
  const { data: orders = [], isLoading, isFetching } = useOrders(6000);
  const { setStatus } = useOrderMutations();
  const [showDone, setShowDone] = useState(false);

  const advance = (order: Order) => {
    const next = nextStatus(order.status);
    if (!next) return;
    setStatus.mutate(
      { id: order.id, status: next },
      {
        onSuccess: () => toast.success(`Order #${order.order_number} → ${STAFF_STATUS_LABEL[next]}`),
        onError: () => toast.error("Could not update the order."),
      },
    );
  };

  const cancel = (order: Order) => {
    setStatus.mutate(
      { id: order.id, status: "CANCELLED" },
      {
        onSuccess: () => toast.success(`Order #${order.order_number} cancelled`),
        onError: () => toast.error("Could not cancel the order."),
      },
    );
  };

  const done = orders.filter((o) => o.status === "COMPLETED" || o.status === "CANCELLED");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl">Live order board</h2>
          <p className="text-sm text-muted-foreground">
            Auto-refreshing every 6 seconds {isFetching && "· syncing…"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowDone((v) => !v)}>
          {showDone ? "Hide" : "Show"} completed ({done.length})
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((c) => (
            <Skeleton key={c} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((status) => {
            const list = orders.filter((o) => o.status === status);
            return (
              <section key={status} className="rounded-lg bg-card p-3 ring-1 ring-border">
                <header className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide">
                    {STAFF_STATUS_LABEL[status]}
                  </h3>
                  <Badge variant="secondary">{list.length}</Badge>
                </header>
                <div className="space-y-3">
                  {list.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onAdvance={() => advance(order)}
                      onCancel={() => cancel(order)}
                      busy={setStatus.isPending}
                    />
                  ))}
                  {list.length === 0 && (
                    <p className="py-6 text-center text-xs text-muted-foreground">Nothing here</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {showDone && (
        <Card className="p-4">
          <h3 className="text-lg">Completed & cancelled</h3>
          <ul className="mt-2 divide-y divide-border text-sm">
            {done.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-2">
                <span>
                  #{o.order_number} · {o.table_name ?? "—"} · {formatTime(o.created_at)}
                </span>
                <span className="flex items-center gap-2">
                  <Badge variant={o.status === "CANCELLED" ? "destructive" : "secondary"}>
                    {STAFF_STATUS_LABEL[o.status]}
                  </Badge>
                  {formatCurrency(o.total)}
                </span>
              </li>
            ))}
            {done.length === 0 && (
              <li className="py-4 text-center text-muted-foreground">Nothing yet.</li>
            )}
          </ul>
        </Card>
      )}
    </div>
  );
}

function OrderCard({
  order,
  onAdvance,
  onCancel,
  busy,
}: {
  order: Order;
  onAdvance: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const next = nextStatus(order.status);
  return (
    <article className="rounded-md border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">#{order.order_number}</p>
          <p className="text-xs text-muted-foreground">
            {order.table_name ?? "Unknown table"} · {timeAgo(order.created_at)}
          </p>
        </div>
        <span className="text-sm font-semibold">{formatCurrency(order.total)}</span>
      </div>

      <ul className="mt-2 space-y-1 text-sm">
        {order.items.map((line) => (
          <li key={line.menuItemId} className="flex justify-between gap-2">
            <span className="truncate">
              {line.quantity}× {line.itemName}
            </span>
            <span className="text-muted-foreground">{formatCurrency(line.subtotal)}</span>
          </li>
        ))}
      </ul>

      {order.customer_note && (
        <p className="mt-2 rounded bg-muted p-2 text-xs italic text-muted-foreground">
          “{order.customer_note}”
        </p>
      )}

      <div className="mt-3 flex gap-2">
        {next && (
          <Button size="sm" className="flex-1" disabled={busy} onClick={onAdvance}>
            {STAFF_STATUS_LABEL[next]}
          </Button>
        )}
        <Button size="sm" variant="outline" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </article>
  );
}
