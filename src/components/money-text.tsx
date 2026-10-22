import { formatKobo } from "@/domain/money"
import { cn } from "@/lib/utils"

// Every amount in the app renders through this component (spec 0005 money rule).
// Formatting lives in src/domain/money.ts; nothing formats money by hand.
export function MoneyText({
  amountMinorUnits,
  currency,
  className,
}: {
  amountMinorUnits: number
  currency: string
  className?: string
}) {
  return (
    <span className={cn("money", className)}>
      {formatKobo({ kobo: amountMinorUnits, currency })}
    </span>
  )
}
