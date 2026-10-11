import { Check, CircleX, Clock, PackageCheck, Truck } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Order placed",
  confirmed: "Confirmed",
  shipped: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STEPS: { status: OrderStatus; icon: typeof Check; text: string }[] = [
  { status: "pending", icon: Clock, text: "We've received your order." },
  { status: "confirmed", icon: Check, text: "We've called to confirm and are packing it." },
  { status: "shipped", icon: Truck, text: "Your parcel is on its way. Keep cash ready!" },
  { status: "delivered", icon: PackageCheck, text: "Delivered and paid. Enjoy!" },
];

export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    const at = order.history.find((h) => h.status === "cancelled")?.at;
    return (
      <div className="flex items-start gap-3 border border-accent/30 bg-accent-soft p-4 text-sm">
        <CircleX className="size-5 shrink-0 text-accent" />
        <div>
          <p className="font-semibold">This order was cancelled{at && ` on ${formatDateTime(at)}`}.</p>
          <p className="mt-1 text-ink/70">Questions? Reply to your confirmation email or contact us.</p>
        </div>
      </div>
    );
  }

  const reached = STEPS.findIndex((s) => s.status === order.status);
  return (
    <ol className="relative grid gap-6 sm:grid-cols-4 sm:gap-2">
      {STEPS.map((step, i) => {
        const done = i <= reached;
        const at = order.history.findLast((h) => h.status === step.status)?.at;
        return (
          <li key={step.status} className="relative flex gap-3 sm:flex-col sm:items-center sm:text-center">
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-[-1.5rem] left-[15px] h-6 w-0.5 sm:top-[15px] sm:right-1/2 sm:left-[-50%] sm:h-0.5 sm:w-full",
                  done ? "bg-ink" : "bg-line",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2",
                done ? "border-ink bg-ink text-paper" : "border-line bg-paper text-subtle",
                i === reached && "ring-4 ring-accent/20",
              )}
            >
              <step.icon className="size-4" />
            </span>
            <div>
              <p className={cn("text-sm font-semibold", !done && "text-subtle")}>{STATUS_LABEL[step.status]}</p>
              <p className="mt-0.5 text-xs text-muted">{done && at ? formatDateTime(at) : step.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
