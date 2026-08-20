import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

interface RazorpayWebhookPayload {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; method?: string } };
    order?: { entity?: { id?: string } };
  };
}

export const Route = createFileRoute("/api/public/razorpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["RAZORPAY_WEBHOOK_SECRET"];
        if (!secret) return new Response("Not configured", { status: 503 });

        const signature = request.headers.get("x-razorpay-signature") ?? "";
        const body = await request.text();
        const expected = createHmac("sha256", secret).update(body).digest("hex");
        if (!signature || !safeEqual(expected, signature)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let parsed: RazorpayWebhookPayload;
        try {
          parsed = JSON.parse(body) as RazorpayWebhookPayload;
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const event = parsed.event ?? "";
        if (event !== "payment.captured" && event !== "order.paid") {
          return new Response("ignored");
        }

        const payment = parsed.payload?.payment?.entity;
        const razorpayOrderId = payment?.order_id ?? parsed.payload?.order?.entity?.id;
        if (!razorpayOrderId) return new Response("Missing order id", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("id, payment_status")
          .eq("razorpay_order_id", razorpayOrderId)
          .maybeSingle();

        if (!order) return new Response("Order not found", { status: 404 });
        if (order.payment_status === "PAID") return new Response("ok");

        const { error } = await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "PAID",
            payment_method: "ONLINE",
            paid_at: new Date().toISOString(),
            ...(payment?.id ? { razorpay_payment_id: payment.id } : {}),
          })
          .eq("id", order.id);

        if (error) return new Response("Update failed", { status: 500 });
        return new Response("ok");
      },
    },
  },
});
