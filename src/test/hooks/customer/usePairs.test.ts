import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { usePairs } from "../../../hooks/customer/usePairs"

vi.mock("swr", () => ({ default: vi.fn() }))
vi.mock("@/api/swr", () => ({ fetcher: vi.fn() }))

import useSWR from "swr"
const mockUseSWR = vi.mocked(useSWR)

const mockPairs = [
  { id: 1, pair: "GBP/USD", base: { code: "GBP", name: "British Pound", symbol: "£", flag: "gbp" }, quote: { code: "USD", name: "US Dollar", symbol: "$", flag: "usd" }, rate: "1.2850", change_pct: "0.45" },
  { id: 2, pair: "GBP/EUR", base: { code: "GBP", name: "British Pound", symbol: "£", flag: "gbp" }, quote: { code: "EUR", name: "Euro",       symbol: "€", flag: "eur" }, rate: "1.1800", change_pct: "-0.30" },
]

describe("usePairs", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSWR.mockReturnValue({ data: { pairs: mockPairs }, isLoading: false } as any)
  })

  describe("data", () => {
    it("returns pairs list", () => {
      const { result } = renderHook(() => usePairs(""))
      expect(result.current.pairs).toEqual(mockPairs)
    })

    it("returns empty array when data undefined", () => {
      mockUseSWR.mockReturnValue({ data: undefined, isLoading: true } as any)
      const { result } = renderHook(() => usePairs(""))
      expect(result.current.pairs).toEqual([])
    })

    it("returns isLoading true while fetching", () => {
      mockUseSWR.mockReturnValue({ data: undefined, isLoading: true } as any)
      const { result } = renderHook(() => usePairs(""))
      expect(result.current.isLoading).toBe(true)
    })
  })

  describe("search endpoint", () => {
    it("calls base endpoint when search is empty", () => {
      renderHook(() => usePairs(""))
      expect(mockUseSWR).toHaveBeenCalledWith("/api/v1/pairs/", expect.any(Function))
    })

    it("appends search param when search provided", () => {
      renderHook(() => usePairs("gbp/usd"))
      expect(mockUseSWR).toHaveBeenCalledWith("/api/v1/pairs/?search=gbp/usd", expect.any(Function))
    })
  })

  describe("rowData", () => {
    it("enriches pairs with rate_num", () => {
      const { result } = renderHook(() => usePairs(""))
      expect(result.current.rowData[0].rate_num).toBe(1.285)
      expect(result.current.rowData[1].rate_num).toBe(1.18)
    })

    it("enriches pairs with spread (0.03% of rate)", () => {
      const { result } = renderHook(() => usePairs(""))
      const expectedSpread = (1.285 * 0.0003).toFixed(4)
      expect(result.current.rowData[0].spread).toBe(expectedSpread)
    })

    it("returns empty rowData when no pairs", () => {
      mockUseSWR.mockReturnValue({ data: { pairs: [] }, isLoading: false } as any)
      const { result } = renderHook(() => usePairs(""))
      expect(result.current.rowData).toEqual([])
    })

    it("preserves original pair data in rowData", () => {
      const { result } = renderHook(() => usePairs(""))
      expect(result.current.rowData[0].pair).toBe("GBP/USD")
      expect(result.current.rowData[0].id).toBe(1)
    })
  })

})