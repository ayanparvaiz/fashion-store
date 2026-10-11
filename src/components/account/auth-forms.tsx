"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useAccount } from "@/lib/store/auth";
import { useUI } from "@/lib/store/ui";
import { isEmail, normalizeSgPhone } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function AuthForms({ onSuccess }: { onSuccess: () => void }) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const login = useAccount((s) => s.login);
  const register = useAccount((s) => s.register);
  const toast = useUI((s) => s.toast);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto w-full max-w-md">
      <div role="tablist" className="grid grid-cols-2 border-b border-line">
        {(
          [
            ["login", "Sign in"],
            ["register", "Create account"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id);
              setError(null);
            }}
            className={cn(
              "-mb-px border-b-2 py-3 text-xs font-bold uppercase tracking-[0.14em]",
              tab === id ? "border-ink" : "border-transparent text-muted hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "login" ? (
        <form
          className="mt-8 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            setBusy(true);
            const result = await login(String(data.get("email")), String(data.get("password")));
            setBusy(false);
            if (!result.ok) return setError(result.error);
            toast("Welcome back!", "success");
            onSuccess();
          }}
        >
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Field label="Password" name="password" type="password" autoComplete="current-password" required />
          {error && <p className="text-sm text-accent">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            Sign in
          </Button>
          <p className="text-center text-xs text-muted">
            New here?{" "}
            <button type="button" onClick={() => setTab("register")} className="font-semibold text-ink underline">
              Create an account
            </button>
          </p>
        </form>
      ) : (
        <form
          className="mt-8 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const email = String(data.get("email"));
            const password = String(data.get("password"));
            const phone = normalizeSgPhone(String(data.get("phone")));
            if (!isEmail(email)) return setError("Enter a valid email address.");
            if (!phone) return setError("Enter an 8-digit Singapore mobile number.");
            if (password.length < 8) return setError("Password must be at least 8 characters.");
            setBusy(true);
            const result = await register({
              email,
              password,
              phone,
              firstName: String(data.get("firstName")).trim(),
              lastName: String(data.get("lastName")).trim(),
            });
            setBusy(false);
            if (!result.ok) return setError(result.error);
            toast("Account created — welcome to Fashion Store!", "success");
            onSuccess();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" name="firstName" autoComplete="given-name" required />
            <Field label="Last name" name="lastName" autoComplete="family-name" required />
          </div>
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Field label="Mobile number" name="phone" type="tel" autoComplete="tel" placeholder="9123 4567" required />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            hint="At least 8 characters."
          />
          {error && <p className="text-sm text-accent">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            Create account
          </Button>
          <p className="text-center text-xs text-muted">
            Demo accounts are stored only in this browser.
          </p>
        </form>
      )}
    </div>
  );
}
