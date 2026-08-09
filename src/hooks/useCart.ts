import { useCallback, useEffect, useMemo, useState } from "react";
import type { CartLine, CartState, MenuItem } from "@/types";
import { getSessionId } from "@/lib/session";

function key(token: string) {
  return `bh_cart_${token}`;
}

function emptyCart(token: string): CartState {
  return {
    tableToken: token,
    sessionId: getSessionId(),
    createdAt: new Date().toISOString(),
    items: [],
  };
}

function read(token: string): CartState {
  if (typeof window === "undefined") return emptyCart(token);
  try {
    const raw = window.localStorage.getItem(key(token));
    if (!raw) return emptyCart(token);
    const parsed = JSON.parse(raw) as CartState;
    if (parsed.tableToken !== token) return emptyCart(token);
    return { ...emptyCart(token), ...parsed, items: parsed.items ?? [] };
  } catch {
    return emptyCart(token);
  }
}

export function useCart(token: string) {
  const [cart, setCart] = useState<CartState>(() => emptyCart(token));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(read(token));
    setHydrated(true);
  }, [token]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(key(token), JSON.stringify(cart));
  }, [cart, hydrated, token]);

  const add = useCallback((item: MenuItem, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.items.find((l) => l.menuItemId === item.id);
      const items: CartLine[] = existing
        ? prev.items.map((l) =>
            l.menuItemId === item.id ? { ...l, quantity: l.quantity + quantity } : l,
          )
        : [
            ...prev.items,
            {
              menuItemId: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity,
            },
          ];
      return { ...prev, items };
    });
  }, []);

  const setQuantity = useCallback((menuItemId: string, quantity: number) => {
    setCart((prev) => ({
      ...prev,
      items:
        quantity <= 0
          ? prev.items.filter((l) => l.menuItemId !== menuItemId)
          : prev.items.map((l) => (l.menuItemId === menuItemId ? { ...l, quantity } : l)),
    }));
  }, []);

  const remove = useCallback(
    (menuItemId: string) => setQuantity(menuItemId, 0),
    [setQuantity],
  );

  const clear = useCallback(() => setCart(emptyCart(token)), [token]);

  const { count, subtotal } = useMemo(
    () => ({
      count: cart.items.reduce((n, l) => n + l.quantity, 0),
      subtotal: cart.items.reduce((n, l) => n + l.quantity * l.price, 0),
    }),
    [cart.items],
  );

  return { cart, items: cart.items, add, setQuantity, remove, clear, count, subtotal, hydrated };
}
