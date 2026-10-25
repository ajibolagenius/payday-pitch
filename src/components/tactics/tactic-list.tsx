"use client"

// The saved tactics (spec 0008 AC-2, AC-10). Opening one is a URL change, so the
// board re-reads its current pinned version on the server rather than trusting
// what the browser holds. A delete is a confirmation, because the tactic may be
// what a played month points at.
import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { MAX_TACTICS, TACTIC_NAME_MAX_LENGTH } from "@/domain/tactics"
import { deleteTactic, renameTactic } from "@/features/tactics/actions"
import type { SavedTacticSummary } from "@/features/tactics/board"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function TacticRow({
  tactic,
  active,
}: {
  tactic: SavedTacticSummary
  active: boolean
}) {
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(tactic.name)
  const [pending, start] = useTransition()

  function save() {
    start(async () => {
      const result = await renameTactic({ tacticId: tactic.id, name })
      if (result.ok) {
        setRenaming(false)
        return
      }
      toast.error(result.error.message)
    })
  }

  function remove() {
    start(async () => {
      const result = await deleteTactic({ tacticId: tactic.id })
      if (result.ok) {
        toast.success(`Deleted ${tactic.name}. Its name stays reserved.`)
        return
      }
      toast.error(result.error.message)
    })
  }

  return (
    <li className="border-border flex flex-wrap items-center gap-2 border-b py-2 last:border-b-0">
      {renaming ? (
        <div className="flex w-full gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="New name"
            maxLength={TACTIC_NAME_MAX_LENGTH}
            className="flex-1"
          />
          <Button type="button" size="sm" onClick={save} disabled={pending}>
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setName(tactic.name)
              setRenaming(false)
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <>
          <Link
            href={`/app/tactics?tactic=${tactic.id}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "min-w-0 flex-1 truncate font-medium underline underline-offset-4",
              active ? "text-accent" : "text-foreground",
            )}
          >
            {tactic.name}
          </Link>
          {tactic.shapeName ? (
            <span className="text-muted-foreground text-sm">
              {tactic.shapeName}
            </span>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setRenaming(true)}
          >
            Rename
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="ghost">
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete {tactic.name}?</DialogTitle>
                <DialogDescription>
                  Any month you already played keeps its own copy of this plan,
                  so it stays on the books unchanged. The name stays reserved,
                  so a new tactic cannot take it.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Keep it
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={remove}
                  disabled={pending}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </li>
  )
}

export function TacticList({
  tactics,
  activeId,
}: {
  tactics: SavedTacticSummary[]
  activeId: number | null
}) {
  return (
    <section
      aria-labelledby="saved-tactics"
      className="bg-card text-card-foreground rounded-xl border p-4"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="saved-tactics" className="text-lg font-bold tracking-tight">
          Your tactics
        </h2>
        <span className="text-muted-foreground text-sm">
          {tactics.length} of {MAX_TACTICS} used
        </span>
      </div>
      {tactics.length === 0 ? (
        <p className="text-muted-foreground mt-2 text-sm">
          Nothing saved yet. Move a share below and save it as your own plan.
        </p>
      ) : (
        <ul className="mt-2">
          {tactics.map((tactic) => (
            <TacticRow
              key={tactic.id}
              tactic={tactic}
              active={tactic.id === activeId}
            />
          ))}
        </ul>
      )}
      <Link
        href="/app/tactics"
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "mt-3",
        })}
      >
        Start from a library shape
      </Link>
    </section>
  )
}
