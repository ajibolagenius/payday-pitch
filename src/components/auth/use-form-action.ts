// useActionState's React types model (state) => state, and form actions model
// (FormData) => void; the real function is (state, payload) with an ActionResult
// state. These casts bridge that once, so screens stay cast-free.
import type { ActionResult } from "@/lib/actions"

export function formAction<T>(action: unknown): {
  (
    state: ActionResult<T>,
    payload?: FormData | Record<string, unknown>,
  ): Promise<ActionResult<T>>
  (formData: FormData): Promise<void>
} {
  return action as {
    (
      state: ActionResult<T>,
      payload?: FormData | Record<string, unknown>,
    ): Promise<ActionResult<T>>
    (formData: FormData): Promise<void>
  }
}

// For a plain <form action={...}> with no useActionState pairing.
export function submitAction(
  action: unknown,
): (formData: FormData) => Promise<void> {
  return action as (formData: FormData) => Promise<void>
}
