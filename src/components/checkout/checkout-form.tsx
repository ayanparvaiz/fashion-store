"use client";

import { Banknote, Check, CreditCard, Lock, QrCode, Truck, Zap } from "lucide-react";
import { SmartImage as Image } from "@/components/ui/smart-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { useCartDetails } from "@/hooks/use-cart-details";
import { productAlt, productImage } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { placeOrder } from "@/lib/services/checkout";
import { useAccount, useCurrentCustomer, type Customer } from "@/lib/store/auth";
import { useUI } from "@/lib/store/ui";
import { isEmail, isSgPostalCode, normalizeSgPhone } from "@/lib/validation";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, TextArea } from "@/components/ui/field";
import { DiscountForm } from "@/components/cart/discount-form";
import { OrderTotals } from "@/components/cart/order-totals";

type Method = "standard" | "express";
type Errors = Partial<Record<"email" | "phone" | "firstName" | "lastName" | "address" | "postalCode", string>>;

function SectionTitle({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <h2 className="mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.14em]">
      <span className="grid size-6 place-items-center rounded-full bg-ink text-[11px] text-paper">{step}</span>
      {children}
    </h2>
  );
}

function initialForm(customer: Customer | null) {
  return {
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    firstName: customer?.address?.firstName ?? customer?.firstName ?? "",
    lastName: customer?.address?.lastName ?? customer?.lastName ?? "",
    address: customer?.address?.address ?? "",
    unit: customer?.address?.unit ?? "",
    postalCode: customer?.address?.postalCode ?? "",
    note: "",
  };
}

/** Renders after hydration so saved bag and account details are available. */
export function CheckoutForm() {
  const mounted = useMounted();
  if (!mounted) return <div className="min-h-[70vh]" />;
  return <CheckoutFormBody />;
}

