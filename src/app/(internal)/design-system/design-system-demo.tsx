"use client"

/* eslint-disable @next/next/no-img-element -- the brand raster ladder must
   load the generated PNG files at their exact intrinsic sizes (spec 0010
   AC-3); next/image would resize them and defeat the Playwright size proof. */

import { useSyncExternalStore, useState } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { MoneyText } from "@/components/money-text"
import { StatTile } from "@/components/stat-tile"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Clock,
  Flag,
  ShieldCheck,
  Star,
  TrendUp,
  Wallet,
} from "@phosphor-icons/react"
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
import { BrandMark, Lineup, Wordmark } from "@/components/brand"
import { CONTRAST_PAIRS } from "@/lib/tokens"

// Demo constants only (spec 0005 value sourcing): nothing here is user data.
const SAMPLE_INCOME_KOBO = 1_200_000
const SAMPLE_FIXED_COSTS_KOBO = 1_200_000
const CURRENCY = "NGN"

const TOKEN_PAIRS = CONTRAST_PAIRS.map((pair, index) => ({
  key: `${pair.background}/${pair.foreground}/${pair.theme ?? "both"}/${index}`,
  label: `${pair.foreground} on ${pair.background}`,
  bg: pair.background,
  fg: pair.foreground,
  theme: pair.theme ?? "both",
  note: pair.use,
  over: pair.over,
  text: pair.text,
  // Graphics pairs (WCAG 1.4.11, min 3) carry no text sample; the Color
  // section shows them as bars, the Brand section proves them as marks.
  graphics: pair.min < 4.5,
}))

// The raster ladder (spec 0010 AC-3), mirroring the generate-icons jobs.
const BRAND_RASTER_SIZES = [512, 192, 180, 64, 48, 32, 16] as const

