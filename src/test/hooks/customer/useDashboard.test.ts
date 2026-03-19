import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useDashboard } from "../../../hooks/customer/useDashboard"

vi.mock("swr", () => ({ default: vi.fn() }))
vi.mock("@/api/swr", () => ({ fetcher: vi.fn() }))

import useSWR from "swr"
const mockUseSWR = vi.mocked(useSWR)

const mockSummary = { portfolio_value_gbp: "24477.80", num_currencies: 5, change_24h_pct: "1.2", change_24h_gbp: "300" }
const mockSnapshot = { market_snapshot: [{ pair: "GBP/USD", base_flag: "gbp", quote_flag: "usd", rate: "1.2850", change_pct: "0.45" }] }
const mockPortfolio = { holdings: [{ currency: { code: "GBP", name: "British Pound", symbol: "£", flag: "gbp" }, amount: "10000.00", avg_buy_rate: "1", gbp_value: "10000.00" }], total_value_gbp: "24477.80" }
const mockOrders = { orders: [{ id: 1, status: "open" }, { id: 2, status: "open" }] }

describe("useDashboard", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSWR
      .mockReturnValueOnce({ data: mockSummary, isLoading: false, error: undefined } as any)
      .mockReturnValueOnce({ data: mockSnapshot, isLoading: false, error: undefined } as any)
      .mockReturnValueOnce({ data: mockPortfolio,isLoading: false, error: undefined } as any)
      .mockReturnValueOnce({ data: mockOrders, sLoading: false, error: undefined } as any)
  })

  describe("data", () => {
    it("returns summary data", () => {
      const { result } = renderHook(() => useDashboard())
      expect(result.current.summary).toEqual(mockSummary)
    })

    it("returns snapshot data", () => {
      const { result } = renderHook(() => useDashboard())
      expect(result.current.snapshot).toEqual(mockSnapshot)
    })

    it("returns portfolio data", () => {
      const { result } = renderHook(() => useDashboard())
      expect(result.current.portfolio).toEqual(mockPortfolio)
    })

    it("returns open orders count", () => {
      const { result } = renderHook(() => useDashboard())
      expect(result.current.openOrders).toBe(2)
    })

    it("returns 0 open orders when no orders data", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: mockSummary,  isLoading: false, error: undefined } as any)
        .mockReturnValueOnce({ data: mockSnapshot,  isLoading: false, error: undefined } as any)
        .mockReturnValueOnce({ data: mockPortfolio, isLoading: false, error: undefined } as any)
        .mockReturnValueOnce({ data: undefined,     isLoading: false, error: undefined } as any)
      const { result } = renderHook(() => useDashboard())
      expect(result.current.openOrders).toBe(0)
    })
  })

  describe("gbpHolding", () => {
    it("finds GBP holding from portfolio", () => {
      const { result } = renderHook(() => useDashboard())
      expect(result.current.gbpHolding?.currency.code).toBe("GBP")
    })

    it("returns undefined when no GBP holding", () => {
      mockUseSWR.mockReset()
      const portfolioNoGbp = { holdings: [{ currency: { code: "USD", name: "US Dollar", symbol: "$", flag: "usd" }, amount: "500.00", avg_buy_rate: "1.28", gbp_value: "390.00" }], total_value_gbp: "390.00" }
      mockUseSWR
        .mockReturnValueOnce({ data: mockSummary,    isLoading: false, error: undefined } as any)
        .mockReturnValueOnce({ data: mockSnapshot,   isLoading: false, error: undefined } as any)
        .mockReturnValueOnce({ data: portfolioNoGbp, isLoading: false, error: undefined } as any)
        .mockReturnValueOnce({ data: mockOrders,     isLoading: false, error: undefined } as any)
      const { result } = renderHook(() => useDashboard())
      expect(result.current.gbpHolding).toBeUndefined()
    })
  })

  describe("isApiOnline", () => {
    it("returns true when no summary error", () => {
      const { result } = renderHook(() => useDashboard())
      expect(result.current.isApiOnline).toBe(true)
    })

    it("returns false when summary has error", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: undefined, isLoading: false, error: new Error("Network error") } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false, error: undefined } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false, error: undefined } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false, error: undefined } as any)
      const { result } = renderHook(() => useDashboard())
      expect(result.current.isApiOnline).toBe(false)
    })
  })

  describe("loading states", () => {
    it("returns loadingSummary true when fetching", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: undefined, isLoading: true,  error: undefined } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false, error: undefined } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false, error: undefined } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false, error: undefined } as any)
      const { result } = renderHook(() => useDashboard())
      expect(result.current.loadingSummary).toBe(true)
    })

    it("returns loadingSnapshot true when fetching", () => {
      mockUseSWR.mockReset()
      mockUseSWR
        .mockReturnValueOnce({ data: undefined, isLoading: false, error: undefined } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: true,  error: undefined } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false, error: undefined } as any)
        .mockReturnValueOnce({ data: undefined, isLoading: false, error: undefined } as any)
      const { result } = renderHook(() => useDashboard())
      expect(result.current.loadingSnapshot).toBe(true)
    })
  })

  describe("endpoints", () => {
    it("calls correct SWR endpoints", () => {
      renderHook(() => useDashboard())
      expect(mockUseSWR).toHaveBeenCalledWith("/api/v1/dashboard/summary/",          expect.any(Function))
      expect(mockUseSWR).toHaveBeenCalledWith("/api/v1/dashboard/market-snapshot/",  expect.any(Function))
      expect(mockUseSWR).toHaveBeenCalledWith("/api/v1/portfolio/",                  expect.any(Function))
      expect(mockUseSWR).toHaveBeenCalledWith("/api/v1/orders/?status=open",         expect.any(Function))
    })
  })

})