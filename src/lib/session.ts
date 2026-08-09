const SESSION_KEY = "bh_session_id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

const ORDERS_KEY = "bh_orders";

export interface StoredOrderRef {
  id: string;
  orderNumber: number;
  tableToken: string;
  createdAt: string;
}

export function rememberOrder(ref: StoredOrderRef) {
  if (typeof window === "undefined") return;
  const list = getRememberedOrders().filter((o) => o.id !== ref.id);
  list.unshift(ref);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(list.slice(0, 20)));
}

export function getRememberedOrders(tableToken?: string): StoredOrderRef[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    const list = raw ? (JSON.parse(raw) as StoredOrderRef[]) : [];
    return tableToken ? list.filter((o) => o.tableToken === tableToken) : list;
  } catch {
    return [];
  }
}
