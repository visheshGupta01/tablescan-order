import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { usePublicMenu, useTrackEvent } from "@/hooks/usePublicMenu";
import { useCart } from "@/hooks/useCart";
import { useMyTableOrders } from "@/hooks/usePublicMenu";
import { BrandProvider } from "@/components/customer/BrandProvider";
import { RestaurantHero } from "@/components/customer/RestaurantHero";
import { MenuToolbar } from "@/components/customer/MenuToolbar";
import { MenuItemCard } from "@/components/customer/MenuItemCard";
import { ItemDetailDialog } from "@/components/customer/ItemDetailDialog";
import { CartSheet } from "@/components/customer/CartSheet";
import { CartBar } from "@/components/customer/CartBar";
import { CustomerFooter } from "@/components/customer/CustomerFooter";
import { CustomerMessage, MenuSkeleton } from "@/components/customer/MenuSkeleton";
import { CUSTOMER_STATUS_LABEL, type MenuItem } from "@/types";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/menu/table/$token/")({
  head: () => ({
    meta: [
      { title: "Digital Menu | TableScan" },
      {
        name: "description",
        content: "Browse the restaurant menu and order directly from your table.",
      },
      { property: "og:title", content: "Digital Menu | TableScan" },
      {
        property: "og:description",
        content: "View the live menu, check availability and place your order.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { token } = Route.useParams();
  const { data, isLoading } = usePublicMenu(token);
  const track = useTrackEvent(token);
  const cart = useCart(token);
  const orders = useMyTableOrders(token);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (data?.status === "ok") track("menu_view");
  }, [data?.status, track]);

  // Drop cart lines that the kitchen has marked sold out.
  useEffect(() => {
    if (data?.status !== "ok" || !cart.hydrated) return;
    const gone = cart.items.filter((line) => {
      const item = data.items.find((i) => i.id === line.menuItemId);
      return !item || !item.is_available;
    });
    if (gone.length > 0) {
      gone.forEach((line) => cart.remove(line.menuItemId));
      toast.error(
        `Sorry, ${gone.map((g) => g.name).join(", ")} is no longer available. Please review your cart.`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, cart.hydrated]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data.items;
    return data.items.filter((item) => {
      const category = data.categories.find((c) => c.id === item.category_id)?.name ?? "";
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q) ||
        category.toLowerCase().includes(q)
      );
    });
  }, [data, query]);

  if (isLoading || !data) return <MenuSkeleton />;

  if (data.status === "invalid") {
    return (
      <CustomerMessage
        title="Invalid Table"
        message="This QR code is not associated with a valid restaurant table."
      />
    );
  }

  if (data.status === "inactive") {
    return <CustomerMessage title="Table Unavailable" message="This table is currently unavailable." />;
  }

  if (data.status === "inactive_restaurant") {
    return <CustomerMessage title="Ordering Unavailable" message="This restaurant is not currently accepting orders." />;
  }

  if (data.status === "unconfigured" || !data.restaurant) {
    return <CustomerMessage title="Menu not configured" message="The restaurant profile has not been set up yet. Please contact the restaurant staff." />;
  }

  const restaurant = data.restaurant;
  const table = data.table!;
  const featured = data.items.filter((i) => i.is_featured && i.is_available);
  const visibleCategories = data.categories.filter((c) =>
    filtered.some((i) => i.category_id === c.id),
  );

  const handleAdd = (item: MenuItem, quantity = 1) => {
    cart.add(item, quantity);
    track("item_add", { itemId: item.id });
    toast.success(`${item.name} added`);
  };

  const openDetail = (item: MenuItem) => {
    setDetailItem(item);
    track("item_view", { itemId: item.id });
  };

  const countFor = (id: string) => cart.items.find((l) => l.menuItemId === id)?.quantity ?? 0;

  const chooseCategory = (categoryId: string) => {
    setQuery("");
    setActiveCategory(categoryId);
    if (categoryId === "all") {
      document.getElementById("full-menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    track("category_view", { categoryId });
    document.getElementById(`cat-${categoryId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeOrders = (orders.data ?? []).filter(
    (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED",
  );

  return (
    <BrandProvider theme={restaurant.theme} template={restaurant.template}>
      <div className="pb-24">
        <div className="mx-auto max-w-3xl pb-8">
          <RestaurantHero restaurant={restaurant} tableName={table.name} />
          <section className="px-4 pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Explore
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Browse the menu</h2>
            {data.categories.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {data.categories.slice(0, 6).map((category) => (
                  <Button
                    key={category.id}
                    type="button"
                    variant="outline"
                    onClick={() => chooseCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Menu categories have not been added yet.
              </p>
            )}
          </section>
        </div>

        {activeOrders.length > 0 ? (
          <div className="mx-auto mt-4 max-w-3xl px-4">
            {activeOrders.map((order) => (
              <Link
                key={order.id}
                to="/order/$id"
                params={{ id: order.id }}
                className="mb-2 flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm"
              >
                <span className="font-medium">
                  Order #{order.order_number} · {formatCurrency(order.total)}
                </span>
                <span className="text-primary">{CUSTOMER_STATUS_LABEL[order.status]} →</span>
              </Link>
            ))}
          </div>
        ) : null}

        <div id="full-menu" className="scroll-mt-20 mt-6">
          <MenuToolbar
            query={query}
            onQueryChange={setQuery}
            categories={data.categories}
            activeCategory={activeCategory}
            onCategorySelect={(id) => {
              setActiveCategory(id);
              chooseCategory(id);
            }}
          />
        </div>

        <main className="mx-auto max-w-3xl px-4">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">No dishes found.</p>
          ) : (
            <>
              {!query && featured.length > 0 ? (
                <section className="pt-6">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">
                    Bestsellers
                  </h2>
                  <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
                    {featured.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openDetail(item)}
                        className="w-40 shrink-0 text-left"
                      >
                        <div className="h-28 w-40 overflow-hidden rounded-md bg-secondary">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <p className="mt-2 truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {visibleCategories.map((category) => (
                <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-36 pt-8">
                  <h2 className="font-display text-xl">{category.name}</h2>
                  <div className="mt-2">
                    {filtered
                      .filter((item) => item.category_id === category.id)
                      .map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          onOpen={openDetail}
                          onAdd={handleAdd}
                          inCart={countFor(item.id)}
                        />
                      ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </main>

        <CustomerFooter restaurant={restaurant} />
      </div>

      <ItemDetailDialog item={detailItem} onClose={() => setDetailItem(null)} onAdd={handleAdd} />
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cart.items}
        subtotal={cart.subtotal}
        token={token}
        onSetQuantity={cart.setQuantity}
        onRemove={cart.remove}
        onClear={cart.clear}
      />
      <CartBar count={cart.count} subtotal={cart.subtotal} onClick={() => setCartOpen(true)} />
    </BrandProvider>
  );
}
