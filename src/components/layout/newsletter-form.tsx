"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useUI } from "@/lib/store/ui";

export function NewsletterForm({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const toast = useUI((s) => s.toast);
  const [email, setEmail] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) {
          toast("Please enter a valid email address.", "error");
          return;
        }
        setEmail("");
        toast("You're in! Check your inbox for 10% off — code WELCOME10.", "success");
      }}
      className={cn(
        "flex border-b",
        tone === "dark" ? "border-paper/40 focus-within:border-paper" : "border-ink/30 focus-within:border-ink",
      )}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        aria-label="Email address"
        className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-current/50"
      />
      <button type="submit" aria-label="Subscribe" className="px-1">
        <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
