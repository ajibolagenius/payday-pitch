"use client"

// Naira entry, one field for every amount the person types (spec 0007 AC-2).
// The value stays a string here: parsing to kobo happens in the action's Zod
// schema, through src/domain/money.ts, never in a component. inputMode gives
// the phone decimal keyboard, and the currency code is shown rather than a
// glyph, so a non naira account is not mislabelled.
import { useId } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function AmountField({
  label,
  value,
  onChange,
  currency,
  error,
  className,
  name = "amountNaira",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  currency: string
  error?: string
  className?: string
  name?: string
}) {
  const id = useId()
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="pr-12"
        />
        <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs font-medium">
          {currency}
        </span>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}
