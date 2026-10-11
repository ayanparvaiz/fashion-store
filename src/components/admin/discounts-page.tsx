"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { useDiscounts } from "@/lib/store/discounts";
import { useUI } from "@/lib/store/ui";
import type { DiscountCode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, PageHeader, Td, Th, adminInput } from "./admin-ui";

function describe(d: Pick<DiscountCode, "type" | "value" | "minSubtotal">) {
  const base = d.type === "percent" ? `${d.value}% off` : d.type === "fixed" ? `${formatPrice(d.value)} off` : "Free standard delivery";
  return d.minSubtotal > 0 ? `${base} orders over ${formatPrice(d.minSubtotal)}` : base;
}

export function DiscountsPage() {
  const codes = useDiscounts((s) => s.codes);
  const upsert = useDiscounts((s) => s.upsert);
  const remove = useDiscounts((s) => s.remove);
  const toast = useUI((s) => s.toast);
  const [draft, setDraft] = useState({ code: "", type: "percent" as DiscountCode["type"], value: 10, minSubtotal: 0 });
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <PageHeader title="Discounts" description="Codes shoppers can apply in the bag or at checkout." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px] [&>*]:min-w-0">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-line bg-soft/60">
                <tr>
                  <Th>Code</Th>
                  <Th>Offer</Th>
                  <Th>Uses</Th>
                  <Th>Active</Th>
                  <Th />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {codes.map((d) => (
                  <tr key={d.code}>
                    <Td className="font-mono font-semibold">{d.code}</Td>
                    <Td className="text-muted">{describe(d)}</Td>
                    <Td className="tabular-nums">{d.uses}</Td>
                    <Td>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={d.active}
                        aria-label={`${d.active ? "Disable" : "Enable"} ${d.code}`}
                        onClick={() => upsert({ ...d, active: !d.active })}
                        className={cn("relative h-6 w-11 rounded-full transition-colors", d.active ? "bg-success" : "bg-line")}
                      >
                        <span className={cn("absolute top-1 size-4 rounded-full bg-paper shadow transition-all", d.active ? "left-6" : "left-1")} />
                      </button>
                    </Td>
                    <Td className="text-right">
                      <button
                        type="button"
                        aria-label={`Delete ${d.code}`}
                        className="rounded p-2 text-accent hover:bg-accent-soft"
                        onClick={() => {
                          if (!confirm(`Delete code ${d.code}?`)) return;
                          remove(d.code);
                          toast(`Deleted ${d.code}`);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="h-fit">
          <CardHeader title="Create a code" />
          <form
            className="space-y-4 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              const code = draft.code.trim().toUpperCase().replace(/\s+/g, "");
              if (!/^[A-Z0-9]{3,20}$/.test(code)) return setError("Use 3–20 letters or numbers.");
              if (codes.some((c) => c.code === code)) return setError("That code already exists.");
              if (draft.type === "percent" && (draft.value <= 0 || draft.value > 90)) return setError("Percent must be 1–90.");
              if (draft.type === "fixed" && draft.value <= 0) return setError("Amount must be above 0.");
              upsert({ code, type: draft.type, value: draft.value, minSubtotal: draft.minSubtotal, active: true, uses: 0, description: describe(draft) });
              toast(`Created ${code}`, "success");
              setDraft({ code: "", type: "percent", value: 10, minSubtotal: 0 });
              setError(null);
            }}
          >
            <div>
              <label htmlFor="code" className="mb-1.5 block text-xs font-medium">Code</label>
              <input
                id="code"
                className={cn(adminInput, "w-full font-mono uppercase")}
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                placeholder="SUMMER15"
              />
            </div>
            <div>
              <label htmlFor="type" className="mb-1.5 block text-xs font-medium">Type</label>
              <select id="type" className={cn(adminInput, "w-full")} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as DiscountCode["type"] })}>
                <option value="percent">Percentage off</option>
                <option value="fixed">Fixed amount off</option>
                <option value="shipping">Free delivery</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {draft.type !== "shipping" && (
                <div>
                  <label htmlFor="value" className="mb-1.5 block text-xs font-medium">{draft.type === "percent" ? "Percent" : "Amount (S$)"}</label>
                  <input id="value" type="number" min={0} className={cn(adminInput, "w-full")} value={draft.value} onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })} />
                </div>
              )}
              <div>
                <label htmlFor="min" className="mb-1.5 block text-xs font-medium">Min. spend (S$)</label>
                <input id="min" type="number" min={0} className={cn(adminInput, "w-full")} value={draft.minSubtotal} onChange={(e) => setDraft({ ...draft, minSubtotal: Number(e.target.value) })} />
              </div>
            </div>
            <p className="text-xs text-muted">Preview: {describe(draft)}</p>
            {error && <p className="text-sm text-accent">{error}</p>}
            <Button type="submit" className="w-full">
              <Plus className="size-4" /> Create code
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
