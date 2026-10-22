import { describe, expect, it } from "vitest"

import {
  isSafeRelativePath,
  resolveRedirect,
  safeRedirectPath,
} from "./redirect"

// Spec 0006 AC-9 and the relative path rule (covers: AC-9)
describe("isSafeRelativePath", () => {
  it.each(["/app", "/app/plan-1", "/"])(
    "accepts site-relative path %s",
    (value) => expect(isSafeRelativePath(value)).toBe(true),
  )
  it.each([
    "//evil.com",
    "/\\evil.com",
    "https://evil.com",
    "evil.com/path",
    "",
    undefined,
    null,
  ])("rejects %s", (value) =>
    expect(isSafeRelativePath(value as string)).toBe(false),
  )
})

describe("safeRedirectPath", () => {
  it("keeps a safe path", () => expect(safeRedirectPath("/app")).toBe("/app"))
  it("falls back to /app for anything else", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/app")
    expect(safeRedirectPath(undefined)).toBe("/app")
  })
})

describe("resolveRedirect", () => {
  const site = "http://127.0.0.1:3000"
  it("prefers the relative path", () =>
    expect(resolveRedirect("/app", site)).toBe("/app"))
  it("accepts an absolute URL only on the exact own origin", () => {
    expect(resolveRedirect("http://127.0.0.1:3000/app?x=1", site)).toBe(
      "/app?x=1",
    )
  })
  it("rejects a protocol-relative path smuggled through the own origin (covers: AC-9)", () => {
    // URL parsing keeps the leading double slash, so without the re-check these
    // come back as "//evil.example" and the browser leaves the site after login.
    expect(resolveRedirect("http://127.0.0.1:3000//evil.example", site)).toBe(
      "/app",
    )
    expect(resolveRedirect("http://127.0.0.1:3000/\\evil.example", site)).toBe(
      "/app",
    )
  })
  it("rejects lookalike origins and off-site absolute URLs", () => {
    expect(resolveRedirect("http://127.0.0.1:3000.evil.com/app", site)).toBe(
      "/app",
    )
    expect(resolveRedirect("https://evil.com/app", site)).toBe("/app")
    expect(resolveRedirect("javascript:alert(1)", site)).toBe("/app")
  })
})
