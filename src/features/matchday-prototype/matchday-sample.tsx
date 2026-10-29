"use client"

// The Matchday sample shell (spec 0011). All working state lives in this
// component's memory: no fetch, no storage, no cookie, no URL. A reset, or a
// page the browser restores from its back/forward cache, remounts the run by
// key, which reloads the default fixture (AC-1, AC-13).
import { useEffect, useRef, useState } from "react"
import { ArrowCounterClockwise, SlidersHorizontal } from "@phosphor-icons/react"

import { BrandMark, Wordmark } from "@/components/brand"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

import {
  CLOCKS,
  SCENARIOS,
  SCENARIO_NAMES,
  loadFixture,
  longDate,
  setClock,
  type Sample,
  type ScenarioName,
} from "./model"
import { Callout, WRAP, type SampleApi, type Screen } from "./parts"
import {
  AccountScreen,
  BuilderScreen,
  PreviewScreen,
  ReviewScreen,
  SavedScreen,
  SetupScreen,
} from "./plan-screens"
import {
  GoalScreen,
  RemindersScreen,
  ReportScreen,
  ShareScreen,
  TodayScreen,
} from "./today-screens"

const STEPS: { id: Screen; label: string }[] = [
  { id: "preview", label: "Sample" },
  { id: "account", label: "Account" },
  { id: "setup", label: "Setup" },
  { id: "builder", label: "Builder" },
  { id: "review", label: "Review" },
  { id: "saved", label: "Saved" },
  { id: "today", label: "Today" },
  { id: "report", label: "Report" },
]

const BRANCHES: Partial<Record<Screen, Screen>> = {
  goal: "today",
  reminders: "today",
  share: "today",
}

export function MatchdaySample() {
  const [run, setRun] = useState(0)
  useEffect(() => {
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) setRun((n) => n + 1)
    }
    window.addEventListener("pageshow", onShow)
    return () => window.removeEventListener("pageshow", onShow)
  }, [])
  return <SampleRun key={run} onReset={() => setRun((n) => n + 1)} />
}

