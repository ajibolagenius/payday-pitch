// Fixed cost CRUD (spec 0007 API surface). Same shape as income streams:
// claims identity, RLS plus explicit owner filters, zero-row write = not_found.
"use server"

import { revalidatePath } from "next/cache"

import { actionError, actionOk, authedAction } from "@/lib/actions"
import { costSchema, idSchema } from "@/features/costs/schema"

const GONE_MESSAGE = "That cost is gone. Refresh and try again."

export const addFixedCostAction = authedAction(
  costSchema,
  async ({ userId, client, input }) => {
    const { error } = await client.from("fixed_cost").insert({
      user_id: userId,
      name: input.name,
      amount_minor: input.amountNaira,
      currency: "NGN",
    })
    if (error) throw error
    revalidatePath("/app")
    return actionOk()
  },
)

export const updateFixedCostAction = authedAction(
  costSchema,
  async ({ userId, client, input }) => {
    if (!input.id) return actionOk()
    const { data, error } = await client
      .from("fixed_cost")
      .update({ name: input.name, amount_minor: input.amountNaira })
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

export const deleteFixedCostAction = authedAction(
  idSchema,
  async ({ userId, client, input }) => {
    const { data, error } = await client
      .from("fixed_cost")
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
