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

export const Route = createFileRoute("/menu/table/$token/")({
  head: () => ({
    meta: [
      { title: "Menu & Table Ordering — The Brew House" },
      {
        name: "description",
        content:
          "Browse the full Brew House menu — coffee, brunch plates and desserts — and order straight from your table.",
      },
      { property: "og:title", content: "Menu & Table Ordering — The Brew House" },
      {
        property: "og:description",
        content: "Scan, browse and order from your table at The Brew House.",
      },
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

  const restaurant = data.restaurant!;
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

  const activeOrders = (orders.data ?? []).filter(
    (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED",
  );

  return (
    <BrandProvider theme={restaurant.theme} template={restaurant.template}>
      <div className="pb-24">
        <RestaurantHero restaurant={restaurant} tableName={table.name} />

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

        <div className="mt-6">
          <MenuToolbar
            query={query}
            onQueryChange={setQuery}
            categories={data.categories}
            activeCategory={activeCategory}
            onCategorySelect={(id) => {
              setActiveCategory(id);
              if (id === "all") {
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
              }
              track("category_view", { categoryId: id });
              document
                .getElementById(`cat-${id}`)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
