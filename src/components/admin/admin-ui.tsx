import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { OrderStatus } from "@/lib/types";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-lg border border-line bg-paper", className)}>{children}</div>;
}

export function CardHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {actions}
    </div>
  );
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-ink/5 text-ink",
  shipped: "bg-accent-soft text-accent-dark",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-soft text-muted",
};

const STATUS_TEXT: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[status])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {STATUS_TEXT[status]}
    </span>
  );
}

export const adminInput =
  "h-10 rounded-md border border-line bg-paper px-3 text-sm focus:border-ink focus:outline-none";

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th scope="col" className={cn("px-4 py-3 text-left text-xs font-medium text-muted", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-sm", className)}>{children}</td>;
}
