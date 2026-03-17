import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { usePortfolio } from "../../../hooks/customer/usePortfolio"

vi.mock("swr", () => ({ default: vi.fn() }))
vi.mock("@/api/swr", () => ({ fetcher: vi.fn() }))

import useSWR from "swr"
const mockUseSWR = vi.mocked(useSWR)

const mockPortfolio = {
  holdings: [
    { currency: { code: "GBP", name: "British Pound", symbol: "£", flag: "gbp" }, amount: "10000.00", avg_buy_rate: "1",      gbp_value: "10000.00" },
    { currency: { code: "USD", name: "US Dollar",     symbol: "$", flag: "usd" }, amount: "5000.00",  avg_buy_rate: "1.2850", gbp_value: "3891.05" },
  ],
  total_value_gbp: "13891.05",
}

const mockSnapshot = {
  market_snapshot: [
    { pair: "GBP/USD", rate: "1.2850", change_pct: "0.45" },
    { pair: "USD/GBP", rate: "0.7782", change_pct: "-0.45" },
  ],
}

describe("usePortfolio", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSWR
      .mockReturnValueOnce({ data: mockPortfolio, isLoading: false } as any)
      .mockReturnValueOnce({ data: mockSnapshot,  isLoading: false } as any)
  })

  describe("data", () => {
    it("returns portfolio data", () => {
      const { result } = renderHook(() => usePortfolio())
      expect(result.current.portfolio).toEqual(mockPortfolio)
    })

    it("returns total value as number", () => {
      const { result } = renderHook(() => usePortfolio())
      expect(result.current.totalValue).toBe(13891.05)
    })

    it("returns total holdings count", () => {
      const { result } = renderHook(() => usePortfolio())
      expect(result.current.totalHoldings).toBe(2)
    })

    it("returns 0 totalValue when portfolio undefined", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: undefined, isLoading: true  } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false } as any)
      const { result } = renderHook(() => usePortfolio())
      expect(result.current.totalValue).toBe(0)
    })

    it("returns 0 totalHoldings when portfolio undefined", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: undefined, isLoading: true  } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false } as any)
      const { result } = renderHook(() => usePortfolio())
      expect(result.current.totalHoldings).toBe(0)
    })

    it("returns isLoading true while fetching", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: undefined, isLoading: true  } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false } as any)
      const { result } = renderHook(() => usePortfolio())
      expect(result.current.isLoading).toBe(true)
    })
  })

  describe("rowData", () => {
    it("returns rowData with amount_num parsed", () => {
      const { result } = renderHook(() => usePortfolio())
      expect(result.current.rowData[0].amount_num).toBe(10000)
      expect(result.current.rowData[1].amount_num).toBe(5000)
    })

    it("returns rowData with gbp_value_num parsed", () => {
      const { result } = renderHook(() => usePortfolio())
      expect(result.current.rowData[0].gbp_value_num).toBe(10000)
    })

    it("returns 0 gbp_value_num when gbp_value is null", () => {
      mockUseSWR.mockReset()
      const portfolioWithNull = {
        ...mockPortfolio,
        holdings: [{ ...mockPortfolio.holdings[0], gbp_value: null }],
      }
      mockUseSWR
        .mockReturnValueOnce({ data: portfolioWithNull, isLoading: false } as any)
        .mockReturnValueOnce({ data: mockSnapshot,      isLoading: false } as any)
      const { result } = renderHook(() => usePortfolio())
      expect(result.current.rowData[0].gbp_value_num).toBe(0)
    })

    it("returns change_pct for currencies in snapshot", () => {
      const { result } = renderHook(() => usePortfolio())
      const usdRow = result.current.rowData.find(r => r.currency.code === "USD")
      // hook matches GBP/USD (endsWith /USD) returning +0.45
      expect(usdRow?.change_pct).toBe(0.45)
    })

    it("returns null change_pct when not in snapshot", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: mockPortfolio, isLoading: false } as any)
        .mockReturnValueOnce({ data: undefined,     isLoading: false } as any)
      const { result } = renderHook(() => usePortfolio())
      expect(result.current.rowData[0].change_pct).toBeNull()
    })

    it("returns empty rowData when no portfolio", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: undefined, isLoading: false } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false } as any)
      const { result } = renderHook(() => usePortfolio())
      expect(result.current.rowData).toEqual([])
    })
  })

})