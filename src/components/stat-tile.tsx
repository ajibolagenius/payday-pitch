import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Analytics style stat tile from the UI_2 reference. `value` takes a
// MoneyText or any pre-formatted node; the tile never formats anything itself.
export function StatTile({
  label,
  value,
  delta,
  className,
}: {
  label: string
  value: React.ReactNode
  delta?: { value: string; direction: "up" | "down" }
  className?: string
}) {
  return (
    <Card className={cn("gap-3 p-4", className)}>
      <CardHeader className="p-0">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-card-foreground text-5xl font-bold tracking-tight">
          {value}
        </p>
        {delta ? (
          <p
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              delta.direction === "up" ? "text-success" : "text-destructive",
            )}
          >
            {delta.direction === "up" ? (
              <ArrowUpIcon aria-hidden />
            ) : (
              <ArrowDownIcon aria-hidden />
            )}
            {delta.value}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
