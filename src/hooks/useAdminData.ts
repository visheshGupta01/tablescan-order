import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  analyticsService,
  categoryService,
  menuItemService,
  orderService,
  restaurantService,
  tableService,
  type MenuItemInput,
} from "@/services/restaurantApi";
import type { Category, Order, PaymentMethod } from "@/types";

const KEYS = {
  categories: ["admin", "categories"] as const,
  items: ["admin", "menu-items"] as const,
  tables: ["admin", "tables"] as const,
  orders: ["admin", "orders"] as const,
  restaurant: ["admin", "restaurant"] as const,
};

export function useCategories() {
  return useQuery({ queryKey: KEYS.categories, queryFn: categoryService.list });
}

export function useMenuItems() {
  return useQuery({ queryKey: KEYS.items, queryFn: menuItemService.list });
}

export function useTables() {
  return useQuery({ queryKey: KEYS.tables, queryFn: tableService.list });
}

export function useOrders(pollMs = 8000) {
  return useQuery({
    queryKey: KEYS.orders,
    queryFn: () => orderService.list(),
    refetchInterval: pollMs,
  });
}

export function useRestaurant() {
  return useQuery({ queryKey: KEYS.restaurant, queryFn: restaurantService.get });
}

export function useAnalyticsEvents(days: number) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  return useQuery({
    queryKey: ["admin", "events", days],
    queryFn: () => analyticsService.events(since),
  });
}

function useInvalidate(key: readonly unknown[]) {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: key });
}

export function useCategoryMutations() {
  const invalidate = useInvalidate(KEYS.categories);
  const create = useMutation({
    mutationFn: (input: { name: string; display_order: number }) => categoryService.create(input),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Category> }) =>
      categoryService.update(id, patch),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: invalidate,
  });
  const reorder = useMutation({
    mutationFn: (ids: string[]) => categoryService.reorder(ids),
    onSuccess: invalidate,
  });
  return { create, update, remove, reorder };
}

export function useMenuItemMutations() {
  const invalidate = useInvalidate(KEYS.items);
  const create = useMutation({
    mutationFn: (input: MenuItemInput) => menuItemService.create(input),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<MenuItemInput> }) =>
      menuItemService.update(id, patch),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => menuItemService.remove(id),
    onSuccess: invalidate,
  });
  const setAvailability = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      menuItemService.setAvailability(id, value),
    onSuccess: invalidate,
  });
  return { create, update, remove, setAvailability };
}

export function useTableMutations() {
  const invalidate = useInvalidate(KEYS.tables);
  const create = useMutation({
    mutationFn: (name: string) => tableService.create(name),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { name?: string; is_active?: boolean } }) =>
      tableService.update(id, patch),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => tableService.remove(id),
    onSuccess: invalidate,
  });
  return { create, update, remove };
}

export function useOrderMutations() {
  const invalidate = useInvalidate(KEYS.orders);
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order["status"] }) =>
      orderService.setStatus(id, status),
    onSuccess: invalidate,
  });
  const markPaid = useMutation({
    mutationFn: ({ id, method }: { id: string; method: PaymentMethod }) =>
      orderService.markPaid(id, method),
    onSuccess: invalidate,
  });
  const markUnpaid = useMutation({
    mutationFn: (id: string) => orderService.markUnpaid(id),
    onSuccess: invalidate,
  });
  return { setStatus, markPaid, markUnpaid };
}

export function useRestaurantMutation() {
  const invalidate = useInvalidate(KEYS.restaurant);
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      restaurantService.update(id, patch),
    onSuccess: invalidate,
  });
}
