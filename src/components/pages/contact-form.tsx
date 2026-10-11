"use client";

import { useState } from "react";
import { useUI } from "@/lib/store/ui";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea } from "@/components/ui/field";

export function ContactForm() {
  const toast = useUI((s) => s.toast);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="grid place-items-center bg-soft p-10 text-center">
        <p className="font-display text-2xl uppercase">Message sent</p>
        <p className="mt-2 text-sm text-muted">Thanks for reaching out — we&apos;ll get back to you within one business day.</p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
        toast("Message sent — we'll be in touch soon.", "success");
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" autoComplete="name" required />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Order number (optional)" name="order" placeholder="FS10265" />
        <Select label="Topic" name="topic" defaultValue="Order status">
          <option>Order status</option>
          <option>Returns &amp; exchanges</option>
          <option>Sizing help</option>
          <option>Product question</option>
          <option>Something else</option>
        </Select>
      </div>
      <TextArea label="Message" name="message" required rows={6} />
      <Button type="submit" size="lg">
        Send message
      </Button>
    </form>
  );
}
