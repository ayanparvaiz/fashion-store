"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEMO_ADMIN, useAdminSession } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function AdminLogin() {
  const login = useAdminSession((s) => s.login);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <p className="text-center font-display text-3xl text-paper">
          FASHION<span className="text-accent">.</span>STORE
        </p>
        <p className="mt-1 text-center text-xs font-semibold tracking-[0.3em] text-paper/50">ADMIN</p>
        <form
          className="mt-8 space-y-4 rounded-lg bg-paper p-6 shadow-2xl"
          onSubmit={(e) => {
            e.preventDefault();
            if (login(email, password)) router.replace("/admin/");
            else setError(true);
          }}
        >
          <h1 className="flex items-center gap-2 text-lg font-semibold">
            <Lock className="size-4" /> Sign in
          </h1>
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-accent">Incorrect email or password.</p>}
          <Button type="submit" className="w-full" size="lg">
            Sign in
          </Button>
          <div className="rounded-md bg-soft p-3 text-xs">
            <p className="font-semibold">Demo credentials</p>
            <p className="mt-1 font-mono">{DEMO_ADMIN.email}</p>
            <p className="font-mono">{DEMO_ADMIN.password}</p>
            <button
              type="button"
              className="mt-2 font-semibold text-accent underline underline-offset-2"
              onClick={() => {
                setEmail(DEMO_ADMIN.email);
                setPassword(DEMO_ADMIN.password);
              }}
            >
              Fill in for me
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
