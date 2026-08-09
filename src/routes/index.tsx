import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicMenu } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

const DEMO_TABLES = [
  { name: "Table 1", token: "tbl_9k3xq7ma" },
  { name: "Table 2", token: "tbl_4p7wv2ce" },
  { name: "Table 3", token: "tbl_8f72kd92" },
  { name: "Table 7", token: "tbl_1mhs4pdo" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Brew House — QR Menu & Table Ordering" },
      {
        name: "description",
        content:
          "Specialty coffee, brunch and desserts. Scan the QR code on your table to browse the menu and order in seconds.",
      },
      { property: "og:title", content: "The Brew House — QR Menu & Table Ordering" },
      {
        property: "og:description",
        content: "Scan your table QR code to browse the menu and order without waiting.",
      },
      {
        property: "og:image",
        content: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&q=80",
      },
      {
        name: "twitter:image",
        content: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&q=80",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const fetchMenu = useServerFn(getPublicMenu);
  const { data, isLoading } = useQuery({
    queryKey: ["home-preview"],
    queryFn: () => fetchMenu({ data: { token: DEMO_TABLES[0]!.token } }),
  });

  const restaurant = data?.restaurant ?? null;
  const featured = (data?.items ?? []).filter((i) => i.is_featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&q=80"
          alt="Guests at The Brew House café"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Scan · Browse · Order
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl text-primary-foreground sm:text-6xl">
            {restaurant?.name ?? "THE BREW HOUSE"}
          </h1>
          <p className="mt-3 max-w-md text-sm text-primary-foreground/85">
            {restaurant?.description ?? "Specialty Coffee • Brunch • Desserts"}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="font-display text-xl">Try the table experience</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each table has its own QR code. Open one to see exactly what a guest sees.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {DEMO_TABLES.map((table) => (
            <Button key={table.token} variant="outline" className="justify-between" asChild>
              <Link to="/menu/table/$token" params={{ token: table.token }}>
                {table.name}
                <span className="text-muted-foreground">Open menu →</span>
              </Link>
            </Button>
          ))}
        </div>

        <h2 className="mt-12 font-display text-xl">Guest favourites</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
            : featured.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-md border border-border bg-card">
                  <div className="h-28 w-full bg-secondary">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                  </div>
                </article>
              ))}
        </div>

        <div className="mt-12 rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-lg">Restaurant staff</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the menu, tables, QR codes and live orders.
          </p>
          <Button className="mt-3" asChild>
            <Link to="/login">Staff login</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
