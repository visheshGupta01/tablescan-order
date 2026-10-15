import { createFileRoute, Link } from "@tanstack/react-router";
import { IndianRupee, ClipboardList, QrCode, TrendingUp } from "lucide-react";
import { useMenuItems, useOrders, useTables } from "@/hooks/useAdminData";
import { formatCurrency, timeAgo } from "@/lib/format";
import { STAFF_STATUS_LABEL } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Coffee Dose Staff Console" },
      { name: "description", content: "Today's orders, revenue and live activity for The Coffee Dose." },
      { property: "og:title", content: "Dashboard — Coffee Dose Staff Console" },
      { property: "og:description", content: "Track sales, live orders and menu status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: orders = [], isLoading } = useOrders();
  const { data: items = [] } = useMenuItems();
  const { data: tables = [] } = useTables();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const today = orders.filter((o) => new Date(o.created_at) >= startOfDay);
  const paid = today.filter((o) => o.status !== "CANCELLED");
  const revenue = paid.reduce((sum, o) => sum + o.total, 0);
  const active = orders.filter(
    (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED",
  );
  const soldOut = items.filter((i) => !i.is_available).length;

  const stats = [
    { label: "Orders today", value: String(today.length), icon: ClipboardList },
    { label: "Revenue today", value: formatCurrency(revenue), icon: IndianRupee },
    { label: "Active orders", value: String(active.length), icon: TrendingUp },
    { label: "Active tables", value: String(tables.filter((t) => t.is_active).length), icon: QrCode },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">Today at a glance</h2>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading live data…" : `${active.length} order(s) need attention.`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <s.icon className="h-4 w-4 text-accent" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg">Latest orders</h3>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/orders">Open live board</Link>
            </Button>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {orders.slice(0, 8).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    #{o.order_number} · {o.table_name ?? "Unknown table"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.items.length} item(s) · {timeAgo(o.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{STAFF_STATUS_LABEL[o.status]}</Badge>
                  <span className="text-sm font-semibold">{formatCurrency(o.total)}</span>
                </div>
              </li>
            ))}
            {!isLoading && orders.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">No orders yet.</li>
            )}
          </ul>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg">Menu health</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total items</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sold out</span>
              <span className="font-medium">{soldOut}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bestsellers</span>
              <span className="font-medium">{items.filter((i) => i.is_featured).length}</span>
            </div>
          </div>
          <Button asChild className="mt-4 w-full" variant="outline">
            <Link to="/admin/menu">Manage menu</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
