// Playing or correcting a month (spec 0007 AC-4 to AC-6, AC-9). The domain
// computes every planned amount, so the payload carries no client money: only
// the shape id and the entered actuals cross the boundary. The function
// re-checks all of it in one transaction. A refusal the domain can already see
// (a gap this shape cannot cover, no income yet) answers locally, so the person
// gets the shortfall without a round trip; the function still enforces it.
"use server"

import { revalidatePath } from "next/cache"

import { formatKobo, splitMatch } from "@/domain/money"
import { getShapePositions } from "@/features/match/library"
import { loadMoney } from "@/features/match/queries"
import { playSchema } from "@/features/match/schema"
import { actionError, actionOk, authedAction } from "@/lib/actions"

// What public.play_match returns (spec 0007 Decision): a code plus, on ok, the
// new row's id and period; on unable_to_cover, the gap in kobo; on validation,
// the sentence to show.
type PlayResult = {
  code?: unknown
  match_id?: unknown
  period?: unknown
  shortfall_minor?: unknown
  message?: unknown
}

const FALLBACK = {
  shape_not_found: "That formation is not in the library. Pick another.",
  shape_deprecated: "That formation has been retired. Pick another.",
  no_income: "Add what you earn first, then play the match.",
  mixed_currency: "One month is played in one currency. Fix the amounts.",
  unable_to_cover: "These costs are more than this shape can cover.",
  conflict: "This month was just played. Reload to see it.",
  validation: "Your numbers changed. Reload the pitch and play again.",
} as const

function friendly(code: string, result: PlayResult): string {
  const fromFunction = typeof result.message === "string" ? result.message : ""
  if (fromFunction) return fromFunction
  return code in FALLBACK
    ? FALLBACK[code as keyof typeof FALLBACK]
    : "Something went wrong. Try again."
}

export const playMatchAction = authedAction(
  playSchema,
  async ({ userId, client, input }) => {
    const positions = await getShapePositions(client, input.shapeId)
    if (!positions) {
      return actionError("shape_not_found", FALLBACK.shape_not_found)
    }
    const money = await loadMoney(client, userId)
    if (money.incomeMinorUnits === 0) {
      return actionError("no_income", FALLBACK.no_income)
    }

    const split = splitMatch(
      positions,
      money.incomeMinorUnits,
      money.costMinorUnits,
    )
    if (split.shortfallKobo !== null) {
      return actionError(
        "unable_to_cover",
        `This shape holds ${formatKobo({
          kobo: split.shortfallKobo,
          currency: money.currency,
        })} short of your costs. Choose a wider defense or trim them.`,
      )
    }

    const entered = new Map(
      input.actuals.map((actual) => [actual.spotIndex, actual.actualNaira]),
    )
    const lines = split.lines.map((line) => ({
      role: line.role,
      spot_index: line.spotIndex,
      label: line.label,
      basis_points: line.basisPoints,
      planned_minor: line.plannedKobo,
      // An entered 0 stays 0 (moved nothing); only a blank or an unmatched
      // spot is null (not logged).
      actual_minor: entered.get(line.spotIndex) ?? null,
      currency: money.currency,
    }))

    const { data, error } = await client.rpc("play_match", {
      p_shape_id: input.shapeId,
      p_lines: lines,
    })
    if (error) {
      // The one raw failure the function lets through: a concurrent second
      // play losing the one active match index for this period.
      if (error.code === "23505") {
        return actionError("conflict", FALLBACK.conflict)
      }
      throw error
    }
    const result = (data ?? {}) as PlayResult
    if (result.code === "ok") {
      revalidatePath("/app")
      return actionOk({
        matchId: Number(result.match_id),
        period: String(result.period),
      })
    }
    if (result.code === "unable_to_cover") {
      const shortfall = Number(result.shortfall_minor ?? 0)
      return actionError(
        "unable_to_cover",
        `This shape holds ${formatKobo({
          kobo: shortfall,
          currency: money.currency,
        })} short of your costs. Choose a wider defense or trim them.`,
      )
    }
    const code = typeof result.code === "string" ? result.code : "unexpected"
    return actionError(code, friendly(code, result))
  },
)