function CheckoutFormBody() {
  const router = useRouter();
  const customer = useCurrentCustomer();
  const updateProfile = useAccount((s) => s.updateProfile);
  const toast = useUI((s) => s.toast);
  const [method, setMethod] = useState<Method>("standard");
  const { lines, totals, settings, discount, count } = useCartDetails(method);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [saveInfo, setSaveInfo] = useState(true);
  const [form, setForm] = useState(() => initialForm(customer));

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  if (lines.length === 0 && !placed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="heading-display text-3xl">Your bag is empty</h1>
        <p className="mt-3 text-sm text-muted">Add a few styles before checking out.</p>
        <LinkButton href="/collections/new-arrivals/" className="mt-8">
          Shop New Arrivals
        </LinkButton>
      </div>
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!isEmail(form.email)) next.email = "Enter a valid email address.";
    const phone = normalizeSgPhone(form.phone);
    if (!phone) next.phone = "Enter an 8-digit Singapore number, e.g. 9123 4567.";
    if (!form.firstName.trim()) next.firstName = "Required";
    if (!form.lastName.trim()) next.lastName = "Required";
    if (form.address.trim().length < 5) next.address = "Enter your street address.";
    if (!isSgPostalCode(form.postalCode)) next.postalCode = "Postal codes have 6 digits.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }

    setSubmitting(true);
    const shippingAddress = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      address: form.address.trim(),
      unit: form.unit.trim(),
      postalCode: form.postalCode.trim(),
    };
    const result = placeOrder({
      email: form.email,
      phone: phone!,
      shippingAddress,
      shippingMethod: method,
      note: form.note,
    });
    if (!result.ok) {
      setSubmitting(false);
      toast(result.error, "error");
      return;
    }
    if (customer && saveInfo) updateProfile({ phone: phone!, address: shippingAddress });
    setPlaced(true);
    router.push(`/order-confirmation/?order=${result.order.number}`);
  };

  const methods: { id: Method; label: string; detail: string; price: number; icon: typeof Truck }[] = [
    {
      id: "standard",
      label: "Standard delivery",
      detail: "2–4 business days",
      price: totals.subtotal - totals.discount >= settings.freeShippingThreshold || discount?.type === "shipping" ? 0 : settings.standardShipping,
      icon: Truck,
    },
    { id: "express", label: "Express delivery", detail: "Next business day (order by 2pm)", price: settings.expressShipping, icon: Zap },
  ];

  return (
    <div className="grid lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[1fr_minmax(380px,0.8fr)]">
      <form
        onSubmit={submit}
        noValidate
        className="px-4 py-8 sm:px-8 lg:py-12 lg:pr-14 lg:pl-[max(2.5rem,calc((100vw-1440px)/2+2.5rem))]"
      >
        <div className="mx-auto max-w-xl space-y-10 lg:mr-0">
          <section>
            <SectionTitle step={1}>Contact</SectionTitle>
            {!customer && (
              <p className="-mt-2 mb-4 text-xs text-muted">
                Have an account?{" "}
                <Link href="/account/?next=/checkout/" className="font-semibold text-ink underline underline-offset-4">
                  Sign in
                </Link>{" "}
                for faster checkout.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} error={errors.email} />
              <Field
                label="Mobile number"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="9123 4567"
                required
                value={form.phone}
                onChange={set("phone")}
                error={errors.phone}
                hint="For delivery updates from our courier."
              />
            </div>
          </section>

          <section>
            <SectionTitle step={2}>Delivery address</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" autoComplete="given-name" required value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
              <Field label="Last name" autoComplete="family-name" required value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
              <Field
                label="Address"
                autoComplete="address-line1"
                placeholder="Block / street name"
                required
                className="sm:col-span-2"
                value={form.address}
                onChange={set("address")}
                error={errors.address}
              />
              <Field label="Unit number (optional)" autoComplete="address-line2" placeholder="#08-221" value={form.unit} onChange={set("unit")} />
              <Field
                label="Postal code"
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={6}
                required
                value={form.postalCode}
                onChange={set("postalCode")}
                error={errors.postalCode}
              />
              <div className="sm:col-span-2">
                <p className="mb-1.5 text-xs font-semibold">Country</p>
                <p className="flex h-11 items-center border border-line bg-soft px-3.5 text-sm">🇸🇬 Singapore</p>
              </div>
            </div>
            {customer && (
              <label className="mt-4 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={saveInfo} onChange={(e) => setSaveInfo(e.target.checked)} className="size-4 accent-ink" />
                Save this address to my account
              </label>
            )}
          </section>

          <section>
            <SectionTitle step={3}>Delivery method</SectionTitle>
            <div className="divide-y divide-line border border-line" role="radiogroup" aria-label="Delivery method">
              {methods.map((m) => (
                <label key={m.id} className={cn("flex cursor-pointer items-center gap-4 p-4", method === m.id && "bg-soft")}>
                  <input
                    type="radio"
                    name="method"
                    value={m.id}
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                    className="size-4 accent-ink"
                  />
                  <m.icon className="size-5 shrink-0" strokeWidth={1.6} />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{m.label}</span>
                    <span className="block text-xs text-muted">{m.detail}</span>
                  </span>
                  <span className="text-sm font-semibold">{m.price === 0 ? "Free" : formatPrice(m.price)}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle step={4}>Payment</SectionTitle>
            <div className="divide-y divide-line border border-line">
              <div className="flex items-start gap-4 bg-soft p-4">
                <span className="mt-0.5 grid size-4 place-items-center rounded-full bg-ink text-paper">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <Banknote className="size-5 shrink-0" strokeWidth={1.6} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Cash on Delivery</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink/70">
                    Pay the courier in cash when your order arrives. Please have{" "}
                    <strong>{formatPrice(totals.total)}</strong> ready — no card details needed.
                  </p>
                </div>
              </div>
              {[
                { label: "Credit / Debit card", icon: CreditCard },
                { label: "PayNow", icon: QrCode },
              ].map((p) => (
                <div key={p.label} className="flex items-center gap-4 p-4 text-subtle" aria-disabled>
                  <span className="size-4 rounded-full border border-line" />
                  <p.icon className="size-5 shrink-0" strokeWidth={1.6} />
                  <span className="flex-1 text-sm">{p.label}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Coming soon</span>
                </div>
              ))}
            </div>
          </section>

          <TextArea label="Order notes (optional)" placeholder="Delivery instructions, gift message…" value={form.note} onChange={set("note")} maxLength={300} />

          <div className="space-y-3">
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              <Lock className="size-4" />
              {submitting ? "Placing order…" : `Place order · ${formatPrice(totals.total)}`}
            </Button>
            <p className="text-center text-xs text-muted">
              By placing your order you agree to our{" "}
              <Link href="/terms/" className="underline">Terms</Link> and{" "}
              <Link href="/privacy/" className="underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </form>

      <aside className="order-first border-b border-line bg-soft px-4 py-8 sm:px-8 lg:order-none lg:border-b-0 lg:border-l lg:py-12 lg:pr-[max(2.5rem,calc((100vw-1440px)/2+2.5rem))] lg:pl-12">
        <div className="max-w-md space-y-6 lg:sticky lg:top-24">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em]">Order summary ({count})</h2>
          <ul className="space-y-4">
            {lines.map(({ product, size, quantity }) => (
              <li key={`${product.id}-${size}`} className="flex items-center gap-4">
                <div className="relative">
                  <div className="relative h-20 w-16 overflow-hidden bg-paper">
                    <Image src={productImage(product)} alt={productAlt(product)} fill sizes="64px" className="object-cover" />
                  </div>
                  <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-paper">
                    {quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted">
                    {product.color.name} / {size}
                  </p>
                </div>
                <p className="text-sm tabular-nums">{formatPrice(product.price * quantity)}</p>
              </li>
            ))}
          </ul>
          <DiscountForm subtotal={totals.subtotal} />
          <OrderTotals
            totals={totals}
            discountCode={discount?.code}
            shippingLabel={method === "express" ? "Express delivery" : "Standard delivery"}
          />
        </div>
      </aside>
    </div>
  );
}
