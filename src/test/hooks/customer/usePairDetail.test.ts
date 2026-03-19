import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { usePairDetail } from "../../../hooks/customer/usePairDetail"

vi.mock("swr", () => ({ default: vi.fn() }))
vi.mock("@/api/swr", () => ({ fetcher: vi.fn() }))

import useSWR from "swr"
const mockUseSWR = vi.mocked(useSWR)

const mockPair = {
  id: 1,
  pair: "GBP/USD",
  base:  { code: "GBP", name: "British Pound", symbol: "£", flag: "gbp" },
  quote: { code: "USD", name: "US Dollar",     symbol: "$", flag: "usd" },
  rate: "1.2850",
  change_pct: "0.45",
}

const mockHistory = {
  pair: "GBP/USD",
  period: "1d",
  history: [
    { rate: "1.2800", recorded_at: "2026-03-17T08:00:00Z" },
    { rate: "1.2850", recorded_at: "2026-03-17T10:00:00Z" },
    { rate: "1.2820", recorded_at: "2026-03-17T09:00:00Z" },
  ],
}

const mockTrades = [
  { id: 1, pair: "GBP/USD", side: "buy",  amount: "1000", rate: "1.2850", total: "1285.00", executed_at: "2026-03-17T10:00:00Z" },
  { id: 2, pair: "GBP/USD", side: "buy",  amount: "500",  rate: "1.2900", total: "645.00",  executed_at: "2026-03-16T10:00:00Z" },
  { id: 3, pair: "GBP/EUR", side: "sell", amount: "300",  rate: "1.1800", total: "354.00",  executed_at: "2026-03-15T10:00:00Z" },
]

const mockPortfolio = {
  holdings: [{ currency: { code: "GBP" }, amount: "10000.00", gbp_value: "10000.00" }],
  total_value_gbp: "10000.00",
}

describe("usePairDetail", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSWR
      .mockReturnValueOnce({ data: { trades: mockTrades },   isLoading: false } as any)
      .mockReturnValueOnce({ data: { pair: mockPair },        isLoading: false } as any)
      .mockReturnValueOnce({ data: mockHistory,               isLoading: false } as any)
      .mockReturnValueOnce({ data: mockPortfolio,             isLoading: false } as any)
  })

  describe("pair data", () => {
    it("returns pair from latestData", () => {
      const { result } = renderHook(() => usePairDetail("1", "1d"))
      expect(result.current.pair).toEqual(mockPair)
    })

    it("returns undefined pair when loading", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: undefined, isLoading: false } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: true  } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false } as any)
      const { result } = renderHook(() => usePairDetail("1", "1d"))
      expect(result.current.pair).toBeUndefined()
      expect(result.current.loadingPair).toBe(true)
    })

    it("returns portfolio", () => {
      const { result } = renderHook(() => usePairDetail("1", "1d"))
      expect(result.current.portfolio).toEqual(mockPortfolio)
    })
  })

  describe("trade stats", () => {
    it("filters trades for current pair only", () => {
      const { result } = renderHook(() => usePairDetail("1", "1d"))
      expect(result.current.pairTrades).toHaveLength(2) // only GBP/USD trades
    })

    it("counts buy trades", () => {
      const { result } = renderHook(() => usePairDetail("1", "1d"))
      expect(result.current.buyCount).toBe(2)
    })

    it("counts sell trades", () => {
      const { result } = renderHook(() => usePairDetail("1", "1d"))
      expect(result.current.sellCount).toBe(0)
    })

    it("sums total volume", () => {
      const { result } = renderHook(() => usePairDetail("1", "1d"))
      expect(result.current.totalVolume).toBe(1500) // 1000 + 500
    })

    it("returns zero stats when no pair trades", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: { trades: [] }, isLoading: false } as any)
        .mockReturnValueOnce({ data: { pair: mockPair }, isLoading: false } as any)
        .mockReturnValueOnce({ data: mockHistory,        isLoading: false } as any)
        .mockReturnValueOnce({ data: mockPortfolio,      isLoading: false } as any)
      const { result } = renderHook(() => usePairDetail("1", "1d"))
      expect(result.current.buyCount).toBe(0)
      expect(result.current.sellCount).toBe(0)
      expect(result.current.totalVolume).toBe(0)
    })
  })

  describe("chart data", () => {
    it("returns history array", () => {
      const { result } = renderHook(() => usePairDetail("1", "1d"))
      expect(result.current.history).toHaveLength(3)
    })

    it("converts history to chartData [timestamp, rate] pairs", () => {
      const { result } = renderHook(() => usePairDetail("1", "1d"))
      expect(result.current.chartData[0]).toHaveLength(2)
      expect(typeof result.current.chartData[0][0]).toBe("number") // timestamp
      expect(typeof result.current.chartData[0][1]).toBe("number") // rate
    })

    it("calculates todayHigh from chart data", () => {
      const { result } = renderHook(() => usePairDetail("1", "1d"))
      expect(result.current.todayHigh).toBe(1.285)
    })

    it("calculates todayLow from chart data", () => {
      const { result } = renderHook(() => usePairDetail("1", "1d"))
      expect(result.current.todayLow).toBe(1.28)
    })

    it("returns 0 for todayHigh and todayLow when no history", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: { trades: [] }, isLoading: false } as any)
        .mockReturnValueOnce({ data: { pair: mockPair },isLoading: false } as any)
        .mockReturnValueOnce({ data: { ...mockHistory,history: [] },isLoading: false } as any)
        .mockReturnValueOnce({ data: mockPortfolio,isLoading: false } as any)
      const { result } = renderHook(() => usePairDetail("1", "1d"))
      expect(result.current.todayHigh).toBe(0)
      expect(result.current.todayLow).toBe(0)
    })

    it("returns empty chartData when no history", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: { trades: [] }, isLoading: false } as any)
        .mockReturnValueOnce({ data: { pair: mockPair }, isLoading: false } as any)
        .mockReturnValueOnce({ data: { ...mockHistory, history: [] },isLoading: false } as any)
        .mockReturnValueOnce({ data: mockPortfolio,  isLoading: false } as any)
      const { result } = renderHook(() => usePairDetail("1", "1d"))
      expect(result.current.chartData).toEqual([])
    })
  })

  describe("endpoints", () => {
    it("calls latest endpoint with correct id", () => {
      renderHook(() => usePairDetail("5", "1d"))
      expect(mockUseSWR).toHaveBeenCalledWith(
        "/api/v1/pairs/5/latest/",
        expect.any(Function),
        expect.objectContaining({ refreshInterval: 30000 })
      )
    })

    it("calls history endpoint with correct id and period", () => {
      renderHook(() => usePairDetail("5", "1w"))
      expect(mockUseSWR).toHaveBeenCalledWith(
        "/api/v1/pairs/5/history/?period=1w",
        expect.any(Function)
      )
    })
  })

})