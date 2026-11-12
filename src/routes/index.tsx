import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicRestaurant } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TableScan | Restaurant Ordering" },
      { name: "description", content: "Browse a restaurant menu and place an order directly from your table." },
      { property: "og:title", content: "TableScan | Restaurant Ordering" },
      { property: "og:description", content: "Scan your table QR code to browse the live menu and order." },
    ],
  }),
  component: Home,
});

function Home() {
  const fetchRestaurant = useServerFn(getPublicRestaurant);
  const { data: restaurant, isLoading, isError } = useQuery({
    queryKey: ["public-restaurant"],
    queryFn: () => fetchRestaurant(),
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <span className="text-sm font-semibold tracking-[0.16em]">TABLESCAN</span>
        <Button asChild variant="outline" size="sm"><Link to="/login">Staff login</Link></Button>
      </header>
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-8 sm:pt-16">
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          {isLoading ? <Skeleton className="h-64 w-full sm:h-80" /> : restaurant?.cover_image ? (
            <div className="relative h-64 sm:h-80">
              <img src={restaurant.cover_image} alt={restaurant.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
                {restaurant.logo ? <img src={restaurant.logo} alt="" className="mb-4 size-12 rounded-full object-cover" /> : null}
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">Welcome</p>
                <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{restaurant.name}</h1>
                {restaurant.description ? <p className="mt-3 max-w-xl text-sm text-white/85">{restaurant.description}</p> : null}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-secondary via-card to-background px-6 py-16 sm:px-10 sm:py-24">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Restaurant ordering</p>
              <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
                {restaurant?.name ?? "Your menu, one scan away."}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                {restaurant?.description ?? "Scan the QR code on your table to browse the live menu and place your order."}
              </p>
            </div>
          )}
        </section>
        <section className="mx-auto max-w-2xl py-12 text-center sm:py-16">
          {isError ? <p className="text-sm text-destructive">Restaurant information could not be loaded. Please try again later.</p> : null}
          <h2 className="text-2xl font-semibold">Order from your table</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Scan the QR code provided at your table. Your menu, item availability and prices are loaded live.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            Restaurant staff can manage menu items, categories, tables and orders from the staff console.
          </p>
          <Button asChild className="mt-6"><Link to="/login">Staff login</Link></Button>
        </section>
      </main>
    </div>
  );
}
