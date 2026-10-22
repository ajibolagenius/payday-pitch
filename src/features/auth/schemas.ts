// Shared auth form schemas (spec 0006). Email is trimmed and lowercased here,
// once, so case consistency keeps enumeration protection and the e2e suite
// honest. Password ceiling is Supabase's own bcrypt limit; a longer value
// would be silently truncated server-side.
import { z } from "zod"

export const emailInput = z.string().trim().toLowerCase().min(3).max(254)

export const passwordInput = z.string().min(8).max(72)

export const credentialsSchema = z.object({
  email: emailInput,
  password: passwordInput,
})

export const recoverSchema = z.object({
  email: emailInput,
})

export const resetPasswordSchema = z
  .object({
    password: passwordInput,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "The passwords do not match.",
  })

export type CredentialsInput = z.infer<typeof credentialsSchema>
export type RecoverInput = z.infer<typeof recoverSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