const TYPE_ROLES = [
  {
    name: "Melodrama",
    variable: "--font-heading",
    weights: "300 to 700",
    use: "Headings and display figures. Never italic, it has no italic cut.",
  },
  {
    name: "Switzer",
    variable: "--font-sans",
    weights: "400 to 700 plus italic",
    use: "UI copy, body, labels, captions, formation chips.",
  },
  {
    name: "Tabular",
    variable: "--font-money",
    weights: "400 to 700",
    use: "Every amount, through .money on MoneyText.",
  },
  {
    name: "Teko",
    variable: "--font-accent",
    weights: "400 to 700",
    use: "Pitch surfaces only: shirt numbers, bench label, zone headings.",
  },
]

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
  // Swatches only make sense in the theme they are declared for, and the page
  // itself renders in one theme at a time (spec 0009 theme-aware pairs).
  // next-themes knows the resolved theme only after mount, so the theme
  // specific rows appear then, keeping hydration identical on both passes.
  const { resolvedTheme } = useTheme()
  const subscribeEmpty = () => () => {}
  const mounted = useSyncExternalStore(
    subscribeEmpty,
    () => true,
    () => false,
  )
  // next-themes knows the stored choice on the client's first render but not
  // on the server pass, so `theme` stays light until mount: reading
  // resolvedTheme before mount desynchronizes hydration and React leaves the
  // server rendered styles in the DOM.
  const theme = mounted && resolvedTheme === "dark" ? "dark" : "light"
  const visiblePairs = TOKEN_PAIRS.filter(
    (pair) =>
      !pair.graphics &&
      (pair.theme === "both" || (mounted && pair.theme === theme)),
  )
  const graphicsPairs = TOKEN_PAIRS.filter(
    (pair) =>
      pair.graphics &&
      (pair.theme === "both" || (mounted && pair.theme === theme)),
  )

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
          title="Brand"
          description="The formation system (spec 0010): dots on a chip. Primary tier at 48 px and above, reduced tier below, forest chip for light surfaces and paper for dark. Rasters come from pnpm icons, the lockup from pnpm brand:lockup."
        >
          <div className="border-border rounded-lg border p-4">
            <div
              data-testid="brand-chip-forest"
              className="flex flex-wrap items-end gap-6"
            >
              <div className="flex items-center gap-3">
                <BrandMark tier="primary" chip="forest" className="size-16" />
                <BrandMark tier="reduced" chip="forest" className="size-16" />
                <Wordmark className="text-xl" />
              </div>
              <div className="flex items-center gap-2">
                <BrandMark tier="primary" chip="forest" className="size-12" />
                <BrandMark tier="reduced" chip="forest" className="size-12" />
                <BrandMark
                  tier="primary"
                  chip="forest"
                  className="size-[64px]"
                />
                <BrandMark
                  tier="reduced"
                  chip="forest"
                  className="size-[64px]"
                />
                <BrandMark
                  tier="primary"
                  chip="forest"
                  className="size-[48px]"
                />
                <BrandMark tier="reduced" chip="forest" className="size-8" />
                <BrandMark tier="reduced" chip="forest" className="size-6" />
                <BrandMark tier="reduced" chip="forest" className="size-4" />
              </div>
            </div>
            <div
              data-testid="brand-chip-paper"
              className="mt-4 flex flex-wrap items-end gap-6 border-t border-white/10 pt-4"
              style={{ backgroundColor: "var(--night)" }}
            >
              <div className="flex items-center gap-3">
                <BrandMark tier="primary" chip="paper" className="size-16" />
                <BrandMark tier="reduced" chip="paper" className="size-16" />
                <Wordmark
                  className="text-xl"
                  style={{ color: "var(--paper-50)" }}
                />
              </div>
              <div className="flex items-center gap-2">
                <BrandMark tier="primary" chip="paper" className="size-12" />
                <BrandMark tier="reduced" chip="paper" className="size-12" />
                <BrandMark
                  tier="primary"
                  chip="paper"
                  className="size-[64px]"
                />
                <BrandMark
                  tier="reduced"
                  chip="paper"
                  className="size-[64px]"
                />
                <BrandMark
                  tier="primary"
                  chip="paper"
                  className="size-[48px]"
                />
                <BrandMark tier="reduced" chip="paper" className="size-8" />
                <BrandMark tier="reduced" chip="paper" className="size-6" />
                <BrandMark tier="reduced" chip="paper" className="size-4" />
              </div>
            </div>
          </div>
          <div
            data-testid="brand-rasters"
            className="mt-4 flex flex-wrap items-end gap-4"
          >
            {BRAND_RASTER_SIZES.map((size) => (
              <figure key={size} className="text-center">
                <img
                  src={
                    size === 512
                      ? "/icons/icon-512.png"
                      : size === 192
                        ? "/icons/icon-192.png"
                        : size === 180
                          ? "/apple-icon.png"
                          : `/icons/favicon-${size}.png`
                  }
                  width={size}
                  height={size}
                  alt=""
                  className="mx-auto"
                  style={{ width: size, height: size }}
                />
                <figcaption className="text-muted-foreground font-mono text-xs">
                  {size}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-6">
            <div
              data-testid="brand-maskable"
              className="relative size-32 overflow-hidden rounded-full"
              style={{ backgroundColor: "var(--forest-700)" }}
            >
              <img
                src="/icons/icon-maskable-512.png"
                width={128}
                height={128}
                alt=""
                className="size-full"
              />
              {/* The safe circle, radius 156 of 512, what a launcher may keep. */}
              <span
                className="pointer-events-none absolute rounded-full border-2 border-dashed border-white/70"
                style={{
                  inset: `${(1 - 312 / 512) * 50}%`,
                  aspectRatio: "1",
                }}
              />
            </div>
            <p className="text-muted-foreground max-w-xs text-sm">
              Maskable master under the launcher crop: the formation rides at
              0.72 inside the dashed safe circle, keeper edge included.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-8">
            <img
              src="/brand/lockup-horizontal.svg"
              width={368}
              height={80}
              alt="Payday Pitch lockup"
              data-testid="brand-lockup"
              className="max-w-full"
            />
            <Lineup
              data-testid="brand-lineup"
              className="h-9 w-auto"
              style={{ width: 128 }}
            />
          </div>
        </Section>

        <Section
          title="Color"
          description="Semantic tokens only. Each card shows a foreground on its background; text pairs clear WCAG AA and a unit test enforces it. The bars at the bottom are graphics only pairs (3:1), proved by the marks in the Brand section."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {visiblePairs.map((pair) => (
              <div
                key={pair.key}
                className="border-border rounded-lg border p-4"
                style={{
                  backgroundColor: pair.over
                    ? `color-mix(in oklab, var(--${pair.bg}) ${pair.over.alpha * 100}%, var(--${pair.over.token}))`
                    : `var(--${pair.bg})`,
                  color: `var(--${pair.text?.[theme] ?? pair.fg})`,
                }}
              >
                <p className="font-mono text-xs">
                  {pair.label}
                  <span className="ml-2 uppercase">{pair.theme}</span>
                </p>
                <p className="mt-2 text-lg font-semibold">
                  <span className="money">₦1,200.00</span> covered
                </p>
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
          {/* Graphics pairs (WCAG 1.4.11, 3:1): swatch bars, no text on them.
              The marks that prove them live in the Brand section above. */}
          <div className="mt-4 flex flex-wrap gap-3">
            {graphicsPairs.map((pair) => (
              <div key={pair.key} className="w-40">
                <div
                  data-testid="graphics-pair"
                  className="h-8 rounded-md border border-black/10"
                  style={{
                    backgroundColor: `var(--${pair.bg})`,
                    backgroundImage: `linear-gradient(135deg, var(--${pair.fg}) 0 65%, transparent 65%)`,
                  }}
                />
                <p className="text-muted-foreground mt-1 font-mono text-xs">
                  {pair.label} · 3:1
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Type"
          description="Four vendored Fontshare faces on a 1.25 modular scale, mobile first. Amounts always ride Tabular through the .money class."
        >
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {TYPE_ROLES.map((role) => (
              <div
                className="border-border rounded-lg border p-3"
                key={role.name}
              >
                <p className="text-lg font-semibold">{role.name}</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {role.variable} · {role.weights}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">{role.use}</p>
              </div>
            ))}
          </div>
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
              <Star weight="fill" size={20} />
            </Button>
            <Badge>New</Badge>
            <Badge variant="secondary">Covered</Badge>
            <Badge variant="destructive">
              Short by <span className="money">₦4,000</span>
            </Badge>
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
          description="Hand drawn pen line pieces for celebration and warning moments, plus the app level Phosphor set in regular and fill weights. Both take color from the text token."
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
              <SparkleSticker className="size-12 text-[var(--gold-300)]" />
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
          <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-6">
            <ShieldCheck weight="regular" size={24} />
            <Wallet weight="regular" size={24} />
            <TrendUp weight="regular" size={24} />
            <Flag weight="regular" size={24} />
            <Clock weight="regular" size={24} />
            <Star weight="regular" size={24} />
            <ShieldCheck weight="fill" size={24} />
            <Wallet weight="fill" size={24} />
            <TrendUp weight="fill" size={24} />
            <Flag weight="fill" size={24} />
            <Clock weight="fill" size={24} />
            <Star weight="fill" size={24} />
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
