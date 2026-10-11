"use client";

import { Plus, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { STORAGE_PREFIX } from "@/lib/store/storage";
import { useSettings } from "@/lib/store/settings";
import { useUI } from "@/lib/store/ui";
import type { StoreSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, PageHeader, adminInput } from "./admin-ui";

function NumberField({ label, value, onChange, step = "0.01" }: { label: string; value: number; onChange: (n: number) => void; step?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium">{label}</span>
      <input type="number" min={0} step={step} className={cn(adminInput, "w-full")} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function SettingsPage() {
  const saved = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);
  const toast = useUI((s) => s.toast);
  const [form, setForm] = useState<StoreSettings>(saved);
  const set = (patch: Partial<StoreSettings>) => setForm((f) => ({ ...f, ...patch }));
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        update({ ...form, announcements: form.announcements.map((a) => a.trim()).filter(Boolean) });
        toast("Settings saved — the storefront is updated.", "success");
      }}
    >
      <PageHeader
        title="Settings"
        description="Changes apply to the storefront instantly."
        actions={
          <Button type="submit" size="sm" disabled={!dirty}>
            Save settings
          </Button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Announcement bar" />
          <div className="space-y-3 p-5">
            {form.announcements.map((a, i) => (
              <div key={i} className="flex gap-2">
                <input
                  aria-label={`Announcement ${i + 1}`}
                  className={cn(adminInput, "w-full")}
                  value={a}
                  onChange={(e) => set({ announcements: form.announcements.map((x, j) => (j === i ? e.target.value : x)) })}
                />
                <button
                  type="button"
                  aria-label={`Remove announcement ${i + 1}`}
                  className="rounded-md border border-line px-2 hover:border-ink"
                  onClick={() => set({ announcements: form.announcements.filter((_, j) => j !== i) })}
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => set({ announcements: [...form.announcements, ""] })}
              className="flex items-center gap-1.5 text-sm font-medium text-accent"
            >
              <Plus className="size-4" /> Add message
            </button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Delivery & payment" />
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <NumberField label="Standard (S$)" value={form.standardShipping} onChange={(n) => set({ standardShipping: n })} />
            <NumberField label="Express (S$)" value={form.expressShipping} onChange={(n) => set({ expressShipping: n })} />
            <NumberField label="Free over (S$)" value={form.freeShippingThreshold} onChange={(n) => set({ freeShippingThreshold: n })} step="1" />
            <label className="flex items-center gap-2 text-sm sm:col-span-3">
              <input type="checkbox" className="size-4 accent-ink" checked={form.codEnabled} onChange={(e) => set({ codEnabled: e.target.checked })} />
              Accept Cash on Delivery orders
            </label>
            {!form.codEnabled && (
              <p className="text-xs text-warning sm:col-span-3">With COD off and no online payments yet, checkout will be paused.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Store details" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium">Store name</span>
              <input className={cn(adminInput, "w-full")} value={form.storeName} onChange={(e) => set({ storeName: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium">Contact email</span>
              <input type="email" className={cn(adminInput, "w-full")} value={form.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium">Contact phone</span>
              <input className={cn(adminInput, "w-full")} value={form.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} />
            </label>
          </div>
        </Card>

        <Card>
          <CardHeader title="Demo data" />
          <div className="space-y-3 p-5 text-sm">
            <p className="text-muted">
              Everything (orders, product edits, discounts, accounts, settings) lives in this browser. Reset to start the demo fresh.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!confirm("Reset all demo data in this browser? This clears orders, product edits, accounts and settings.")) return;
                for (const key of Object.keys(localStorage)) if (key.startsWith(STORAGE_PREFIX)) localStorage.removeItem(key);
                // Full reload so every store re-initialises from its defaults.
                window.location.reload();
              }}
            >
              <RotateCcw className="size-4" /> Reset demo data
            </Button>
          </div>
        </Card>
      </div>
    </form>
  );
}
