export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export const ORDER_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
];

export const CUSTOMER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Order Received",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STAFF_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "New",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

export type OpeningHours = Partial<Record<string, DayHours>>;

export interface Theme {
  primary?: string;
  accent?: string;
  background?: string;
  text?: string;
}

export type MenuTemplate = "modern" | "elegant" | "minimal";

export type PaymentStatus = "UNPAID" | "PAID";

export type PaymentMethod = "CASH" | "CARD" | "UPI" | "ONLINE";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Cash",
  CARD: "Card",
  UPI: "UPI",
  ONLINE: "Paid online",
};

export const TIP_PRESETS = [0, 5, 10, 15] as const;

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  cover_image: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  maps_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  whatsapp_number: string | null;
  opening_hours: OpeningHours;
  theme: Theme;
  template: string;
  is_active: boolean;
  tax_rate: number;
  tax_label: string;
  tips_enabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  is_veg: boolean;
  is_spicy: boolean;
  is_featured: boolean;
  is_available: boolean;
  display_order: number;
}

export interface RestaurantTable {
  id: string;
  name: string;
  qr_token: string;
  is_active: boolean;
  created_at?: string;
}

export interface OrderItem {
  menuItemId: string;
  itemName: string;
  priceAtOrder: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: number;
  table_id: string | null;
  items: OrderItem[];
  subtotal: number;
  total: number;
  customer_note: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  table_name?: string | null;
}

export interface CartLine {
  menuItemId: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
}

export interface CartState {
  tableToken: string;
  sessionId: string;
  createdAt: string;
  items: CartLine[];
}

export type MenuLoadStatus = "ok" | "invalid" | "inactive";

export interface PublicMenuPayload {
  status: MenuLoadStatus;
  restaurant: Restaurant | null;
  table: { id: string; name: string; qr_token: string } | null;
  categories: Category[];
  items: MenuItem[];
}
