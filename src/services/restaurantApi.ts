import { supabase } from "@/integrations/supabase/client";
import type {
  Category,
  MenuItem,
  PaymentMethod,
  Restaurant,
  RestaurantTable,
  Order,
} from "@/types";

type AnyRecord = Record<string, unknown>;

function num(v: unknown): number {
  return Number(v ?? 0);
}

export const categoryService = {
  async list(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order");
    if (error) throw error;
    return (data ?? []) as unknown as Category[];
  },
  async create(input: { name: string; display_order: number }) {
    const { error } = await supabase.from("categories").insert(input);
    if (error) throw error;
  },
  async update(id: string, patch: Partial<Category>) {
    const { error } = await supabase.from("categories").update(patch).eq("id", id);
    if (error) throw error;
  },
  async remove(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  },
  async reorder(ids: string[]) {
    for (let i = 0; i < ids.length; i++) {
      await supabase
        .from("categories")
        .update({ display_order: i + 1 })
        .eq("id", ids[i]!);
    }
  },
};

export interface MenuItemInput {
  name: string;
  description?: string | null;
  price: number;
  category_id: string;
  image?: string | null;
  is_veg: boolean;
  is_spicy: boolean;
  is_featured: boolean;
  is_available: boolean;
  display_order?: number;
}

export const menuItemService = {
  async list(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("display_order");
    if (error) throw error;
    return ((data ?? []) as AnyRecord[]).map((row) => ({
      ...(row as unknown as MenuItem),
      price: num(row["price"]),
    }));
  },
  async create(input: MenuItemInput) {
    const { error } = await supabase.from("menu_items").insert(input);
    if (error) throw error;
  },
  async update(id: string, patch: Partial<MenuItemInput>) {
    const { error } = await supabase.from("menu_items").update(patch).eq("id", id);
    if (error) throw error;
  },
  async remove(id: string) {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) throw error;
  },
  async setAvailability(id: string, is_available: boolean) {
    const { error } = await supabase.from("menu_items").update({ is_available }).eq("id", id);
    if (error) throw error;
  },
};

function randomToken(): string {
  const alphabet = "abcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `tbl_${out}`;
}

export const tableService = {
  async list(): Promise<RestaurantTable[]> {
    const { data, error } = await supabase
      .from("restaurant_tables")
      .select("*")
      .order("created_at");
    if (error) throw error;
    return (data ?? []) as unknown as RestaurantTable[];
  },
  async create(name: string) {
    const { error } = await supabase
      .from("restaurant_tables")
      .insert({ name, qr_token: randomToken() });
    if (error) throw error;
  },
  async update(id: string, patch: { name?: string; is_active?: boolean }) {
    const { error } = await supabase.from("restaurant_tables").update(patch).eq("id", id);
    if (error) throw error;
  },
  async remove(id: string) {
    const { error } = await supabase.from("restaurant_tables").delete().eq("id", id);
    if (error) throw error;
  },
};

function mapOrder(row: AnyRecord): Order {
  const rel = row["restaurant_tables"] as { name?: string } | null;
  return {
    ...(row as unknown as Order),
    subtotal: num(row["subtotal"]),
    tax_rate: num(row["tax_rate"]),
    tax_amount: num(row["tax_amount"]),
    tip_amount: num(row["tip_amount"]),
    total: num(row["total"]),
    items: ((row["items"] as Order["items"]) ?? []).map((i) => ({
      ...i,
      priceAtOrder: num(i.priceAtOrder),
      subtotal: num(i.subtotal),
    })),
    table_name: rel?.name ?? null,
  };
}

export const orderService = {
  async list(limit = 200): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*, restaurant_tables(name)")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return ((data ?? []) as AnyRecord[]).map(mapOrder);
  },
  async setStatus(id: string, status: Order["status"]) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
  },
  async markPaid(id: string, method: PaymentMethod) {
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "PAID",
        payment_method: method,
        paid_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  },
  async markUnpaid(id: string) {
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: "UNPAID", payment_method: null, paid_at: null })
      .eq("id", id);
    if (error) throw error;
  },
};

export const restaurantService = {
  async get(): Promise<Restaurant | null> {
    const { data, error } = await supabase.from("restaurant").select("*").limit(1).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as AnyRecord;
    return {
      ...(row as unknown as Restaurant),
      opening_hours: (row["opening_hours"] ?? {}) as Restaurant["opening_hours"],
      theme: (row["theme"] ?? {}) as Restaurant["theme"],
    };
  },
  async update(id: string, patch: Record<string, unknown>) {
    const { error } = await supabase
      .from("restaurant")
      .update(patch as never)
      .eq("id", id);
    if (error) throw error;
  },
};

export interface AnalyticsEventRow {
  event_type: string;
  table_id: string | null;
  item_id: string | null;
  created_at: string;
}

export const analyticsService = {
  async events(sinceIso: string): Promise<AnalyticsEventRow[]> {
    const { data, error } = await supabase
      .from("analytics_events")
      .select("event_type, table_id, item_id, created_at")
      .gte("created_at", sinceIso)
      .limit(5000);
    if (error) throw error;
    return (data ?? []) as unknown as AnalyticsEventRow[];
  },
};
