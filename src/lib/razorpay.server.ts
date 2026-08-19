import { createHmac, timingSafeEqual } from "crypto";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function credentials() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

export type StartPaymentResult =
  | {
      ok: true;
      keyId: string;
      razorpayOrderId: string;
      amountPaise: number;
      currency: string;
      orderNumber: number;
      description: string;
    }
  | { ok: false; reason: "not_configured" | "not_found" | "already_paid" | "failed" };

export async function startRazorpayPayment(orderId: string): Promise<StartPaymentResult> {
  const creds = credentials();
  if (!creds) return { ok: false, reason: "not_configured" };

  const db = await admin();
  const { data: order } = await db
    .from("orders")
    .select("id, order_number, total, payment_status, razorpay_order_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false, reason: "not_found" };
  if (order.payment_status === "PAID") return { ok: false, reason: "already_paid" };

  const amountPaise = Math.round(Number(order.total) * 100);
  if (amountPaise < 100) return { ok: false, reason: "failed" };

  const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: `order-${order.order_number}`,
      notes: { app_order_id: order.id },
    }),
  });

  if (!response.ok) {
    console.error("Razorpay order creation failed", response.status);
    return { ok: false, reason: "failed" };
  }

  const created = (await response.json()) as { id?: string; amount?: number; currency?: string };
  if (!created.id) return { ok: false, reason: "failed" };

  await db.from("orders").update({ razorpay_order_id: created.id }).eq("id", order.id);

  return {
    ok: true,
    keyId: creds.keyId,
    razorpayOrderId: created.id,
    amountPaise: Number(created.amount ?? amountPaise),
    currency: created.currency ?? "INR",
    orderNumber: order.order_number,
    description: `Order #${order.order_number}`,
  };
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export type ConfirmPaymentResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "not_found" | "bad_signature" | "failed" };

export async function confirmRazorpayPayment(input: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<ConfirmPaymentResult> {
  const creds = credentials();
  if (!creds) return { ok: false, reason: "not_configured" };

  const db = await admin();
  const { data: order } = await db
    .from("orders")
    .select("id, razorpay_order_id, payment_status")
    .eq("id", input.orderId)
    .maybeSingle();

  if (!order) return { ok: false, reason: "not_found" };
  if (order.razorpay_order_id !== input.razorpayOrderId) return { ok: false, reason: "bad_signature" };

  const expected = createHmac("sha256", creds.keySecret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  if (!safeEqual(expected, input.razorpaySignature)) return { ok: false, reason: "bad_signature" };

  if (order.payment_status === "PAID") return { ok: true };

  const { error } = await db
    .from("orders")
    .update({
      payment_status: "PAID",
      payment_method: "ONLINE",
      paid_at: new Date().toISOString(),
      razorpay_payment_id: input.razorpayPaymentId,
    })
    .eq("id", order.id);

  if (error) return { ok: false, reason: "failed" };
  return { ok: true };
}

export function razorpayConfigured(): boolean {
  return credentials() !== null;
}
