"use client"

// One step of the walk's money entry, used by incomes and fixed costs
// (spec 0007 AC-1, AC-2, AC-10). Every save is immediate: the action writes,
// revalidates /app, and the row list re-renders from the fresh server read.
// The form below the list adds, and doubles as the editor when a row is
// picked, so there is one set of fields rather than two.
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { AmountField } from "@/components/walk/amount-field"
import { MoneyText } from "@/components/money-text"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ActionResult } from "@/lib/actions"

export type WalkEntry = {
  id: number
  name: string
  amountMinorUnits: number
  currency: string
  paydayDay?: number
}

type WriteAction = (
  payload?: FormData | Record<string, unknown>,
) => Promise<ActionResult<null>>

type Errors = Record<string, string[]>

export function EntryList({
  entries,
  currency,
  payday,
  totalLabel,
  emptyTitle,
  emptyHint,
  nameLabel,
  namePlaceholder,
  add,
  update,
  remove,
}: {
  entries: WalkEntry[]
  currency: string
  /** Incomes take a payday day; costs do not (AC-1). */
  payday?: boolean
  totalLabel: string
  emptyTitle: string
  emptyHint: string
  nameLabel: string
  namePlaceholder: string
  add: WriteAction
  update: WriteAction
  remove: WriteAction
}) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [day, setDay] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [pending, start] = useTransition()

  const total = entries.reduce((sum, entry) => sum + entry.amountMinorUnits, 0)

  function reset() {
    setName("")
    setAmount("")
    setDay("")
    setEditingId(null)
    setErrors({})
  }

  function edit(entry: WalkEntry) {
    setEditingId(entry.id)
    setName(entry.name)
    setAmount("")
    setDay(entry.paydayDay ? String(entry.paydayDay) : "")
    setErrors({})
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const payload: Record<string, unknown> = { name, amountNaira: amount }
    if (payday) payload.paydayDay = day
    if (editingId !== null) payload.id = editingId
    const run = editingId === null ? add : update
    start(async () => {
      const result = await run(payload)
      if (result.ok) {
        toast.success(editingId === null ? "Saved." : "Updated.")
        reset()
        return
      }
      if (result.error.code === "validation") {
        setErrors(result.error.fieldErrors ?? {})
        return
      }
      toast.error(result.error.message)
    })
  }

  function removeEntry(entry: WalkEntry) {
    start(async () => {
      const result = await remove({ id: entry.id })
      if (result.ok) {
        if (editingId === entry.id) reset()
        toast.success("Removed.")
        return
      }
      toast.error(result.error.message)
    })
  }

  return (
    <div className="space-y-4">
      {entries.length === 0 ? (
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm font-medium">{emptyTitle}</p>
          <p className="text-muted-foreground mt-1 text-sm">{emptyHint}</p>
        </div>
      ) : (
        <ul className="divide-border divide-y">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 py-2.5"
              data-testid="entry-row"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{entry.name}</p>
                {entry.paydayDay ? (
                  <p className="text-muted-foreground text-xs">
                    Pays on day {entry.paydayDay}
                  </p>
                ) : null}
              </div>
              <MoneyText
                amountMinorUnits={entry.amountMinorUnits}
                currency={entry.currency}
                className="text-sm font-medium"
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => edit(entry)}
                  aria-label={`Edit ${entry.name}`}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => removeEntry(entry)}
                  disabled={pending}
                  aria-label={`Remove ${entry.name}`}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {entries.length > 0 ? (
        <p className="text-muted-foreground flex items-baseline justify-between text-sm">
          <span>{totalLabel}</span>
          <MoneyText
            amountMinorUnits={total}
            currency={currency}
            className="text-foreground font-medium"
          />
        </p>
      ) : null}

      <form
        onSubmit={submit}
        className="border-border space-y-3 border-t pt-4"
        aria-label={editingId === null ? "Add an entry" : "Edit an entry"}
      >
        <div className="space-y-1.5">
          <label htmlFor="entry-name" className="text-sm font-medium">
            {nameLabel}
          </label>
          <Input
            id="entry-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={namePlaceholder}
            autoComplete="off"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "entry-name-error" : undefined}
          />
          {errors.name ? (
            <p
              id="entry-name-error"
              role="alert"
              className="text-destructive text-sm"
            >
              {errors.name.join(" ")}
            </p>
          ) : null}
        </div>

        <div className="flex gap-3">
          <AmountField
            label="Amount"
            value={amount}
            onChange={setAmount}
            currency={currency}
            error={errors.amountNaira?.join(" ")}
            className="flex-1"
          />
          {payday ? (
            <div className="w-32 space-y-1.5">
              <label htmlFor="entry-day" className="text-sm font-medium">
                Payday day (1 to 31)
              </label>
              <Input
                id="entry-day"
                name="paydayDay"
                value={day}
                onChange={(event) => setDay(event.target.value)}
                inputMode="numeric"
                placeholder="25"
                aria-required="true"
                aria-invalid={errors.paydayDay ? true : undefined}
                aria-describedby={
                  errors.paydayDay ? "entry-day-error" : undefined
                }
              />
              {errors.paydayDay ? (
                <p
                  id="entry-day-error"
                  role="alert"
                  className="text-destructive text-sm"
                >
                  {errors.paydayDay.join(" ")}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {editingId === null ? "Save" : "Update"}
          </Button>
          {editingId !== null ? (
            <Button
              type="button"
              variant="ghost"
              onClick={reset}
              disabled={pending}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  )
}
