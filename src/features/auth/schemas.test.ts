import { describe, expect, it } from "vitest"

import {
  credentialsSchema,
  emailInput,
  passwordInput,
  resetPasswordSchema,
} from "./schemas"

// Spec 0006 API surface: email normalized once, password 8 to 72 (covers: AC-1)
describe("emailInput", () => {
  it("trims and lowercases", () => {
    expect(emailInput.parse("  MixedCase@Example.COM ")).toBe(
      "mixedcase@example.com",
    )
  })
  it("rejects too short or too long", () => {
    expect(emailInput.safeParse("a@").success).toBe(false)
    expect(emailInput.safeParse(`${"x".repeat(250)}@example.com`).success).toBe(
      false,
    )
  })
})

describe("passwordInput", () => {
  it("requires at least 8 characters (AC-1)", () => {
    expect(passwordInput.safeParse("1234567").success).toBe(false)
    expect(passwordInput.safeParse("12345678").success).toBe(true)
  })
  it("caps at 72, Supabase's bcrypt limit", () => {
    expect(passwordInput.safeParse("x".repeat(73)).success).toBe(false)
  })
})

describe("credentialsSchema", () => {
  it("normalizes the email", () => {
    const parsed = credentialsSchema.parse({
      email: " USER@Example.com ",
      password: "str0ng-pass",
    })
    expect(parsed.email).toBe("user@example.com")
  })
})

// Covers: AC-4 (mismatched passwords fail with a field error on confirm)
describe("resetPasswordSchema", () => {
  it("accepts matching passwords", () => {
    expect(
      resetPasswordSchema.safeParse({
        password: "n3w-passw0rd",
        confirm: "n3w-passw0rd",
      }).success,
    ).toBe(true)
  })
  it("reports the mismatch on confirm", () => {
    const result = resetPasswordSchema.safeParse({
      password: "n3w-passw0rd",
      confirm: "other-pass",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues[0]
      expect(issue.path).toEqual(["confirm"])
      expect(issue.message).toBe("The passwords do not match.")
    }
  })
})
