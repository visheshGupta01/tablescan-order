import type {
  Category,
  MenuItem,
  Order,
  OrderItem,
  PublicMenuPayload,
  Restaurant,
} from "@/types";

type AnyRecord = Record<string, unknown>;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function mapRestaurant(row: AnyRecord | null): Restaurant | null {
  if (!row) return null;
  return {
    ...(row as unknown as Restaurant),
    opening_hours: (row["opening_hours"] ?? {}) as Restaurant["opening_hours"],
    theme: (row["theme"] ?? {}) as Restaurant["theme"],
  };
}

function mapItem(row: AnyRecord): MenuItem {
  return { ...(row as unknown as MenuItem), price: Number(row["price"]) };
}

function mapOrder(row: AnyRecord, tableName?: string | null): Order {
  return {
    ...(row as unknown as Order),
    items: ((row["items"] as OrderItem[]) ?? []).map((i) => ({
      ...i,
      priceAtOrder: Number(i.priceAtOrder),
      subtotal: Number(i.subtotal),
    })),
    subtotal: Number(row["subtotal"]),
    tax_rate: Number(row["tax_rate"] ?? 0),
    tax_amount: Number(row["tax_amount"] ?? 0),
    tip_amount: Number(row["tip_amount"] ?? 0),
    total: Number(row["total"]),
    table_name: tableName ?? null,
  };
}

export async function loadPublicMenu(token: string): Promise<PublicMenuPayload> {
  const db = await admin();
  const empty = { restaurant: null, table: null, categories: [], items: [] };

  const { data: table } = await db
    .from("restaurant_tables")
    .select("id, name, qr_token, is_active")
    .eq("qr_token", token)
    .maybeSingle();

  if (!table) return { status: "invalid", ...empty };
  if (!table.is_active) return { status: "inactive", ...empty };


  const [restaurantRes, categoriesRes, itemsRes] = await Promise.all([
    db.from("restaurant").select("*").limit(1).maybeSingle(),
    db.from("categories").select("*").eq("is_active", true).order("display_order"),
    db.from("menu_items").select("*").order("display_order"),
  ]);

  return {
    status: "ok",
    restaurant: mapRestaurant(restaurantRes.data as AnyRecord | null),
    table: { id: table.id, name: table.name, qr_token: table.qr_token },
    categories: ((categoriesRes.data ?? []) as AnyRecord[]) as unknown as Category[],
    items: ((itemsRes.data ?? []) as AnyRecord[]).map(mapItem),
  };
}

export interface CreateOrderInput {
  token: string;
  sessionId: string;
  note?: string | undefined;
  tipAmount?: number | undefined;
  items: { menuItemId: string; quantity: number }[];
}

export type CreateOrderResult =
  | { ok: true; orderId: string; orderNumber: number; tableName: string }
  | { ok: false; reason: "invalid_table" | "inactive_table" | "empty_cart" | "failed" }
  | { ok: false; reason: "unavailable"; unavailable: string[] };

export async function createOrderSecure(input: CreateOrderInput): Promise<CreateOrderResult> {
  const db = await admin();

  const { data: table } = await db
    .from("restaurant_tables")
    .select("id, name, is_active")
    .eq("qr_token", input.token)
    .maybeSingle();

  if (!table) return { ok: false, reason: "invalid_table" };
  if (!table.is_active) return { ok: false, reason: "inactive_table" };

  const wanted = input.items.filter((i) => i.quantity > 0);
  if (wanted.length === 0) return { ok: false, reason: "empty_cart" };

  const { data: rows } = await db
    .from("menu_items")
    .select("id, name, price, is_available")
    .in(
      "id",
      wanted.map((i) => i.menuItemId),
    );

  const byId = new Map((rows ?? []).map((r) => [r.id, r]));
  const unavailable: string[] = [];
  const items: OrderItem[] = [];

  for (const line of wanted) {
    const row = byId.get(line.menuItemId);
    if (!row) {
      unavailable.push("An item in your cart");
      continue;
    }
    if (!row.is_available) {
      unavailable.push(row.name);
      continue;
    }
    const price = Number(row.price);
    const quantity = Math.min(Math.floor(line.quantity), 50);
    items.push({
      menuItemId: row.id,
      itemName: row.name,
      priceAtOrder: price,
      quantity,
      subtotal: Number((price * quantity).toFixed(2)),
    });
  }

  if (unavailable.length > 0) return { ok: false, reason: "unavailable", unavailable };
  if (items.length === 0) return { ok: false, reason: "empty_cart" };

  const subtotal = Number(items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));

  const { data: settings } = await db
    .from("restaurant")
    .select("tax_rate")
    .limit(1)
    .maybeSingle();

  const taxRate = Math.max(0, Math.min(50, Number(settings?.tax_rate ?? 0)));
  const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
  const tipAmount = Number(Math.max(0, Math.min(subtotal, Number(input.tipAmount ?? 0))).toFixed(2));
  const total = Number((subtotal + taxAmount + tipAmount).toFixed(2));

  const { data: order, error } = await db
    .from("orders")
    .insert({
      table_id: table.id,
      items: items as unknown as never,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      tip_amount: tipAmount,
      total,
      customer_note: input.note?.slice(0, 300) || null,
      session_id: input.sessionId,
      status: "PENDING",
    })
    .select("id, order_number")
    .single();

  if (error || !order) return { ok: false, reason: "failed" };

  await db.from("analytics_events").insert({
    event_type: "order_placed",
    table_id: table.id,
    session_id: input.sessionId,
  });

  return {
    ok: true,
    orderId: order.id,
    orderNumber: order.order_number,
    tableName: table.name,
  };
}

export async function loadPublicOrder(orderId: string): Promise<Order | null> {
  const db = await admin();
  const { data } = await db
    .from("orders")
    .select("*, restaurant_tables(name, qr_token)")
    .eq("id", orderId)
    .maybeSingle();
  if (!data) return null;
  const rel = (data as AnyRecord)["restaurant_tables"] as { name?: string } | null;
  return mapOrder(data as AnyRecord, rel?.name ?? null);
}

export async function loadTableOrders(token: string, sessionId: string): Promise<Order[]> {
  const db = await admin();
  const { data: table } = await db
    .from("restaurant_tables")
    .select("id, name")
    .eq("qr_token", token)
    .maybeSingle();
  if (!table) return [];
  const { data } = await db
    .from("orders")
    .select("*")
    .eq("table_id", table.id)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(10);
  return ((data ?? []) as AnyRecord[]).map((row) => mapOrder(row, table.name));
}

export async function recordEvent(payload: {
  eventType: string;
  token?: string | undefined;
  itemId?: string | undefined;
  categoryId?: string | undefined;
  sessionId?: string | undefined;
}) {
  const db = await admin();
  let tableId: string | null = null;
  if (payload.token) {
    const { data } = await db
      .from("restaurant_tables")
      .select("id")
      .eq("qr_token", payload.token)
      .maybeSingle();
    tableId = data?.id ?? null;
  }
  await db.from("analytics_events").insert({
    event_type: payload.eventType.slice(0, 40),
    table_id: tableId,
    item_id: payload.itemId ?? null,
    category_id: payload.categoryId ?? null,
    session_id: payload.sessionId ?? null,
  });
  return { ok: true };
}
