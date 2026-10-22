"use client"

import { useState } from "react"
import { toast } from "sonner"
import { MoneyText } from "@/components/money-text"
import { StatTile } from "@/components/stat-tile"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  ClockIcon,
  FlagIcon,
  ShieldIcon,
  StarIcon,
  TrendingUpIcon,
  WalletIcon,
} from "@/components/icons/runeicons"
import {
  BallSticker,
  BootsSticker,
  GoalNetSticker,
  GoaaallBannerSticker,
  SparkleSticker,
  WhistleSticker,
  WarningCardSticker,
} from "@/components/stickers"
import { PitchView } from "@/components/pitch/pitch-view"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FORMATIONS } from "@/domain/formations"
import { CONTRAST_PAIRS } from "@/lib/tokens"

// Demo constants only (spec 0005 value sourcing): nothing here is user data.
const SAMPLE_INCOME_KOBO = 1_200_000
const SAMPLE_FIXED_COSTS_KOBO = 1_200_000
const CURRENCY = "NGN"

const TOKEN_PAIRS = CONTRAST_PAIRS.map((pair) => ({
  label: `${pair.foreground} / ${pair.background}`,
  bg: pair.background,
  fg: pair.foreground,
  note: pair.use,
}))

const TYPE_SCALE = [
  { utility: "text-xs", size: "12px", use: "Captions, labels" },
  { utility: "text-sm", size: "14px", use: "Secondary copy" },
  { utility: "text-base", size: "16px", use: "Body, inputs" },
  { utility: "text-lg", size: "20px", use: "Card titles" },
  { utility: "text-2xl", size: "25px", use: "Section headings" },
  { utility: "text-4xl", size: "39px", use: "Page titles, hero amounts" },
  { utility: "text-5xl", size: "49px", use: "Display numbers" },
]

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="border-border border-t pt-8">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
        {description}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function DesignSystemDemo() {
  const [formationIndex, setFormationIndex] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const formation = FORMATIONS[formationIndex]

  const amounts = formation.positions.map((p) => ({
    amountMinorUnits: Math.round((p.basisPoints * SAMPLE_INCOME_KOBO) / 10000),
    currency: CURRENCY,
  }))

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Payday Pitch
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight">
            Design system, live
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-base">
            Every token, type step, base component, sticker and the pitch view
            on one page. This page is the proof the system works, not a product
            screen.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="mt-10 space-y-12">
        <Section
          title="Color"
          description="Semantic tokens only. Each card shows a foreground on its background; both must clear WCAG AA, and a unit test on the token values enforces it."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {TOKEN_PAIRS.map((pair) => (
              <div
                key={pair.label}
                className="border-border rounded-lg border p-4"
                style={{
                  backgroundColor: `var(--${pair.bg})`,
                  color: `var(--${pair.fg})`,
                }}
              >
                <p className="font-mono text-xs">{pair.label}</p>
                <p className="mt-2 text-lg font-semibold">₦1,200.00 covered</p>
                <p className="text-sm">{pair.note}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-3 text-sm">
            Focus ring against background:{" "}
            <span
              className="inline-block size-5 rounded-md border-2 align-middle"
              style={{
                borderColor: "var(--ring)",
                backgroundColor: "var(--background)",
              }}
            />
          </p>
        </Section>

        <Section
          title="Type"
          description="Space Grotesk at 400, 500 and 700, on a 1.25 modular scale, mobile first."
        >
          <div className="space-y-3">
            {TYPE_SCALE.map((step) => (
              <div
                key={step.utility}
                className="flex flex-wrap items-baseline gap-3"
              >
                <span className={`font-bold tracking-tight ${step.utility}`}>
                  Line up your pay
                </span>
                <span className="text-muted-foreground font-mono text-xs">
                  {step.size} {step.utility} {step.use}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Buttons and badges"
          description="Every variant, plus focus rings that stay visible in both themes."
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Saved to roster">
              <StarIcon />
            </Button>
            <Badge>New</Badge>
            <Badge variant="secondary">Covered</Badge>
            <Badge variant="destructive">Short by ₦4,000</Badge>
            <Badge variant="outline">4-4-2</Badge>
          </div>
        </Section>

        <Section
          title="Form, tabs, dialog, tooltip, toast"
          description="Inputs keep body size so iOS never zooms on focus."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="demo-income" className="text-sm font-medium">
                Monthly pay
              </label>
              <Input
                id="demo-income"
                defaultValue="1200000"
                inputMode="numeric"
              />
              <p className="text-muted-foreground text-xs">
                Kobo, never a float.
              </p>
            </div>
            <Tabs defaultValue="matchday">
              <TabsList>
                <TabsTrigger value="matchday">Matchday</TabsTrigger>
                <TabsTrigger value="season">Season</TabsTrigger>
              </TabsList>
              <TabsContent
                value="matchday"
                className="text-muted-foreground text-sm"
              >
                Rent, light and school fees take the back four.
              </TabsContent>
              <TabsContent
                value="season"
                className="text-muted-foreground text-sm"
              >
                Emergency fund climbs the table over twelve matchdays.
              </TabsContent>
            </Tabs>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Park the Bus?</DialogTitle>
                  <DialogDescription>
                    Defense takes everything this month. Your striker waits for
                    the next payday.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button>Play it</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover or focus me</Button>
              </TooltipTrigger>
              <TooltipContent>
                The guilt-free sub: small fun, no apology.
              </TooltipContent>
            </Tooltip>
            <Button
              variant="secondary"
              onClick={() =>
                toast.success("Whistle blown: plan saved for this matchday.")
              }
            >
              Fire a toast
            </Button>
          </div>
        </Section>

        <Section
          title="Numbers that matter"
          description="Every amount on screen renders through MoneyText, which delegates to the domain money module."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile
              label="Emergency fund"
              value={
                <MoneyText
                  amountMinorUnits={SAMPLE_FIXED_COSTS_KOBO * 6}
                  currency={CURRENCY}
                />
              }
              delta={{ value: "6 months of costs", direction: "up" }}
            />
            <StatTile
              label="Next match"
              value={
                <MoneyText amountMinorUnits={38_500} currency={CURRENCY} />
              }
            />
            <StatTile
              label="Debt left to cover"
              value={
                <MoneyText amountMinorUnits={250_000} currency={CURRENCY} />
              }
              delta={{ value: "Still on the pitch", direction: "down" }}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-lg">
            <MoneyText amountMinorUnits={999_999_999} currency={CURRENCY} />
            <MoneyText amountMinorUnits={100} currency={CURRENCY} />
            <MoneyText amountMinorUnits={0} currency={CURRENCY} />
          </div>
        </Section>

        <Section
          title="Stickers and icons"
          description="Hand drawn pen line pieces for celebration and warning moments, plus the vendored icon set. Both take color from the text token."
        >
          <div className="text-foreground flex flex-wrap items-end gap-6">
            <div className="flex flex-col items-center gap-1">
              <BallSticker className="size-12" />
              <span className="text-muted-foreground text-xs">ball</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <BootsSticker className="size-12" />
              <span className="text-muted-foreground text-xs">boots</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <WhistleSticker className="size-12" />
              <span className="text-muted-foreground text-xs">whistle</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <GoalNetSticker className="size-12" />
              <span className="text-muted-foreground text-xs">goal net</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <SparkleSticker className="size-12 text-[var(--volt)]" />
              <span className="text-muted-foreground text-xs">sparkle</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <WarningCardSticker className="size-12 text-[var(--destructive)]" />
              <span className="text-muted-foreground text-xs">
                warning card
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <GoaaallBannerSticker className="h-10 w-32" />
              <span className="text-muted-foreground text-xs">
                GOAAALL banner
              </span>
            </div>
          </div>
          <div className="text-muted-foreground mt-6 flex flex-wrap gap-6">
            <ShieldIcon />
            <WalletIcon />
            <TrendingUpIcon />
            <FlagIcon />
            <ClockIcon />
            <StarIcon />
          </div>
        </Section>

        <Section
          title="Pitch view"
          description="The formation every money screen uses: eleven slots on the grass with real amounts, the guilt-free sub on the bench. Switching shapes slides each player to its new slot, and stops sliding under reduced motion."
        >
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem]">
            <div>
              <PitchView
                formation={formation}
                amounts={amounts}
                selectedSlotKey={selectedSlot ?? undefined}
                onSelectSlot={(key) =>
                  setSelectedSlot(key === selectedSlot ? null : key)
                }
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Choose a shape</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {FORMATIONS.map((f, i) => (
                  <Button
                    key={f.name}
                    variant={i === formationIndex ? "default" : "outline"}
                    size="sm"
                    aria-pressed={i === formationIndex}
                    onClick={() => {
                      setFormationIndex(i)
                      setSelectedSlot(null)
                    }}
                  >
                    {f.name}
                  </Button>
                ))}
              </div>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>{formation.style}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  {formation.whenToPlay}
                </CardContent>
              </Card>
              <p className="mt-3 text-sm">
                Sample pay:{" "}
                <MoneyText
                  amountMinorUnits={SAMPLE_INCOME_KOBO}
                  currency={CURRENCY}
                />
              </p>
            </div>
          </div>
        </Section>
      </div>
    </main>
  )
}
