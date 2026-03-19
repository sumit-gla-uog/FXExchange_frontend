import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useOrders } from "../../../hooks/customer/useOrders"

vi.mock("swr", () => ({ default: vi.fn() }))
vi.mock("@/api/swr", () => ({ fetcher: vi.fn() }))

import useSWR from "swr"
const mockUseSWR = vi.mocked(useSWR)

const mockOrders = [
  { id: 1, pair: "GBP/USD", side: "buy"  as const, amount: "1000", limit_rate: "1.2900", status: "open"      as const, created_at: "2026-03-17T10:00:00Z", updated_at: "2026-03-17T10:00:00Z" },
  { id: 2, pair: "GBP/EUR", side: "sell" as const, amount: "500",  limit_rate: "1.1700", status: "filled"    as const, created_at: "2026-03-16T10:00:00Z", updated_at: "2026-03-16T11:00:00Z" },
  { id: 3, pair: "GBP/JPY", side: "buy"  as const, amount: "200",  limit_rate: "190.00", status: "cancelled" as const, created_at: "2026-03-15T10:00:00Z", updated_at: "2026-03-15T12:00:00Z" },
]

const mockTrades = [
  { id: 1, pair: "GBP/USD", side: "buy" as const, amount: "500", rate: "1.2850", total: "642.50", executed_at: "2026-03-17T09:00:00Z" },
  { id: 2, pair: "GBP/EUR", side: "sell" as const, amount: "300", rate: "1.1800", total: "354.00", executed_at: "2026-03-16T09:00:00Z" },
]

describe("useOrders", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSWR
      .mockReturnValueOnce({ data: { orders: mockOrders }, isLoading: false } as any)
      .mockReturnValueOnce({ data: { trades: mockTrades }, isLoading: false } as any)
  })

  describe("loading", () => {
    it("isLoading true when orders not yet loaded", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: undefined, isLoading: true  } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false } as any)
      const { result } = renderHook(() => useOrders("all"))
      expect(result.current.isLoading).toBe(true)
    })

    it("isLoading true when trades not yet loaded", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: { orders: mockOrders }, isLoading: false } as any)
        .mockReturnValueOnce({ data: undefined,              isLoading: true  } as any)
      const { result } = renderHook(() => useOrders("all"))
      expect(result.current.isLoading).toBe(true)
    })

    it("isLoading false when both loaded", () => {
      const { result } = renderHook(() => useOrders("all"))
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe("counts", () => {
    it("counts all orders and trades", () => {
      const { result } = renderHook(() => useOrders("all"))
      expect(result.current.counts.all).toBe(5) // 3 orders + 2 trades
    })

    it("counts open orders", () => {
      const { result } = renderHook(() => useOrders("all"))
      expect(result.current.counts.open).toBe(1)
    })

    it("counts filled orders including market trades", () => {
      const { result } = renderHook(() => useOrders("all"))
      expect(result.current.counts.filled).toBe(3) // 1 filled order + 2 market trades
    })

    it("counts cancelled orders", () => {
      const { result } = renderHook(() => useOrders("all"))
      expect(result.current.counts.cancelled).toBe(1)
    })
  })

  describe("activeOrders filtering", () => {
    it("returns all for tab all", () => {
      const { result } = renderHook(() => useOrders("all"))
      expect(result.current.activeOrders).toHaveLength(5)
    })

    it("returns only open orders for tab open", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: { orders: mockOrders }, isLoading: false } as any)
        .mockReturnValueOnce({ data: { trades: mockTrades }, isLoading: false } as any)
      const { result } = renderHook(() => useOrders("open"))
      expect(result.current.activeOrders).toHaveLength(1)
      expect(result.current.activeOrders[0].status).toBe("open")
    })

    it("returns filled orders and market trades for tab filled", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: { orders: mockOrders }, isLoading: false } as any)
        .mockReturnValueOnce({ data: { trades: mockTrades }, isLoading: false } as any)
      const { result } = renderHook(() => useOrders("filled"))
      expect(result.current.activeOrders).toHaveLength(3) // 1 filled + 2 trades
    })

    it("returns only cancelled orders for tab cancelled", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: { orders: mockOrders }, isLoading: false } as any)
        .mockReturnValueOnce({ data: { trades: mockTrades }, isLoading: false } as any)
      const { result } = renderHook(() => useOrders("cancelled"))
      expect(result.current.activeOrders).toHaveLength(1)
      expect(result.current.activeOrders[0].status).toBe("cancelled")
    })
  })

  describe("normalized trades", () => {
    it("normalizes market trades with filled status", () => {
      const { result } = renderHook(() => useOrders("all"))
      const trade = result.current.activeOrders.find(o => o.id === "m-1")
      expect(trade?.status).toBe("filled")
    })

    it("normalizes market trades with market type", () => {
      const { result } = renderHook(() => useOrders("all"))
      const trade = result.current.activeOrders.find(o => o.id === "m-1")
      expect((trade as any)?.type).toBe("market")
    })
  })

})