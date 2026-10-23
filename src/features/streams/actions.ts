// Income stream CRUD (spec 0007 API surface). RLS owns authorization; the
// explicit user_id filters are defense in depth, and the claims id never
// comes from the client. A zero-row write means the row was never theirs
// (or is gone): not_found. Expected failures return codes, never throw.
"use server"

import { revalidatePath } from "next/cache"

import { actionError, actionOk, authedAction } from "@/lib/actions"
import { idSchema, incomeSchema } from "@/features/streams/schema"

const GONE_MESSAGE = "That income is gone. Refresh and try again."

export const addIncomeAction = authedAction(
  incomeSchema,
  async ({ userId, client, input }) => {
    const { error } = await client.from("income_stream").insert({
      user_id: userId,
      name: input.name,
      amount_minor: input.amountNaira,
      currency: "NGN",
      payday_day: input.paydayDay,
    })
    if (error) throw error
    revalidatePath("/app")
    return actionOk()
  },
)

export const updateIncomeAction = authedAction(
  incomeSchema,
  async ({ userId, client, input }) => {
    if (!input.id) {
      return actionError("validation", "An update needs the row to change.")
    }
    const { data, error } = await client
      .from("income_stream")
      .update({
        name: input.name,
        amount_minor: input.amountNaira,
        payday_day: input.paydayDay,
      })
      .eq("id", input.id)
      .eq("user_id", userId)
      .select("id")
    if (error) throw error
    if (!data || data.length === 0) {
      return actionError("not_found", GONE_MESSAGE)
    }
    revalidatePath("/app")
    return actionOk()
  },
)

export const deleteIncomeAction = authedAction(
  idSchema,
  async ({ userId, client, input }) => {
    const { data, error } = await client
      .from("income_stream")
      .delete()
      .eq("id", input.id)
      .eq("user_id", userId)
      .select("id")
    if (error) throw error
    if (!data || data.length === 0) {
      return actionError("not_found", GONE_MESSAGE)
    }
    revalidatePath("/app")
    return actionOk()
  },
)
