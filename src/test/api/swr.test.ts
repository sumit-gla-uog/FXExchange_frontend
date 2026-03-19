import { describe, it, expect, vi, beforeEach } from "vitest"
import { fetcher } from "../../api/swr"

vi.mock("../../api/client", () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from "../../api/client"
const mockApiFetch = vi.mocked(apiFetch)

describe("fetcher", () => {

  beforeEach(() => { vi.clearAllMocks() })

  it("calls apiFetch with the given url", async () => {
    mockApiFetch.mockResolvedValue({ data: "ok" })
    await fetcher("/api/v1/test/")
    expect(mockApiFetch).toHaveBeenCalledWith("/api/v1/test/", { auth: true })
  })

  it("passes auth: true always", async () => {
    mockApiFetch.mockResolvedValue({})
    await fetcher("/api/v1/anything/")
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ auth: true })
    )
  })

  it("returns parsed response from apiFetch", async () => {
    const mockData = { currencies: [{ id: 1, code: "USD" }] }
    mockApiFetch.mockResolvedValue(mockData)
    const result = await fetcher("/api/v1/currencies/")
    expect(result).toEqual(mockData)
  })

  it("propagates errors from apiFetch", async () => {
    mockApiFetch.mockRejectedValue(new Error("Network error"))
    await expect(fetcher("/api/v1/test/")).rejects.toThrow("Network error")
  })

  it("works with different url paths", async () => {
    mockApiFetch.mockResolvedValue({})
    await fetcher("/api/v1/admin/dashboard/")
    expect(mockApiFetch).toHaveBeenCalledWith("/api/v1/admin/dashboard/", { auth: true })
  })

})