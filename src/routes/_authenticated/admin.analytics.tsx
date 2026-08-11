import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAnalyticsEvents, useMenuItems, useOrders, useTables } from "@/hooks/useAdminData";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Brew House Staff Console" },
      { name: "description", content: "Menu views, top-selling items and revenue by table." },
      { property: "og:title", content: "Analytics — Brew House Staff Console" },
      { property: "og:description", content: "See what guests scan, view and order most." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnalyticsPage,
});

const RANGES = [7, 30, 90] as const;

function AnalyticsPage() {
  const [days, setDays] = useState<number>(7);
  const { data: events = [] } = useAnalyticsEvents(days);
  const { data: orders = [] } = useOrders(0);
  const { data: items = [] } = useMenuItems();
  const { data: tables = [] } = useTables();

  const since = Date.now() - days * 86400000;
  const scoped = orders.filter(
    (o) => new Date(o.created_at).getTime() >= since && o.status !== "CANCELLED",
  );
  const revenue = scoped.reduce((sum, o) => sum + o.total, 0);
  const avg = scoped.length ? revenue / scoped.length : 0;

  const menuViews = events.filter((e) => e.event_type === "MENU_VIEW").length;
  const itemViews = events.filter((e) => e.event_type === "ITEM_VIEW").length;

  const itemCounts = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const order of scoped) {
    for (const line of order.items) {
      const prev = itemCounts.get(line.menuItemId) ?? {
        name: line.itemName,
        qty: 0,
        revenue: 0,
      };
      itemCounts.set(line.menuItemId, {
        name: line.itemName,
        qty: prev.qty + line.quantity,
        revenue: prev.revenue + line.subtotal,
      });
    }
  }
  const topItems = [...itemCounts.values()].sort((a, b) => b.qty - a.qty).slice(0, 8);

  const tableTotals = tables
    .map((t) => ({
      name: t.name,
      total: scoped.filter((o) => o.table_id === t.id).reduce((s, o) => s + o.total, 0),
      orders: scoped.filter((o) => o.table_id === t.id).length,
    }))
    .sort((a, b) => b.total - a.total);

  const stats = [
    { label: "Orders", value: String(scoped.length) },
    { label: "Revenue", value: formatCurrency(revenue) },
    { label: "Avg order value", value: formatCurrency(avg) },
    { label: "Menu scans", value: String(menuViews) },
    { label: "Item views", value: String(itemViews) },
    { label: "Live items", value: String(items.filter((i) => i.is_available).length) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl">Analytics</h2>
          <p className="text-sm text-muted-foreground">Last {days} days</p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <Button
              key={r}
              size="sm"
              variant={days === r ? "default" : "outline"}
              onClick={() => setDays(r)}
            >
              {r}d
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-lg">Top selling items</h3>
          <ul className="mt-2 divide-y divide-border text-sm">
            {topItems.map((i) => (
              <li key={i.name} className="flex items-center justify-between gap-3 py-2">
                <span className="truncate">{i.name}</span>
                <span className="text-muted-foreground">
                  {i.qty} sold · {formatCurrency(i.revenue)}
                </span>
              </li>
            ))}
            {topItems.length === 0 && (
              <li className="py-4 text-center text-muted-foreground">No sales in this range.</li>
            )}
          </ul>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg">Revenue by table</h3>
          <ul className="mt-2 divide-y divide-border text-sm">
            {tableTotals.map((t) => (
              <li key={t.name} className="flex items-center justify-between gap-3 py-2">
                <span>{t.name}</span>
                <span className="text-muted-foreground">
                  {t.orders} order(s) · {formatCurrency(t.total)}
                </span>
              </li>
            ))}
            {tableTotals.length === 0 && (
              <li className="py-4 text-center text-muted-foreground">No tables yet.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
