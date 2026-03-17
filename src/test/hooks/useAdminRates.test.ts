import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useAdminRates } from "../../../src/hooks/admin/useAdminRates"

vi.mock("swr", () => ({
  default: vi.fn(),
  mutate: vi.fn(),
}))

vi.mock("@/api/swr", () => ({
  fetcher: vi.fn(),
}))

vi.mock("@/api/client", () => ({
  apiFetch: vi.fn().mockResolvedValue({}),
}))

import useSWR, { mutate } from "swr"
import { apiFetch } from "@/api/client"

const mockUseSWR   = vi.mocked(useSWR)
const mockMutate   = vi.mocked(mutate)
const mockApiFetch = vi.mocked(apiFetch)

const mockDashData = {
  total_currencies: 11,
  total_rates: 13,
  stale_rates: 2,
  unavailable_rates: 0,
  api_status: "ok",
  last_check: "2026-03-17T10:00:00Z",
  uptime_pct: "99.9",
}

const mockRates = [
  { id: 1, pair: "GBP/USD", pair_id: 1, rate: "1.2850", source: "api", updated_by: "system", as_of: "2026-03-17T10:00:00Z" },
  { id: 2, pair: "GBP/EUR", pair_id: 2, rate: "1.1800", source: "manual", updated_by: "admin", as_of: "2026-03-17T09:00:00Z" },
]

const mockPairs = [
  { id: 1, pair: "GBP/USD", rate: "1.2850" },
  { id: 2, pair: "GBP/EUR", rate: "1.1800" },
]

describe("useAdminRates", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSWR
      .mockReturnValueOnce({ data: mockDashData, isLoading: false } as any)
      .mockReturnValueOnce({ data: { rates: mockRates }, isLoading: false } as any)
      .mockReturnValueOnce({ data: { pairs: mockPairs }, isLoading: false } as any)
  })

  describe("data fetching", () => {
    it("returns dashData", () => {
      const { result } = renderHook(() => useAdminRates())
      expect(result.current.dashData).toEqual(mockDashData)
    })

    it("returns rates list", () => {
      const { result } = renderHook(() => useAdminRates())
      expect(result.current.rates).toEqual(mockRates)
    })

    it("returns pairs list", () => {
      const { result } = renderHook(() => useAdminRates())
      expect(result.current.pairs).toEqual(mockPairs)
    })

    it("returns empty rates array when data undefined", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: undefined, isLoading: true } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: true } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false } as any)
      const { result } = renderHook(() => useAdminRates())
      expect(result.current.rates).toEqual([])
    })

    it("returns empty pairs array when data undefined", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: undefined, isLoading: false } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false } as any)
      const { result } = renderHook(() => useAdminRates())
      expect(result.current.pairs).toEqual([])
    })

    it("calls dashboard endpoint with refreshInterval", () => {
      renderHook(() => useAdminRates())
      expect(mockUseSWR).toHaveBeenCalledWith(
        "/api/v1/admin/dashboard/",
        expect.any(Function),
        expect.objectContaining({ refreshInterval: 30000 })
      )
    })
  })

  describe("handleManualUpdate", () => {
    it("calls apiFetch with correct endpoint", async () => {
      const { result } = renderHook(() => useAdminRates())
      await act(async () => {
        await result.current.handleManualUpdate({ pair_id: "1", rate: "1.3000" })
      })
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/api/v1/admin/rates/manual/",
        expect.objectContaining({ method: "POST", auth: true })
      )
    })

    it("parses pair_id as integer in request body", async () => {
      const { result } = renderHook(() => useAdminRates())
      await act(async () => {
        await result.current.handleManualUpdate({ pair_id: "2", rate: "1.1900" })
      })
      const body = JSON.parse((mockApiFetch.mock.calls[0][1] as any).body)
      expect(body.pair_id).toBe(2)
      expect(typeof body.pair_id).toBe("number")
    })

    it("mutates rates and dashboard after update", async () => {
      const { result } = renderHook(() => useAdminRates())
      await act(async () => {
        await result.current.handleManualUpdate({ pair_id: "1", rate: "1.3000" })
      })
      expect(mockMutate).toHaveBeenCalledWith("/api/v1/admin/rates/")
      expect(mockMutate).toHaveBeenCalledWith("/api/v1/admin/dashboard/")
    })

    it("throws when apiFetch fails", async () => {
      mockApiFetch.mockRejectedValueOnce(new Error("Update failed"))
      const { result } = renderHook(() => useAdminRates())
      await expect(
        result.current.handleManualUpdate({ pair_id: "1", rate: "1.3000" })
      ).rejects.toThrow("Update failed")
    })
  })

  describe("handleCsvUpload", () => {
    const mockFile = new File(["GBP/USD,1.2850"], "rates.csv", { type: "text/csv" })

    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ updated: 5, errors: [] }),
      }) as any
    })

    it("calls fetch with correct URL", async () => {
      const { result } = renderHook(() => useAdminRates())
      await act(async () => {
        await result.current.handleCsvUpload(mockFile, "https://api.example.com")
      })
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/api/v1/admin/rates/csv/",
        expect.objectContaining({ method: "POST" })
      )
    })

    it("returns updated count and errors", async () => {
      const { result } = renderHook(() => useAdminRates())
      let uploadResult: any
      await act(async () => {
        uploadResult = await result.current.handleCsvUpload(mockFile, "")
      })
      expect(uploadResult.updated).toBe(5)
      expect(uploadResult.errors).toEqual([])
    })

    it("returns errors when CSV has issues", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ updated: 2, errors: [{ pair: "INVALID", error: "Not found" }] }),
      }) as any
      const { result } = renderHook(() => useAdminRates())
      let uploadResult: any
      await act(async () => {
        uploadResult = await result.current.handleCsvUpload(mockFile, "")
      })
      expect(uploadResult.errors).toHaveLength(1)
      expect(uploadResult.updated).toBe(2)
    })

    it("mutates rates and dashboard after upload", async () => {
      const { result } = renderHook(() => useAdminRates())
      await act(async () => {
        await result.current.handleCsvUpload(mockFile, "")
      })
      expect(mockMutate).toHaveBeenCalledWith("/api/v1/admin/rates/")
      expect(mockMutate).toHaveBeenCalledWith("/api/v1/admin/dashboard/")
    })
  })

  describe("refreshRates", () => {
    it("calls mutate on rates endpoint", () => {
      const { result } = renderHook(() => useAdminRates())
      act(() => { result.current.refreshRates() })
      expect(mockMutate).toHaveBeenCalledWith("/api/v1/admin/rates/")
    })
  })

})