"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full border border-line bg-paper px-3.5 text-sm text-ink placeholder:text-subtle transition-colors " +
  "focus:border-ink focus:outline-none aria-[invalid=true]:border-accent";

interface FieldProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export function Field({ label, error, hint, className, id, ...props }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-ink">
        {label}
        {props.required && <span className="text-accent"> *</span>}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(control, "h-11")}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-accent">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

interface TextAreaProps extends ComponentProps<"textarea"> {
  label: string;
}

export function TextArea({ label, className, id, ...props }: TextAreaProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-ink">
        {label}
      </label>
      <textarea id={inputId} className={cn(control, "min-h-24 py-2.5")} {...props} />
    </div>
  );
}

interface SelectProps extends ComponentProps<"select"> {
  label: string;
}

export function Select({ label, className, id, children, ...props }: SelectProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-ink">
        {label}
      </label>
      <select id={inputId} className={cn(control, "h-11 cursor-pointer")} {...props}>
        {children}
      </select>
    </div>
  );
}
