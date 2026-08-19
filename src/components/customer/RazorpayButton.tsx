import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { confirmOnlinePayment, startOnlinePayment } from "@/lib/public.functions";
import { formatCurrency } from "@/lib/format";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

type RazorpayCtor = new (options: Record<string, unknown>) => { open: () => void };

function loadCheckoutScript(): Promise<RazorpayCtor | null> {
  return new Promise((resolve) => {
    const w = window as unknown as { Razorpay?: RazorpayCtor };
    if (w.Razorpay) return resolve(w.Razorpay);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(w.Razorpay ?? null);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });
}

export function RazorpayButton({
  orderId,
  amount,
  label,
  className,
  onPaid,
}: {
  orderId: string;
  amount: number;
  label?: string;
  className?: string;
  onPaid?: () => void;
}) {
  const start = useServerFn(startOnlinePayment);
  const confirm = useServerFn(confirmOnlinePayment);
  const [busy, setBusy] = useState(false);

  const handlePay = async () => {
    setBusy(true);
    try {
      const session = await start({ data: { orderId } });

      if (!session.ok) {
        if (session.reason === "not_configured") {
          toast.error("Online payment isn't set up yet. Please pay at the counter.");
        } else if (session.reason === "already_paid") {
          toast.success("This bill is already paid.");
          onPaid?.();
        } else {
          toast.error("We couldn't start the payment. Please try again.");
        }
        return;
      }

      const Razorpay = await loadCheckoutScript();
      if (!Razorpay) {
        toast.error("Payment window failed to load. Check your connection and retry.");
        return;
      }

      const checkout = new Razorpay({
        key: session.keyId,
        order_id: session.razorpayOrderId,
        amount: session.amountPaise,
        currency: session.currency,
        name: "The Brew House",
        description: session.description,
        theme: { color: "#7c3f1d" },
        handler: (response: RazorpayResponse) => {
          void (async () => {
            const result = await confirm({
              data: {
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });
            if (result.ok) {
              toast.success("Payment received — thank you!");
              onPaid?.();
            } else {
              toast.error("We couldn't verify the payment. Please show this to our staff.");
            }
          })();
        },
        modal: {
          ondismiss: () => toast.info("Payment cancelled."),
        },
      });

      checkout.open();
    } catch {
      toast.error("Network problem — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button className={className} disabled={busy} onClick={() => void handlePay()}>
      <CreditCard className="size-4" />
      {busy ? "Opening payment…" : (label ?? `Pay Online · ${formatCurrency(amount)}`)}
    </Button>
  );
}
