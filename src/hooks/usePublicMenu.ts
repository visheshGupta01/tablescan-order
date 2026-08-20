import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback } from "react";
import { getPublicMenu, getPublicOrder, getTableOrders, trackEvent } from "@/lib/public.functions";
import { getSessionId } from "@/lib/session";

export function usePublicMenu(token: string) {
  console.log("usePublicMenu called with token", token);
  const fetchMenu = useServerFn(getPublicMenu);
  return useQuery({
    queryKey: ["public-menu", token],
    queryFn: () => fetchMenu({ data: { token } }),
    staleTime: 30_000,
  });
}

export function usePublicOrder(orderId: string, pollMs = 10_000) {
  const fetchOrder = useServerFn(getPublicOrder);
  return useQuery({
    queryKey: ["public-order", orderId],
    queryFn: () => fetchOrder({ data: { orderId } }),
    refetchInterval: pollMs,
  });
}

export function useMyTableOrders(token: string) {
  const fetchOrders = useServerFn(getTableOrders);
  return useQuery({
    queryKey: ["table-orders", token],
    queryFn: () => fetchOrders({ data: { token, sessionId: getSessionId() } }),
    refetchInterval: 15_000,
  });
}

export function useTrackEvent(token?: string) {
  const track = useServerFn(trackEvent);
  return useCallback(
    (eventType: string, extra?: { itemId?: string; categoryId?: string }) => {
      void track({
        data: {
          eventType,
          ...(token ? { token } : {}),
          ...(extra?.itemId ? { itemId: extra.itemId } : {}),
          ...(extra?.categoryId ? { categoryId: extra.categoryId } : {}),
          sessionId: getSessionId(),
        },
      }).catch(() => undefined);
    },
    [track, token],
  );
}
