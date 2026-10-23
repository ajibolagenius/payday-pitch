// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, cleanup } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { PitchTour } from "@/components/walk/pitch-tour"

afterEach(cleanup)

const driver = vi.hoisted(() => vi.fn())
vi.mock("driver.js", () => ({ driver }))

// Spec 0007 AC-7: the tour runs once, says nothing about money, and only
// marks itself seen when the person actually ends it.

const SEEN_KEY = "pp.pitch-tour.seen"
let reduceMotion = false

beforeEach(() => {
  driver.mockReset()
  driver.mockImplementation(() => ({
    drive: vi.fn(),
    isActive: () => false,
    destroy: vi.fn(),
  }))
  localStorage.clear()
  reduceMotion = false
  vi.stubGlobal("matchMedia", (query: string) => ({
    query,
    get matches() {
      return reduceMotion
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: () => false,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }))
})

function mountTour(withPitch: boolean) {
  const utils = render(
    <div>
      {withPitch ? <div data-slot-key="GK-0" /> : null}
      <PitchTour />
    </div>,
  )
  return utils
}

function tourConfig() {
  return driver.mock.calls[0]![0] as Parameters<typeof driver>[0]
}

describe("PitchTour gating (AC-7)", () => {
  it("starts once when the pitch is on screen", () => {
    mountTour(true)
    expect(driver).toHaveBeenCalledTimes(1)
    const config = tourConfig()
    expect(config.steps).toHaveLength(5)
    expect(config.steps[0].element).toBe('[data-slot-key="GK-0"]')
    expect(config.allowClose).toBe(true)
  })

  it("does not start again once the flag is set", () => {
    localStorage.setItem(SEEN_KEY, "1")
    mountTour(true)
    expect(driver).not.toHaveBeenCalled()
  })

  it("waits when no pitch is rendered, and stays owed", () => {
    mountTour(false)
    expect(driver).not.toHaveBeenCalled()
    expect(localStorage.getItem(SEEN_KEY)).toBeNull()
  })
})

describe("PitchTour motion (AC-7)", () => {
  it("animates by default", () => {
    mountTour(true)
    expect(tourConfig().animate).toBe(true)
    expect(tourConfig().smoothScroll).toBe(true)
  })

  it("drops animation under prefers-reduced-motion", () => {
    reduceMotion = true
    mountTour(true)
    expect(tourConfig().animate).toBe(false)
    expect(tourConfig().smoothScroll).toBe(false)
  })
})

describe("PitchTour seen flag (AC-7)", () => {
  it("marks seen when the person closes, skips, or finishes", () => {
    mountTour(true)
    tourConfig().onDestroyed(null, 0, { reason: "close" })
    expect(localStorage.getItem(SEEN_KEY)).toBe("1")
  })

  it("does not mark seen when the tour is destroyed by the app itself", () => {
    mountTour(true)
    tourConfig().onDestroyed(null, 0, { reason: "api" })
    tourConfig().onDestroyed(null, 0, { reason: "replaced" })
    expect(localStorage.getItem(SEEN_KEY)).toBeNull()
  })

  it("survives a throwing localStorage: the tour still runs, no crash", () => {
    vi.spyOn(window.localStorage.__proto__, "getItem").mockImplementation(
      () => {
        throw new Error("SecurityError")
      },
    )
    vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(
      () => {
        throw new Error("SecurityError")
      },
    )
    mountTour(true)
    expect(driver).toHaveBeenCalledTimes(1)
    tourConfig().onDestroyed(null, 0, { reason: "close" })
    vi.restoreAllMocks()
  })
})

describe("PitchTour cleanup", () => {
  it("destroys an active tour on unmount", () => {
    const isActive = vi.fn(() => true)
    const destroy = vi.fn()
    driver.mockImplementation(() => ({ drive: vi.fn(), isActive, destroy }))
    const { unmount } = mountTour(true)
    unmount()
    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it("leaves an already dead tour alone on unmount", () => {
    const destroy = vi.fn()
    driver.mockImplementation(() => ({
      drive: vi.fn(),
      isActive: () => false,
      destroy,
    }))
    const { unmount } = mountTour(true)
    unmount()
    expect(destroy).not.toHaveBeenCalled()
  })
})