function ScenarioPanel({
  sample,
  onLoad,
  onClock,
}: {
  sample: Sample
  onLoad: (name: ScenarioName) => void
  onClock: (clock: Sample["clock"]) => void
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<ScenarioName | null>(null)

  function load(name: ScenarioName) {
    onLoad(name)
    setPending(null)
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setPending(null)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <SlidersHorizontal size={20} aria-hidden /> Sample scenario
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn("max-h-[90dvh] overflow-y-auto sm:max-w-lg", WRAP)}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Sample scenario</DialogTitle>
          <DialogDescription>
            For the facilitator. Each scenario loads a named set of invented
            figures. Now showing: {SCENARIOS[sample.scenario].label}.
          </DialogDescription>
        </DialogHeader>

        {pending ? (
          <Callout tone="warning" title={`Load ${SCENARIOS[pending].label}?`}>
            <p>This discards the edits made in this visit.</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button autoFocus onClick={() => load(pending)}>
                Load it
              </Button>
              <Button variant="ghost" onClick={() => setPending(null)}>
                Keep my edits
              </Button>
            </div>
          </Callout>
        ) : null}

        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-semibold">Scenario</legend>
          <ul className="grid gap-2 sm:grid-cols-2">
            {SCENARIO_NAMES.map((name) => (
              <li key={name}>
                <Button
                  variant={sample.scenario === name ? "secondary" : "outline"}
                  aria-pressed={sample.scenario === name}
                  className="h-auto min-h-10 w-full justify-start py-2 text-left whitespace-normal"
                  onClick={() =>
                    sample.edited ? setPending(name) : load(name)
                  }
                >
                  {SCENARIOS[name].label}
                </Button>
              </li>
            ))}
          </ul>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-semibold">Sample date</legend>
          <div className="flex flex-wrap gap-2">
            {CLOCKS.map((c) => (
              <Button
                key={c.value}
                variant={sample.clock === c.value ? "secondary" : "outline"}
                aria-pressed={sample.clock === c.value}
                onClick={() => onClock(c.value)}
              >
                {c.label}
              </Button>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            Simulates time. Changing only the date keeps your edits.
          </p>
        </fieldset>
      </DialogContent>
    </Dialog>
  )
}

function SampleRun({ onReset }: { onReset: () => void }) {
  const [sample, setSample] = useState(() => loadFixture())
  const [screen, setScreen] = useState<Screen>("preview")
  const [reminders, setReminders] = useState<Record<string, boolean>>({})
  const mainRef = useRef<HTMLElement>(null)
  const navigated = useRef(false)

  // After a step change, put focus on the new screen's title so keyboard
  // and screen reader users start at the top of what changed.
  useEffect(() => {
    if (!navigated.current) return
    mainRef.current
      ?.querySelector<HTMLElement>("[data-screen-heading]")
      ?.focus()
  }, [screen])

  const api: SampleApi = {
    sample,
    apply: (outcome) => {
      if (!outcome.ok) return outcome.error
      setSample(outcome.sample)
      return null
    },
    replace: setSample,
    go: (next) => {
      navigated.current = true
      setScreen(next)
      window.scrollTo({ top: 0 })
    },
  }

  const active = BRANCHES[screen] ?? screen

  return (
    <div className={cn("flex min-h-dvh flex-col", WRAP)}>
      <header className="bg-card border-b">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <BrandMark tier="reduced" chip="auto" className="size-8" />
            <h1 className="text-xl">
              <Wordmark />
              <span className="sr-only">, Matchday sample</span>
            </h1>
            <Badge variant="outline">Fictional sample</Badge>
          </div>
          <div className="flex max-w-full min-w-0 flex-wrap gap-2">
            <ScenarioPanel
              sample={sample}
              onLoad={(name) => setSample(loadFixture(name))}
              onClock={(clock) => setSample(setClock(sample, clock))}
            />
            <Button variant="ghost" size="lg" onClick={onReset}>
              <ArrowCounterClockwise size={20} aria-hidden /> Reset
            </Button>
          </div>
        </div>
        <p className="bg-accent text-accent-foreground px-4 py-2 text-center text-sm">
          Every figure here is invented. Nothing is saved, sent or moved, and
          refreshing starts over.
        </p>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <nav aria-label="Sample steps" className="mb-8 space-y-2">
          <ol className="flex flex-wrap gap-1">
            {STEPS.map((step, i) => (
              <li key={step.id}>
                <button
                  type="button"
                  aria-current={active === step.id ? "step" : undefined}
                  onClick={() => api.go(step.id)}
                  className={cn(
                    "focus-visible:ring-ring/50 min-h-9 rounded-md px-2.5 text-sm outline-none focus-visible:ring-3",
                    active === step.id
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {i + 1}. {step.label}
                </button>
              </li>
            ))}
          </ol>
          <p className="text-muted-foreground text-xs">
            Sample date {longDate(sample.clock)} (simulated) ·{" "}
            {SCENARIOS[sample.scenario].label}
          </p>
        </nav>

        <main ref={mainRef}>
          {screen === "preview" && <PreviewScreen api={api} />}
          {screen === "account" && <AccountScreen api={api} />}
          {screen === "setup" && <SetupScreen api={api} />}
          {screen === "builder" && <BuilderScreen api={api} />}
          {screen === "review" && <ReviewScreen api={api} />}
          {screen === "saved" && <SavedScreen api={api} />}
          {screen === "today" && <TodayScreen api={api} />}
          {screen === "report" && <ReportScreen api={api} />}
          {screen === "goal" && <GoalScreen api={api} />}
          {screen === "reminders" && (
            <RemindersScreen api={api} on={reminders} setOn={setReminders} />
          )}
          {screen === "share" && <ShareScreen api={api} />}
        </main>
      </div>

      <footer className="text-muted-foreground border-t px-4 py-4 text-center text-xs">
        Payday Pitch · Matchday study. A test of the idea with invented figures:
        no bank connection, no money movement, no account.
      </footer>
    </div>
  )
}
