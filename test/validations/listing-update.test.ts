import { describe, expect, it } from "vitest"
import { validateListingUpdate } from "@/lib/validations/listing"

describe("validateListingUpdate", () => {
  it("allows partial updates without type or period", () => {
    const error = validateListingUpdate(
      { type: "rent", period: "month" },
      { title: "New Title" },
    )

    expect(error).toBeNull()
  })

  it("requires period when updating to short-let", () => {
    const error = validateListingUpdate(
      { type: "rent", period: "month" },
      { type: "short_let", period: "month" },
    )

    expect(error).toBe("Short-let listings must be per night")
  })

  it("rejects period for sale listings", () => {
    const error = validateListingUpdate(
      { type: "sale", period: null },
      { period: "month" },
    )

    expect(error).toBe("Period should not be set for sale listings")
  })

  it("allows clearing period when switching to sale", () => {
    const error = validateListingUpdate(
      { type: "rent", period: "month" },
      { type: "sale", period: undefined },
    )

    expect(error).toBeNull()
  })
})
