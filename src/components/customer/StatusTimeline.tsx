import { Check } from "lucide-react";
import { CUSTOMER_STATUS_LABEL, ORDER_FLOW, type OrderStatus } from "@/types";

export function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
        This order was cancelled. Please speak to our staff.
      </p>
    );
  }

  const currentIndex = ORDER_FLOW.indexOf(status);

  return (
    <ol className="space-y-3">
      {ORDER_FLOW.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step} className="flex items-center gap-3">
            <span
              className={`flex size-6 items-center justify-center rounded-full border text-[10px] ${
                done
                  ? "border-success bg-success text-success-foreground"
                  : active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
              }`}
            >
              {done ? <Check className="size-3.5" /> : active ? "●" : "○"}
            </span>
            <span
              className={`text-sm ${
                active ? "font-semibold text-foreground" : done ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {CUSTOMER_STATUS_LABEL[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
