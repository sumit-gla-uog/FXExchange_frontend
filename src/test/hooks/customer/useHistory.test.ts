import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useHistory } from "../../../hooks/customer/useHistory"

vi.mock("swr", () => ({ default: vi.fn() }))
vi.mock("@/api/swr", () => ({ fetcher: vi.fn() }))
vi.mock("@/api/client", () => ({ apiFetch: vi.fn().mockResolvedValue(new Blob(["csv data"])) }))

import useSWR from "swr"
const mockUseSWR = vi.mocked(useSWR)

const mockTrades = [
  { id: 1, pair: "GBP/USD", side: "buy"  as const, amount: "1000", rate: "1.2850", total: "1285.00", executed_at: "2026-03-17T10:00:00Z" },
  { id: 2, pair: "GBP/USD", side: "sell" as const, amount: "500",  rate: "1.2900", total: "645.00",  executed_at: "2026-03-16T10:00:00Z" },
  { id: 3, pair: "GBP/EUR", side: "buy"  as const, amount: "800",  rate: "1.1800", total: "944.00",  executed_at: "2026-03-15T10:00:00Z" },
]

const mockOrders = [
  { id: 1, pair: "GBP/JPY", side: "buy" as const, amount: "200", limit_rate: "190.00", status: "filled" as const,    created_at: "2026-03-14T10:00:00Z", updated_at: "2026-03-14T11:00:00Z" },
  { id: 2, pair: "GBP/USD", side: "buy" as const, amount: "300", limit_rate: "1.2800", status: "cancelled" as const,  created_at: "2026-03-13T10:00:00Z", updated_at: "2026-03-13T12:00:00Z" },
]

describe("useHistory", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSWR
      .mockReturnValueOnce({ data: { trades: mockTrades }, isLoading: false } as any)
      .mockReturnValueOnce({ data: { orders: mockOrders }, isLoading: false } as any)
  })

  describe("loading", () => {
    it("returns isLoading true when trades loading", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: undefined,              isLoading: true  } as any)
        .mockReturnValueOnce({ data: { orders: mockOrders }, isLoading: false } as any)
      const { result } = renderHook(() => useHistory(""))
      expect(result.current.isLoading).toBe(true)
    })

    it("returns isLoading false when both loaded", () => {
      const { result } = renderHook(() => useHistory(""))
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe("stats", () => {
    it("counts total trades correctly", () => {
      const { result } = renderHook(() => useHistory(""))
      expect(result.current.stats.totalTrades).toBe(5) // 3 market + 2 limit
    })

    it("counts market trades", () => {
      const { result } = renderHook(() => useHistory(""))
      expect(result.current.stats.marketCount).toBe(3)
    })

    it("counts limit orders", () => {
      const { result } = renderHook(() => useHistory(""))
      expect(result.current.stats.limitCount).toBe(2)
    })

    it("calculates total volume from market trades amounts", () => {
      const { result } = renderHook(() => useHistory(""))
      expect(result.current.stats.totalVolumeGBP).toBe(2300) // 1000 + 500 + 800
    })

    it("finds most traded pair", () => {
      const { result } = renderHook(() => useHistory(""))
      expect(result.current.stats.mostTraded).toBe("GBP/USD") // appears 3 times
    })

    it("returns — for mostTraded when no rows", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: { trades: [] }, isLoading: false } as any)
        .mockReturnValueOnce({ data: { orders: [] }, isLoading: false } as any)
      const { result } = renderHook(() => useHistory(""))
      expect(result.current.stats.mostTraded).toBe("—")
    })
  })

  describe("filteredRows", () => {
    it("returns all rows when search is empty", () => {
      const { result } = renderHook(() => useHistory(""))
      expect(result.current.filteredRows).toHaveLength(5)
    })

    it("filters rows by pair search", () => {
      const { result } = renderHook(() => useHistory("eur"))
      expect(result.current.filteredRows).toHaveLength(1)
      expect(result.current.filteredRows[0].pair).toBe("GBP/EUR")
    })

    it("search is case insensitive", () => {
      const { result } = renderHook(() => useHistory("GBP/USD"))
      expect(result.current.filteredRows).toHaveLength(3)
    })

    it("returns empty array when search has no matches", () => {
      const { result } = renderHook(() => useHistory("xyz"))
      expect(result.current.filteredRows).toHaveLength(0)
    })

    it("sorts rows by date descending", () => {
      const { result } = renderHook(() => useHistory(""))
      const dates = result.current.filteredRows.map(r => new Date(r.date).getTime())
      expect(dates).toEqual([...dates].sort((a, b) => b - a))
    })
  })

  describe("handleExport", () => {
    it("calls apiFetch with export endpoint", async () => {
      const { apiFetch } = await import("@/api/client")
      const { result } = renderHook(() => useHistory(""))
      await act(async () => { await result.current.handleExport() })
      expect(apiFetch).toHaveBeenCalledWith("/api/v1/trades/export/", expect.objectContaining({ auth: true }))
    })
  })

})